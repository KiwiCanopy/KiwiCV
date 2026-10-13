import { type ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { getFilteredResumeData } from '@/utils/resume-export';
import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * The public `reduced` JSON — what a public GitHub repo will receive
 * — must not hold anything the CV hides. It used to apply
 * `hiddenSections` to custom sections only, and read the photo from a field
 * the editor never sets.
 */
const resumeWith = (mutate: (resume: ResumeData) => void): ResumeData => {
  const { sanitized } = sanitizeResumeData({});
  for (const key of ALL_SECTION_KEYS) {
    (sanitized as unknown as Record<string, unknown[]>)[key] = [
      { ...createEmptyItem(key), _vId: `${key}-1` },
    ];
  }
  sanitized.basics.profiles = [{ ...createEmptyItem('profiles'), _vId: 'p-1', network: 'X' }];
  sanitized.basics.image = 'data:image/png;base64,AAAA';
  mutate(sanitized);
  return sanitized;
};

const reduced = (resume: ResumeData) =>
  getFilteredResumeData(resume, 'reduced') as unknown as ResumeData;

describe('the reduced export hides what the CV hides', () => {
  it.each(ALL_SECTION_KEYS)('drops every %s entry when the section is hidden', (key) => {
    const resume = resumeWith((r) => {
      r.meta.content.hiddenSections = [key];
    });
    expect((reduced(resume) as unknown as Record<string, unknown[]>)[key]).toEqual([]);
  });

  it('drops profiles when the profiles section is hidden', () => {
    const resume = resumeWith((r) => {
      r.meta.content.hiddenSections = ['profiles'];
    });
    expect(reduced(resume).basics.profiles).toEqual([]);
  });

  it('drops the photo when the user hid it', () => {
    const resume = resumeWith((r) => {
      r.meta.content.hiddenIds = ['basics:image'];
    });
    expect(reduced(resume).basics.image).toBe('');
  });

  it('keeps a visible section, entry and photo', () => {
    const out = reduced(resumeWith(() => {}));
    expect(out.work).toHaveLength(1);
    expect(out.basics.profiles).toHaveLength(1);
    expect(out.basics.image).not.toBe('');
  });
});
