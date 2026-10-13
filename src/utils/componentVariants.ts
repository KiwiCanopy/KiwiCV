/**
 * Component Variants — Main/Side Rendering Rules
 *
 * Which fields a section shows when it sits in the **side** column rather than
 * the main one:
 *
 * - **Main**: full detail, every field the item carries.
 * - **Side**: minimalist, secondary fields blanked to preserve width.
 *
 * ⚠️ **Nothing here restates an item shape, and that is the fix.** This
 * module used to hold twenty-four object literals — twelve sections × a `main`
 * and a `side` projection — each rebuilding its item field by field from a
 * cast. `location` was missing from **twelve of the twenty-four**: all six
 * sections that have the field, in *both* modes. Nothing was blanking it; it
 * had simply never been typed out. A deliberate side drop in this file has
 * always looked like `highlights: []` — named and emptied — so an absent field
 * was drift, not policy.
 *
 * The consequence was user-visible on exactly one theme. `applyVariant` is
 * reached only through `applyLayoutVariant` (`themes/shared/sections.ts`), and
 * only `SkylineHTML.tsx` calls that — no serializer does. So a skyline user
 * typed a job location, watched it vanish from the live preview, and exported a
 * PDF that had it. Six sections, both columns.
 *
 * Two things follow from deriving instead of restating, and both are the point:
 *
 * - **`main` is the identity.** "Full detail, all fields visible" *is* the
 *   original item, so there is no main projection to get wrong. The twelve
 *   `main` literals were twelve chances to omit a field and zero chances to add
 *   one.
 * - **Only the deliberate blanks are written down.** Five sections had a `side`
 *   literal byte-identical to their `main` one; they are absent below rather
 *   than restated as no-ops.
 *
 * ⚠️ **`ItemFor<K>` is imported rather than re-declared**, so the value type is
 * read off `ResumeData` — a blank naming a field the section does not have, or
 * giving it the wrong type, is an error at its own line here. That is the
 * `EMPTY_ITEM_FIELDS` shape (`utils/items.ts`), applied to the one table this
 * module still needs.
 */
import type { ResumeSectionItem } from '@/types/resume';
import { type ItemFor, createEmptyItem } from '@/utils/items';
import { type SectionKey } from '@/utils/layout/constants';

export type LayoutMode = 'main' | 'side';

/** A section's own fields, minus the two bookkeeping keys other layers own. */
type BadgeableField<K extends SectionKey> = Exclude<keyof ItemFor<K> & string, 'visible' | '_vId'>;

/**
 * **The fields the editor promises are main-column-only — the one authority for
 * that rule.**
 *
 * Every entry here is a promise printed in the user's face: the editor attaches
 * `editor.hints.main_column_only_section` to the input and `MainColumnBadge`
 * renders it beside the label — *"In 2-column layouts only rendered if {section}
 * lies within Main column."* Three things read this table and nothing restates
 * it:
 *
 * - **The editor** prints the badge. `withMainColumnHints` maps a form's whole
 *   field list through this table, so which fields carry a badge is decided
 *   here and not by an author remembering to write a `layoutHint` line. That is
 *   the fix for how this inventory kept being wrong: it was first counted as
 *   twelve, corrected to fourteen when a truncated `grep` turned out to
 *   have cut `WorkForm.tsx` off, and corrected again to **fifteen** when
 *   `SkillsForm/SkillsFormField.tsx` turned up passing the same hint as a JSX
 *   prop rather than an object property. Three counts, one rule, no place that
 *   held it.
 * - **`SIDE_OVERRIDES` below** is derived from it, so the projection cannot
 *   promise less than the badge does.
 * - **`mainColumnOnlyPromise.test.ts`** asserts the outcome in both renderers of
 *   every two-column theme, in both column placements.
 *
 * ⚠️ **Keyed on `SectionKey` with values keyed off `ItemFor<K>`**, so a misspelt
 * section is `TS2353` and a misspelt *field* is `TS2322`, both at their own line
 * here. A `Record<string, string[]>` would let `'proejcts'` or `'entty'` sit
 * here forever: the editor would print no badge, the projection would blank
 * nothing, and the guard would assert over a pair no renderer has.
 *
 * ⚠️ **`projects.highlights` and `privateProjects.highlights` carry a badge
 * because they always behaved as though they did.** They were blanked by
 * the projection with no badge in the editor — the projection stricter than the
 * promise. Measured across both placements of all six two-column themes: both
 * are absent from the sidebar and present in the main column, in *both* outputs,
 * on every theme — behaviourally identical to `work.highlights` and
 * `volunteer.highlights`, which were badged. So the missing thing was the badge,
 * not the blank, and adding it changes no rendered output.
 *
 * ⚠️ **`interests.keywords` and `skills.keywords` were badged with no projection
 * entry**, the same asymmetry the other way: nothing enforced the promise and it
 * happened to hold because no theme renders either in a sidebar. Deriving the
 * projection from this table closes that by construction rather than by a second
 * list agreeing with the first.
 */
export const MAIN_COLUMN_ONLY_FIELDS: {
  readonly [K in SectionKey]?: ReadonlyArray<BadgeableField<K>>;
} = {
  // ⚠️ `summary` alongside `highlights` is not symmetry for its own sake.
  // `WorkForm.tsx` badges **both**, the identical pair `VolunteerForm.tsx`
  // badges, but the projection named only `highlights` — so the promise the
  // editor prints next to the field was kept for one of the two. That was the
  // `location` shape again: an absent field was drift, not policy.
  //
  // The gap was user-visible on skyline alone, since it is the only theme that
  // consults the projection. `side/Work.tsx` rendered no summary then, so a
  // skyline user moved Work to the sidebar, saw no paragraph, and exported a PDF
  // with one — the serializer passed `item.summary` into its side entry. Every
  // other two-column theme already dropped `work.summary` in the sidebar in
  // *both* renderers, so eleven of twelve agreed and the serializer dissented.
  work: ['summary', 'highlights'],
  volunteer: ['summary', 'highlights'],
  education: ['courses'],
  awards: ['summary'],
  publications: ['summary'],
  interests: ['keywords'],
  skills: ['keywords'],
  projects: ['entity', 'type', 'description', 'highlights'],
  privateProjects: ['entity', 'type', 'description', 'highlights'],
};

/**
 * The fields a **side** projection replaces, per section — **derived from the
 * badge table, never restated.**
 *
 * ⚠️ **The values come from `createEmptyItem`, so no blank is typed out here
 * either.** `summary` blanks to `''` and `highlights` to `[]` because that is
 * what the section's empty item holds, read off `ResumeData` through
 * `ItemShape<K>`. This is the same lesson taken one step further: an earlier fix stopped
 * this module restating twenty-four *item shapes*, and this one stops it
 * restating the blanks. The two ways the old literal could drift — a field the
 * badge promised but the projection omitted (`work.summary`), and a field
 * the projection blanked with no badge (`projects.highlights`) — are both
 * unrepresentable now.
 *
 * ⚠️ The blanks are **empty values, not deletions**, and that is deliberate: the
 * consuming components test `item.summary` for truthiness, and a deleted key and
 * an empty string read the same to them while only the empty string keeps the
 * item's declared shape intact.
 *
 * ⚠️ One blank array per (section, field), shared by every item the projection
 * touches — unchanged from the hand-written literal, and safe for the same
 * reason: these are blanks that nothing writes to. `applyVariant` spreads them
 * over a copy of each item and never mutates them.
 *
 * ⚠️ The cast is on the *derivation*, not on the inventory. `Object.fromEntries`
 * is typed `{ [k: string]: … }`, so the "misspelt key" guarantee the old literal
 * carried lives on `MAIN_COLUMN_ONLY_FIELDS` above instead — where it is now a
 * field-level guarantee rather than a section-level one.
 */
const SIDE_OVERRIDES = Object.fromEntries(
  Object.entries(MAIN_COLUMN_ONLY_FIELDS).map(([section, fields]) => {
    const blank = createEmptyItem(section as SectionKey) as Record<string, unknown>;
    return [section, Object.fromEntries((fields ?? []).map((f) => [f, blank[f]]))];
  }),
) as { [K in SectionKey]?: Partial<ItemFor<K>> };

/**
 * Apply the layout-mode projection to a section's items.
 *
 * ⚠️ `Object.hasOwn` rather than a bare index. `SIDE_OVERRIDES[section]` on a
 * `string` reaches `Object.prototype`, so a section named `'constructor'` would
 * hand back a function and spread its properties over every item. Unreachable
 * from today's callers, which pass a `DataSectionKey` — and the fourth instance
 * of that hazard in this repo, which is why it is closed at
 * the lookup rather than argued away at the call site.
 */
export const applyVariant = <T extends ResumeSectionItem>(
  items: T[],
  section: string,
  mode: LayoutMode,
): T[] => {
  if (mode === 'main') return items;

  const overrides = Object.hasOwn(SIDE_OVERRIDES, section)
    ? SIDE_OVERRIDES[section as SectionKey]
    : undefined;
  if (!overrides) return items;

  return items.map((item) => ({ ...item, ...overrides }));
};
