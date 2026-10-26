// @vitest-environment jsdom
import { GITHUB_POSTING_URL_CACHE_KEY, clearGitHubCreds } from '@/services/storage/githubStorage';
import { buildSingleItemResume } from '@/test/singleItemResume';
import {
  APPLICATION_KEY,
  DRIVE_URL_SLOTS,
  MAX_POSTING_URL_LENGTH,
  fromDriveAppProperties,
  normalizePostingUrl,
  peelBackup,
  readCachedPostingUrl,
  toDriveAppProperties,
  wrapBackupJson,
  writeCachedPostingUrl,
} from '@/utils/applicationMeta';
import { sanitizeResumeData } from '@/utils/validation';
import { beforeEach, describe, expect, it } from 'vitest';

describe('normalizePostingUrl', () => {
  it.each([
    ['jobs.example.com/42', 'https://jobs.example.com/42'],
    ['  https://jobs.example.com/42  ', 'https://jobs.example.com/42'],
    ['http://jobs.example.com', 'http://jobs.example.com/'],
    ['jobs.example.com:8443/x', 'https://jobs.example.com:8443/x'],
  ])('saves %j as %j', (raw, saved) => {
    expect(normalizePostingUrl(raw)).toBe(saved);
  });

  it.each(['', '   ', 'javascript:alert(1)', 'mailto:hr@example.com', 'not a url', 'localhost'])(
    'saves nothing for %j',
    (raw) => {
      expect(normalizePostingUrl(raw)).toBeNull();
    },
  );

  it('saves nothing past the length cap', () => {
    const long = `https://example.com/${'a'.repeat(MAX_POSTING_URL_LENGTH)}`;
    expect(normalizePostingUrl(long)).toBeNull();
  });
});

describe('the backup envelope', () => {
  it('round-trips the link and leaves the resume untouched', () => {
    const json = JSON.stringify({ basics: { name: 'Ada' } }, null, 2);
    const wrapped = wrapBackupJson(json, 'https://jobs.example.com/42');
    expect(JSON.parse(wrapped)[APPLICATION_KEY]).toEqual({
      postingUrl: 'https://jobs.example.com/42',
    });

    const { data, postingUrl } = peelBackup(JSON.parse(wrapped));
    expect(postingUrl).toBe('https://jobs.example.com/42');
    expect(data).toEqual({ basics: { name: 'Ada' } });
  });

  it('writes no key without a link', () => {
    const json = '{\n  "basics": {}\n}';
    expect(wrapBackupJson(json, null)).toBe(json);
  });

  it('pass-through drops our envelope, so a file imported from disk keeps no old link', () => {
    const resume = buildSingleItemResume('lunar');
    const wrapped = JSON.parse(wrapBackupJson(JSON.stringify(resume), 'https://x.example.com/'));
    expect(sanitizeResumeData(wrapped).sanitized.passthrough).not.toHaveProperty(APPLICATION_KEY);
  });

  it("pass-through keeps another tool's `application` block", () => {
    const resume = { ...buildSingleItemResume('lunar'), application: { status: 'sent' } };
    expect(sanitizeResumeData(resume).sanitized.passthrough?.[APPLICATION_KEY]).toEqual({
      status: 'sent',
    });
  });

  it('leaves a foreign `application` key alone', () => {
    const foreign = { basics: {}, application: { status: 'sent' } };
    expect(peelBackup(foreign)).toEqual({ data: foreign, postingUrl: null });
  });
});

describe('Drive appProperties', () => {
  it('splits a long link under the 124-byte property cap and joins it back', () => {
    const url = `https://jobs.example.com/${'x'.repeat(400)}?utm_source=a`;
    const properties = toDriveAppProperties(url);
    expect(Object.keys(properties)).toHaveLength(DRIVE_URL_SLOTS);
    for (const [key, value] of Object.entries(properties)) {
      if (value) expect(key.length + value.length).toBeLessThanOrEqual(124);
    }
    const stored = Object.fromEntries(
      Object.entries(properties).filter((entry): entry is [string, string] => !!entry[1]),
    );
    expect(fromDriveAppProperties(stored)).toBe(url);
  });

  it('stays within the 30 properties Drive allows per app', () => {
    expect(DRIVE_URL_SLOTS).toBeLessThanOrEqual(30);
  });

  it('clears every slot when there is no link', () => {
    expect(Object.values(toDriveAppProperties(null)).every((value) => value === null)).toBe(true);
    expect(fromDriveAppProperties(undefined)).toBeNull();
  });
});

describe('the GitHub sha cache', () => {
  beforeEach(() => localStorage.clear());

  it('tells a miss from a cached "no link"', () => {
    expect(readCachedPostingUrl('abc')).toBeUndefined();
    writeCachedPostingUrl('abc', null);
    expect(readCachedPostingUrl('abc')).toBeNull();
    writeCachedPostingUrl('def', 'https://jobs.example.com/1');
    expect(readCachedPostingUrl('def')).toBe('https://jobs.example.com/1');
  });

  it('re-validates what it reads, so a tampered entry never becomes an href', () => {
    localStorage.setItem(GITHUB_POSTING_URL_CACHE_KEY, '{"abc":"javascript:alert(1)"}');
    expect(readCachedPostingUrl('abc')).toBeNull();
  });

  it('leaves the device with the GitHub credentials', () => {
    writeCachedPostingUrl('abc', 'https://jobs.example.com/1');
    clearGitHubCreds();
    expect(readCachedPostingUrl('abc')).toBeUndefined();
  });

  it('survives a corrupt entry', () => {
    localStorage.setItem(GITHUB_POSTING_URL_CACHE_KEY, '{not json');
    expect(readCachedPostingUrl('abc')).toBeUndefined();
  });
});
