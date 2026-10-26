// @vitest-environment jsdom
import {
  APPLICATION_KEY,
  DRIVE_URL_SLOTS,
  GITHUB_POSTING_URL_CACHE_KEY,
  MAX_POSTING_URL_LENGTH,
  fromDriveAppProperties,
  normalizePostingUrl,
  peelBackup,
  readCachedPostingUrl,
  toDriveAppProperties,
  wrapBackupJson,
  writeCachedPostingUrl,
} from '@/hooks/cloud/applicationMeta';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { sanitizeResumeData } from '@/utils/validation';
import { beforeEach, describe, expect, it } from 'vitest';

describe('normalizePostingUrl', () => {
  it.each([
    ['jobs.example.com/42', 'https://jobs.example.com/42'],
    ['  https://jobs.example.com/42  ', 'https://jobs.example.com/42'],
    ['http://jobs.example.com', 'http://jobs.example.com/'],
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

  it('a restored backup adds nothing to passthrough', () => {
    const resume = buildSingleItemResume('lunar');
    const wrapped = JSON.parse(wrapBackupJson(JSON.stringify(resume), 'https://x.example.com/'));
    // The unpeeled file is what the guard exists for: it does keep the key.
    expect(sanitizeResumeData(wrapped).sanitized.passthrough?.[APPLICATION_KEY]).toBeDefined();
    const { data } = peelBackup(wrapped);
    expect(sanitizeResumeData(data).sanitized.passthrough?.[APPLICATION_KEY]).toBeUndefined();
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

  it('survives a corrupt entry', () => {
    localStorage.setItem(GITHUB_POSTING_URL_CACHE_KEY, '{not json');
    expect(readCachedPostingUrl('abc')).toBeUndefined();
  });
});
