import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData } from '@/types/resume';
import { stringifyResume } from '@/utils/passthrough';
import { isResumeEmpty } from '@/utils/placeholder-fallback';
import { getFilteredResumeData } from '@/utils/resume-export';
import { isMeaningfullyEmpty, sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/** `customSections` through import, sanitize and export. */

const SECTION = {
  id: '6f1c7c1e-1111-4a5b-9c2d-000000000001',
  title: 'Weitere Angaben',
  items: [{ name: 'Reisebereitschaft', summary: 'Bis 50 %' }],
};

describe('custom sections on import', () => {
  it('keeps id, title and entries, filling the entry shape', () => {
    const { sanitized } = sanitizeResumeData({
      basics: { name: 'Ada' },
      customSections: [SECTION],
    });
    expect(sanitized.customSections).toHaveLength(1);
    expect(sanitized.customSections[0]).toMatchObject({ id: SECTION.id, title: SECTION.title });
    expect(sanitized.customSections[0].items[0]).toMatchObject({
      name: 'Reisebereitschaft',
      summary: 'Bis 50 %',
      startDate: '',
      endDate: '',
      url: '',
      highlights: [],
    });
    expect(sanitized.customSections[0].items[0]._vId).toBeTruthy();
  });

  it('mints an id for a missing, empty or duplicate one', () => {
    const { sanitized } = sanitizeResumeData({
      customSections: [
        { title: 'No id', items: [] },
        { id: '  ', title: 'Blank id', items: [] },
        { id: 'dup', title: 'First', items: [] },
        { id: 'dup', title: 'Second', items: [] },
      ],
    });
    const ids = sanitized.customSections.map((s) => s.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids[2]).toBe('dup');
    expect(ids.every((id) => typeof id === 'string' && id.trim().length > 0)).toBe(true);
  });

  it('coerces malformed values instead of storing them', () => {
    const { sanitized } = sanitizeResumeData({
      customSections: [
        { id: 'x', title: 42, items: [{ name: 'A', highlights: 'not a list', startDate: {} }] },
        'not a section',
        null,
      ],
    } as unknown as Record<string, unknown>);
    expect(sanitized.customSections).toHaveLength(1);
    expect(sanitized.customSections[0].title).toBe('');
    expect(sanitized.customSections[0].items[0].highlights).toEqual([]);
    expect(sanitized.customSections[0].items[0].startDate).toBe('');
  });

  it('round-trips the exported key unchanged, and is not pass-through', () => {
    useResumeStore.getState().resetResume();
    useResumeStore
      .getState()
      .setResume({ basics: { name: 'Ada' }, customSections: [SECTION] } as unknown as ResumeData, {
        silent: true,
      });
    const exported = JSON.parse(stringifyResume(useResumeStore.getState().resume));
    expect(exported.customSections[0]).toMatchObject({ id: SECTION.id, title: SECTION.title });
    expect(exported.customSections[0].items[0].name).toBe('Reisebereitschaft');
    expect(useResumeStore.getState().resume.passthrough).toEqual({});
  });

  it('lifts a copy stored in pass-through by an older version', () => {
    const { sanitized } = sanitizeResumeData({
      basics: { name: 'Ada' },
      passthrough: { customSections: [SECTION] },
    });
    expect(sanitized.customSections[0].id).toBe(SECTION.id);
    expect(sanitized.passthrough).toEqual({});
  });

  it('keeps layout tokens of sections it has, and drops tokens of sections it does not', () => {
    const token = `custom:${SECTION.id}`;
    const { sanitized } = sanitizeResumeData({
      basics: { name: 'Ada' },
      customSections: [SECTION],
      meta: {
        content: {
          order: {
            oneColumn: ['work', token, 'custom:gone'],
            twoColumn: { main: [token, 'custom:gone'], sidebar: [] },
          },
        },
      },
    } as unknown as Record<string, unknown>);
    expect(sanitized.meta.content.order.oneColumn).toEqual(['work', token]);
    expect(sanitized.meta.content.order.twoColumn.main).toEqual([token]);
  });
});

describe('custom sections elsewhere in the data layer', () => {
  const resumeWithSections = (): ResumeData => {
    const resume = structuredClone(useResumeStore.getState().resume);
    resume.basics.name = '';
    resume.customSections = [
      {
        id: 'shown',
        title: 'Shown',
        items: [
          {
            ...SECTION.items[0],
            name: 'Public entry',
            startDate: '',
            endDate: '',
            url: '',
            highlights: [],
            _vId: 'p1',
          },
          {
            ...SECTION.items[0],
            name: 'Hidden entry',
            startDate: '',
            endDate: '',
            url: '',
            highlights: [],
            _vId: 'h1',
          },
        ],
      },
      {
        id: 'hidden',
        title: 'Hidden section',
        items: [
          {
            ...SECTION.items[0],
            name: 'In hidden section',
            startDate: '',
            endDate: '',
            url: '',
            highlights: [],
            _vId: 'x1',
          },
        ],
      },
    ];
    resume.meta.content.hiddenIds = ['custom:shown:h1'];
    resume.meta.content.hiddenSections = ['custom:hidden'];
    return resume;
  };

  it('the public reduced JSON drops hidden custom sections and hidden entries', () => {
    const reduced = JSON.stringify(getFilteredResumeData(resumeWithSections(), 'reduced'));
    expect(reduced).toContain('Public entry');
    expect(reduced).not.toContain('Hidden entry');
    expect(reduced).not.toContain('In hidden section');
  });

  it('a CV holding only custom sections is not empty', () => {
    const resume = resumeWithSections();
    expect(isMeaningfullyEmpty(resume)).toBe(false);
    expect(isResumeEmpty(resume)).toBe(false);
  });
});
