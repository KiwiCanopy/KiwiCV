import {
  DEFAULT_RAIL_SECTION,
  RAIL_GROUPS,
  RAIL_ICONS,
  RAIL_LABEL_KEYS,
  RAIL_SECTION_ORDER,
  asRailSectionKey,
} from '@/features/dashboard/editor/rail/railSections';
import { type RailSectionKey } from '@/features/dashboard/editor/rail/types';
import { en } from '@/locales/en/index';
import { ALL_EMPTY_ITEM_KEYS } from '@/utils/layoutMetadata';
import { lookupTranslation } from '@/utils/translationLookup';
import { describe, expect, it } from 'vitest';

/**
 * The rail is a fifteenth restatement of "what sections does the editor show",
 * and this repository's recurring bug is exactly that kind of copy drifting.
 *
 * ⚠️ **Two independent halves.** `RAIL_LABEL_KEYS` is `Record<RailSectionKey, …>`,
 * so a missing row is `TS2741` and a bogus one `TS2353` — the *inventory* half is
 * already a build error and needs no test. What no type can express is that a
 * label key **names something**: `t()` returns the path for a key it cannot find,
 * so a plausible-looking wrong key renders `editor.sections.coverLetter` as a
 * heading. That is the failure the import modals actually shipped, and it
 * is what the resolution test below catches.
 */

const resolve = (path: string) => lookupTranslation(en, path);

const EXPECTED_RAIL_KEYS: RailSectionKey[] = [...ALL_EMPTY_ITEM_KEYS, 'basics', 'coverLetter'];

describe('the editor rail inventory', () => {
  it('is a permutation of every section the editor can show', () => {
    expect(new Set(RAIL_SECTION_ORDER)).toEqual(new Set(EXPECTED_RAIL_KEYS));
    expect(RAIL_SECTION_ORDER).toHaveLength(EXPECTED_RAIL_KEYS.length);
  });

  it('lists every row exactly once', () => {
    expect(new Set(RAIL_SECTION_ORDER).size).toBe(RAIL_SECTION_ORDER.length);
  });

  it('derives its order from the groups, so reading order and step order agree', () => {
    expect(RAIL_SECTION_ORDER).toEqual(RAIL_GROUPS.flatMap((group) => group.sections));
  });

  // The two halves of the same decision: the cover letter leads the list so it
  // is seen, and the editor still opens on Basics so being seen does not become
  // being opened. Pinned together because satisfying one and dropping the other
  // is the likely regression.
  it('leads with the cover letter, unheaded, above the CV sections', () => {
    expect(RAIL_SECTION_ORDER[0]).toBe('coverLetter');
    expect(RAIL_GROUPS[0]).toEqual({
      id: 'coverLetter',
      labelKey: null,
      sections: ['coverLetter'],
    });
  });

  it('still opens on basics, not on the row that leads the list', () => {
    expect(DEFAULT_RAIL_SECTION).toBe('basics');
  });

  it.each(RAIL_SECTION_ORDER)('labels %s with a key the en bundle resolves', (sectionKey) => {
    expect(typeof resolve(RAIL_LABEL_KEYS[sectionKey])).toBe('string');
  });

  it.each(RAIL_SECTION_ORDER)('gives %s an icon', (sectionKey) => {
    expect(RAIL_ICONS[sectionKey]).toBeTruthy();
  });

  it.each(RAIL_GROUPS.filter((group) => group.labelKey !== null))(
    'heads the $id group with a key the en bundle resolves',
    (group) => {
      expect(typeof resolve(group.labelKey as string)).toBe('string');
    },
  );

  /**
   * The rail's own rows are the `?section=` vocabulary now, so the narrowing has
   * to reject everything else rather than cast.
   */
  it.each(['meta', 'about', 'contact', 'toString', '', 'Work'])(
    'refuses %o as a deep-link section',
    (value) => {
      expect(asRailSectionKey(value)).toBeNull();
    },
  );

  it('refuses a missing section parameter', () => {
    expect(asRailSectionKey(null)).toBeNull();
  });

  it.each(RAIL_SECTION_ORDER)('accepts %s as a deep-link section', (sectionKey) => {
    expect(asRailSectionKey(sectionKey)).toBe(sectionKey);
  });
});
