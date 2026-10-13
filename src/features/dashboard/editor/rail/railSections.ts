import { type ComponentType } from 'react';

import { COVER_LETTER_ICON, GROUP_METADATA, SECTION_METADATA } from '@/data/sections';
import {
  type EditorSectionKey,
  type RailGroup,
  type RailSectionKey,
} from '@/features/dashboard/editor/rail/types';
import { type ResumeData } from '@/types/resume';
import { customSectionToken, findCustomSection } from '@/utils/layoutMetadata';

/**
 * ⚠️ `Record<RailSectionKey, …>`, not `Record<string, …>` — the same device
 * `SECTION_METADATA` uses (`data/sections.ts:49`). A rail key with no label is
 * `TS2741` and a label for a key that is not a rail row is `TS2353`, so the two
 * inventories cannot drift apart in silence.
 *
 * ⚠️ Every value must **resolve** in the `en` bundle, which no type can express —
 * `t()` returns the path for a key it cannot find, so a plausible-looking wrong
 * key renders as `editor.sections.coverLetter` in the UI. `railInventory.test.ts`
 * resolves all fifteen against the real bundle, as `importWarningLabels.test.ts`
 * does for the import warnings.
 */
export const RAIL_LABEL_KEYS: Record<RailSectionKey, string> = {
  basics: 'editor.basics.title',
  profiles: 'editor.basics.profiles.title',
  work: 'editor.sections.work',
  education: 'editor.sections.education',
  publications: 'editor.sections.publications',
  references: 'editor.sections.references',
  skills: 'editor.sections.skills',
  languages: 'editor.sections.languages',
  certificates: 'editor.sections.certificates',
  awards: 'editor.sections.awards',
  projects: 'editor.sections.projects',
  privateProjects: 'editor.sections.privateProjects',
  volunteer: 'editor.sections.volunteer',
  interests: 'editor.sections.interests',
  coverLetter: 'editor.coverLetter.title',
};

/**
 * The label key for a section id, or `undefined` for an id that is not a rail
 * row.
 *
 * ⚠️ Exists because two call sites had each rebuilt this as a ternary over
 * `editor.sections.${id}`, and that template is wrong for three of the fifteen
 * rows — `basics`, `profiles` and `coverLetter` live elsewhere in the bundle.
 * The failure is invisible: `t()` returns the path for a key it cannot find, so
 * a wrong key renders as literal `editor.sections.coverLetter` rather than
 * throwing or blanking, and the usual `|| id` fallback never fires because a
 * path is a truthy string. The docstring above uses that exact string as its
 * example; it then shipped in the AI modal's title once
 * `section:coverLetter` became reachable.
 *
 * Takes `string` rather than `RailSectionKey` on purpose: both callers derive
 * the id by splitting an `activeTarget` like `section:work`, so it arrives
 * unvalidated and the miss has to be answerable rather than a type error.
 */
export const sectionLabelKey = (id: string): string | undefined =>
  (RAIL_LABEL_KEYS as Record<string, string | undefined>)[id];

/**
 * The rail's groups, in display order. The five content groups reuse the same
 * `editor.supersections.*` headings the deleted accordion groups carried — the
 * keys survive that deletion because `labelKeyForWarningSection` also returns
 * `editor.supersections.basics.title`.
 *
 * ⚠️ **The cover letter leads** (2026-08-27). It stays a single unheaded row —
 * it is one section, so a heading repeating its own label would still be noise —
 * but it now sits above the CV's own sections rather than trailing them, and
 * `SectionRail` draws its rule *below* it instead of above. Read top to bottom
 * that says "this is a separate document; everything under the rule is the CV".
 *
 * It is not a CV section, so trailing fifteen rows made the one thing people do
 * not know exists the last thing they would find. `DEFAULT_RAIL_SECTION` stays
 * `basics` — leading the list is about being seen, not about being opened.
 */
export const RAIL_GROUPS: RailGroup[] = [
  { id: 'coverLetter', labelKey: null, sections: ['coverLetter'] },
  {
    id: 'basics',
    labelKey: 'editor.supersections.basics.title',
    sections: [...GROUP_METADATA.basics.sectionIds],
  },
  {
    id: 'career',
    labelKey: 'editor.supersections.career.title',
    sections: [...GROUP_METADATA.career.sectionIds],
  },
  {
    id: 'knowledge',
    labelKey: 'editor.supersections.knowledge.title',
    sections: [...GROUP_METADATA.knowledge.sectionIds],
  },
  {
    id: 'projects',
    labelKey: 'editor.supersections.projects.title',
    sections: [...GROUP_METADATA.projects.sectionIds],
  },
  {
    id: 'personal',
    labelKey: 'editor.supersections.personal.title',
    sections: [...GROUP_METADATA.personal.sectionIds],
  },
];

/**
 * Flattened from `RAIL_GROUPS` rather than restated, so the rail's reading order
 * and its keyboard/step order cannot disagree.
 */
export const RAIL_SECTION_ORDER: RailSectionKey[] = RAIL_GROUPS.flatMap((group) => group.sections);

export const RAIL_ICONS: Record<RailSectionKey, ComponentType<{ className?: string }>> = {
  basics: SECTION_METADATA.basics.icon,
  profiles: SECTION_METADATA.profiles.icon,
  work: SECTION_METADATA.work.icon,
  education: SECTION_METADATA.education.icon,
  publications: SECTION_METADATA.publications.icon,
  references: SECTION_METADATA.references.icon,
  skills: SECTION_METADATA.skills.icon,
  languages: SECTION_METADATA.languages.icon,
  certificates: SECTION_METADATA.certificates.icon,
  awards: SECTION_METADATA.awards.icon,
  projects: SECTION_METADATA.projects.icon,
  privateProjects: SECTION_METADATA.privateProjects.icon,
  volunteer: SECTION_METADATA.volunteer.icon,
  interests: SECTION_METADATA.interests.icon,
  coverLetter: COVER_LETTER_ICON,
};

export const DEFAULT_RAIL_SECTION: RailSectionKey = 'basics';

/** Every row the rail shows, in screen order: the built-ins, then each custom section. */
export const editorRailOrder = (data: Pick<ResumeData, 'customSections'>): EditorSectionKey[] => [
  ...RAIL_SECTION_ORDER,
  ...data.customSections.map((section) => customSectionToken(section.id)),
];

const RAIL_SECTION_SET = new Set<string>(RAIL_SECTION_ORDER);

/**
 * `?section=` is an arbitrary deep-link string, so the narrowing is a real
 * membership test rather than a cast. Given the resume, a `custom:<id>` token
 * is accepted while that section exists; a stale one is `null` like any other
 * unknown value.
 */
export function asRailSectionKey(value: string | null): RailSectionKey | null;
export function asRailSectionKey(
  value: string | null,
  data: Pick<ResumeData, 'customSections'>,
): EditorSectionKey | null;
export function asRailSectionKey(
  value: string | null,
  data?: Pick<ResumeData, 'customSections'>,
): EditorSectionKey | null {
  if (!value) return null;
  if (RAIL_SECTION_SET.has(value)) return value as RailSectionKey;
  const custom = data ? findCustomSection(data, value) : undefined;
  return custom ? customSectionToken(custom.id) : null;
}
