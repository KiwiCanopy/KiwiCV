import { type ResumeData, initialResumeState } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { getFilteredResumeData } from '@/utils/resume-export';
import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * Every array section a user can hide an item in — the canonical inventory
 * itself, not a copy of it. The reduced export must filter all of them:
 * `privateProjects` was missing from `getFilteredResumeData` while being
 * hideable everywhere else, so hidden entries reached the "public, hostable"
 * JSON.
 *
 * This used to restate the list inline, which made the guard a copy that could
 * drift the same way the code it guards did — a section added to
 * `ALL_SECTION_KEYS` would simply not be covered here, silently.
 */
const HIDEABLE_SECTIONS = ALL_SECTION_KEYS;

type HideableSection = (typeof HIDEABLE_SECTIONS)[number];

/** A minimal item carrying a stable `_vId`, which `getSectionItemHash` prefers. */
const item = (vId: string) => ({ name: vId, _vId: vId }) as never;

function resumeWithHiddenItem(section: HideableSection): ResumeData {
  const resume = structuredClone(initialResumeState);
  resume[section] = [item(`${section}-shown`), item(`${section}-hidden`)];
  resume.meta.content.hiddenIds = [getSectionItemHash(section, { _vId: `${section}-hidden` })];
  return resume;
}

describe('getFilteredResumeData — reduced export', () => {
  it('drops a hidden private project', () => {
    const reduced = getFilteredResumeData(
      resumeWithHiddenItem('privateProjects'),
      'reduced',
    ) as Record<string, Array<{ name: string }>>;

    expect(reduced.privateProjects.map((entry) => entry.name)).toEqual(['privateProjects-shown']);
  });

  it.each(HIDEABLE_SECTIONS)('drops a hidden item from %s', (section) => {
    const reduced = getFilteredResumeData(resumeWithHiddenItem(section), 'reduced') as Record<
      string,
      Array<{ name: string }>
    >;

    expect(reduced[section].map((entry) => entry.name)).toEqual([`${section}-shown`]);
  });

  it('keeps hidden items in the standard export', () => {
    const standard = getFilteredResumeData(
      resumeWithHiddenItem('privateProjects'),
      'standard',
    ) as ResumeData;

    expect(standard.privateProjects).toHaveLength(2);
  });

  it('drops the cover letter and meta from the reduced export only', () => {
    const resume = structuredClone(initialResumeState);
    resume.coverLetter.enabled = true;
    resume.coverLetter.paragraphs = ['Dear hiring manager'];

    const reduced = getFilteredResumeData(resume, 'reduced');
    const standard = getFilteredResumeData(resume, 'standard') as ResumeData;

    expect(reduced).not.toHaveProperty('coverLetter');
    expect(reduced).not.toHaveProperty('meta');
    expect(standard.coverLetter.paragraphs).toEqual(['Dear hiring manager']);
  });

  // A legacy file's `imageVisible: false` becomes `basics:image` on import, the
  // one store for a hidden photo.
  it('blanks the profile image a legacy imageVisible: false hid', () => {
    const legacy = structuredClone(initialResumeState) as unknown as Record<string, unknown>;
    (legacy.basics as Record<string, unknown>).image = 'data:image/png;base64,AAAA';
    (legacy.basics as Record<string, unknown>).imageVisible = false;
    const resume = sanitizeResumeData(legacy).sanitized;
    expect(resume.meta.content.hiddenIds).toContain('basics:image');

    const reduced = getFilteredResumeData(resume, 'reduced') as {
      basics: { image: string; imageVisible?: boolean };
    };

    expect(reduced.basics.image).toBe('');
    expect(reduced.basics).not.toHaveProperty('imageVisible');
  });
});
