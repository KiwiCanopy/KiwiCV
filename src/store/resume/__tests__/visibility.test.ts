import { useResumeStore } from '@/store/resume/useResumeStore';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { getSectionItemHash } from '@/utils/hash';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * `cleanupHiddenIds` walks every array section, collects the hash of every item
 * that still exists, and drops any `meta.content.hiddenIds` entry not in that
 * set. So the walk is a section inventory, and a section missing from it
 * contributes no valid hashes — every hidden item in it looks stale and gets
 * its id deleted, silently unhiding the lot on the next cleanup.
 *
 * It used to restate the twelve sections inline, one more copy of the same
 * list behind four earlier drift defects. It now iterates `ALL_SECTION_KEYS`
 * directly, so the drift is gone by construction rather than guarded — but the
 * consequence is severe enough to pin, and the test below is what proves the
 * walk really does reach every section rather than merely claiming to.
 */

function resumeWithHiddenItem(section: (typeof ALL_SECTION_KEYS)[number]): ResumeData {
  const data = structuredClone(initialResumeState);
  const record = data as unknown as Record<string, unknown>;

  record[section] = [{ name: 'kept', _vId: `${section}-kept` }];
  data.meta.content.hiddenIds = [
    getSectionItemHash(section, { _vId: `${section}-kept` }),
    getSectionItemHash(section, { _vId: `${section}-deleted` }),
  ];

  return data;
}

function cleanup(resume: ResumeData): string[] {
  useResumeStore.setState({ resume });
  useResumeStore.getState().cleanupHiddenIds();
  return useResumeStore.getState().resume.meta.content.hiddenIds ?? [];
}

beforeEach(() => {
  useResumeStore.setState({ resume: structuredClone(initialResumeState) });
});

describe('cleanupHiddenIds — section inventory', () => {
  it.each(ALL_SECTION_KEYS)('keeps the hidden id of a surviving %s item', (section) => {
    const remaining = cleanup(resumeWithHiddenItem(section));

    expect(remaining).toContain(getSectionItemHash(section, { _vId: `${section}-kept` }));
  });

  it.each(ALL_SECTION_KEYS)('drops the hidden id of a deleted %s item', (section) => {
    const remaining = cleanup(resumeWithHiddenItem(section));

    expect(remaining).not.toContain(getSectionItemHash(section, { _vId: `${section}-deleted` }));
  });

  it('keeps the hidden id of a surviving custom-section entry', () => {
    const data = structuredClone(initialResumeState);
    data.customSections = [
      {
        id: 'c1',
        title: 'Talks',
        items: [
          {
            name: 'Kept',
            startDate: '',
            endDate: '',
            url: '',
            summary: '',
            highlights: [],
            _vId: 'kept',
          },
        ],
      },
    ];
    data.meta.content.hiddenIds = ['custom:c1:kept', 'custom:c1:deleted'];

    const remaining = cleanup(data);
    expect(remaining).toContain('custom:c1:kept');
    expect(remaining).not.toContain('custom:c1:deleted');
  });

  /** `profiles` lives under `basics`, so it is walked separately. */
  it('keeps the hidden id of a surviving profile', () => {
    const data = structuredClone(initialResumeState);
    data.basics.profiles = [
      { network: 'GitHub', username: 'ada', url: '', _vId: 'profile-kept' },
    ] as ResumeData['basics']['profiles'];
    data.meta.content.hiddenIds = [
      getSectionItemHash('profiles', { _vId: 'profile-kept' }),
      getSectionItemHash('profiles', { _vId: 'profile-deleted' }),
    ];

    const remaining = cleanup(data);

    expect(remaining).toEqual([getSectionItemHash('profiles', { _vId: 'profile-kept' })]);
  });

  it('leaves an empty hidden list alone', () => {
    expect(cleanup(structuredClone(initialResumeState))).toEqual([]);
  });
});
