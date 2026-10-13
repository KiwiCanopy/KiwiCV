import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ThemeId } from '@/components/preview/themeIds';
import {
  ALL_SECTION_LABEL_KEYS,
  getBoundFormatters,
} from '@/components/preview/themes/shared/translations';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { PLACEMENT_RUNS, type Placement, applyPlacement } from '@/test/themePlacements';
import type { ResumeData } from '@/types/resume';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { describe, expect, it } from 'vitest';

/**
 * **A section heading the user renamed must reach the PDF, not just the
 * preview.**
 *
 * `previewExportParity.test.ts` sweeps the *fields* inside a section and says in
 * its own docblock that section labels are a whole second axis nothing asserts.
 * This is that axis. It is a separate file because it is a separate inventory —
 * twelve section keys rather than eighty-one item fields — and because the
 * defect shape is different: a field goes missing, whereas a label comes out
 * *wrong*, which no presence check on the item's contents can see.
 *
 * The first instance was found by hand: one heading printed over two
 * sections, with the field-parity file green throughout. The second is
 * the reason this file exists — `javascript` and `plain` read `cvLocale.sections`
 * directly instead of calling `getSectionLabels`, so they emitted the locale's
 * translated heading and silently discarded
 * `meta.theme.params.sectionLabels`. All twelve sections, both themes,
 * `preview-only` every time: a user renamed "Work Experience" to "Professional
 * History", watched the live preview update, and sent an employer a PDF that
 * still said "Work Experience".
 *
 * ## The property
 *
 * For every theme, every column placement, and every section key: the user's
 * override string is **in both outputs or in neither**. Absent from both is
 * legitimate — a theme is free not to print a heading for a section, and a
 * section with no content prints nothing anywhere.
 *
 * ## Scoped by the property, not by a list of themes
 *
 * The keys come from `ALL_SECTION_KEYS` and the runs from `PLACEMENT_RUNS`, so a
 * new section or a new theme enters this sweep with no edit here. Deliberately
 * **not** scoped as "every serializer calls `getSectionLabels`" — that is a
 * spelling check, and the next theme evades it by inlining the same merge
 * incorrectly. This asserts the outcome the user sees.
 *
 * ## What it does NOT cover, stated rather than implied
 *
 * - **Icons.** Each section carries an icon name into Typst and a
 *   `lucide-react` component into the HTML, and nothing *here* compares the two:
 *   a briefcase on screen and a graduation cap in the PDF still passes this
 *   file. `iconGeometryParity.test.ts` is that axis. It is a separate
 *   file because the comparison is on drawn geometry rather than on a string —
 *   the two outputs draw from unrelated catalogues, so `work` and `briefcase`
 *   are the same picture and `briefcase` and `briefcase-business` are not.
 * - **Placement, ordering, styling.** Presence in each output, nothing more.
 * - **The translated defaults.** Overrides are what broke; the locale layer was
 *   measured working in both themes and is covered by the i18n suite.
 *
 * ⚠️ **`about` and `contact` used to be listed here as uncovered, and they are
 * covered now.** They are labels rather than sections and so are absent
 * from `ALL_SECTION_KEYS` — which meant deriving this sweep's inventory from that
 * list silently dropped them from the *property* as well as from the section
 * inventory. Two different things, and the note conflated them. See
 * `LABEL_ONLY_KEYS` below.
 */
const sentinelFor = (key: string) => `ZL${key.toUpperCase()}ZL`;

/**
 * `about` and `contact` — the keys a user can rename that are **not** sections.
 *
 * ⚠️ Derived as `ALL_SECTION_LABEL_KEYS` minus `ALL_SECTION_KEYS`, never written
 * out. A third label-only key enters this sweep with no edit here, which is the
 * whole reason these two were missed: the sweep took its inventory from the
 * *section* list, so a label that is deliberately not a section was outside the
 * property by construction.
 *
 * ⚠️ **Only five theme/label pairs read these at all** — lunar `contact`, soft
 * `about`, swiss-grid `about` and `contact`, timeless `about` — so the other rows
 * are absent-from-both, which this file scores as agreement. That is why the
 * non-vacuity control below counts the pairs that reach *both* outputs rather than
 * trusting an empty mismatch list. Measured: 9 of 36 (theme × placement × key)
 * rows carry the override into both outputs and none disagree.
 *
 * ⚠️ soft renders a contact **block with no heading**, in both outputs, so
 * `labels.contact` has nothing to label there. `SectionLabelKey`'s docblock says
 * soft "renders a synthesised Contact", which is true of the block and not of the
 * heading — do not read it as a missing row here.
 */
const LABEL_ONLY_KEYS = ALL_SECTION_LABEL_KEYS.filter(
  (key) => !(ALL_SECTION_KEYS as readonly string[]).includes(key),
);

function seeded(themeId: string, placement: Placement): ResumeData {
  const data = buildSingleItemResume(themeId);
  applyPlacement(data, placement);

  const sectionLabels: Record<string, string> = {};
  for (const key of ALL_SECTION_LABEL_KEYS) sectionLabels[key] = sentinelFor(key);
  data.meta.theme.params = { ...data.meta.theme.params, sectionLabels };

  return data;
}

interface Outcome {
  mismatches: string[];
  both: number;
  neither: number;
  /** Label-only keys (`about`, `contact`) that reached both outputs on this run. */
  labelOnlyBoth: number;
}

function measure(themeId: ThemeId, placement: Placement): Outcome {
  const data = seeded(themeId, placement);
  const bound = getBoundFormatters(data);
  const html = renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data,
      formatCVDate: bound.formatCVDate,
      formatCVDateRange: bound.formatCVDateRange,
    }),
  );
  const typst = SERIALIZERS[themeId](data);

  const mismatches: string[] = [];
  let both = 0;
  let neither = 0;
  let labelOnlyBoth = 0;

  for (const key of ALL_SECTION_KEYS) {
    const needle = sentinelFor(key);
    const inHtml = html.includes(needle);
    const inTypst = typst.includes(needle);
    if (inHtml && inTypst) both += 1;
    else if (!inHtml && !inTypst) neither += 1;
    else
      mismatches.push(
        `${themeId} ${key} ${inHtml ? 'preview-only' : 'export-only'} (${placement})`,
      );
  }

  for (const key of LABEL_ONLY_KEYS) {
    const needle = sentinelFor(key);
    const inHtml = html.includes(needle);
    const inTypst = typst.includes(needle);
    if (inHtml && inTypst) labelOnlyBoth += 1;
    else if (inHtml || inTypst)
      mismatches.push(
        `${themeId} ${key} ${inHtml ? 'preview-only' : 'export-only'} (${placement})`,
      );
  }

  return { mismatches, both, neither, labelOnlyBoth };
}

const OUTCOMES = new Map<string, Outcome>(
  PLACEMENT_RUNS.map(([id, placement]) => [`${id}:${placement}`, measure(id, placement)]),
);
const outcomeFor = (id: ThemeId, placement: Placement): Outcome => {
  const found = OUTCOMES.get(`${id}:${placement}`);
  if (!found) throw new Error(`no outcome for ${id}:${placement}`);
  return found;
};
const ALL_MISMATCHES = [...OUTCOMES.values()].flatMap((o) => o.mismatches).sort();

/**
 * ⚠️ **A shrinking baseline, not an allowlist**, asserted with `toEqual` so it
 * fails in both directions — a new disagreement fails, and so does a stale entry
 * once a theme is fixed.
 *
 * 24 were pre-existing, measured before the fix: `javascript` and `plain` × all
 * twelve sections, every one `preview-only`. Both were one line — the two
 * serializers passed `cvLocale.sections` where the other ten pass
 * `getSectionLabels(cvLocale.sections, meta?.theme?.params?.sectionLabels)` —
 * and reverting either reproduces that theme's twelve rows here.
 *
 * ⚠️ Do not "fix" a failure by editing this list. An entry means the user
 * renamed a section and the two outputs disagree about what it is called.
 */
const KNOWN_MISMATCHES: string[] = [];

describe('the preview and the export agree about what a section is called', () => {
  it('disagrees in exactly the places it already disagreed', () => {
    expect(ALL_MISMATCHES).toEqual(KNOWN_MISMATCHES);
  });
});

/**
 * The controls. "Every theme agrees" and "the sweep can see a heading at all"
 * are independent properties, and a sweep whose sentinels never reached either
 * output would report perfect agreement forever — every pair would be
 * absent-from-both, which the property above counts as agreement.
 */
describe('the sweep can actually see the headings it compares', () => {
  it('sweeps the whole derived inventory', () => {
    expect(ALL_SECTION_KEYS.length).toBe(12);
    expect(PLACEMENT_RUNS).toHaveLength(18);
    expect(ALL_SECTION_LABEL_KEYS).toHaveLength(15);
    // `customSection` heads only an untitled custom section; customSectionRendering.test.ts covers it.
    expect(LABEL_ONLY_KEYS).toEqual(['about', 'contact', 'customSection']);
  });

  /**
   * ⚠️ **The non-vacuity control for `about` and `contact`, and the only thing
   * that makes their rows mean anything.** Just three of the twelve themes read
   * `labels.about` and two read `labels.contact`, so 27 of the 36 (theme ×
   * placement × key) pairs are absent-from-both — which this file scores as
   * agreement. An empty mismatch list is therefore compatible with *nothing at all
   * happening*, which is exactly the state these two keys were in before they were
   * swept: skipped, and indistinguishable from working.
   *
   * Measured before any change here: **9**. lunar `contact`, soft
   * `about`, swiss-grid `about`, swiss-grid `contact` and timeless `about`, each in
   * both placements — except lunar, soft and timeless, whose readers do not move
   * with the column, giving 2+2+2+2+1. Pinned exactly rather than as a floor,
   * because a theme silently dropping one of these headings is the regression and a
   * floor would absorb it.
   */
  it('carries about and contact into both outputs wherever a theme reads them', () => {
    const total = [...OUTCOMES.values()].reduce((n, o) => n + o.labelOnlyBoth, 0);
    expect(total).toBe(9);
  });

  /**
   * ⚠️ **The non-vacuity control, and the reason a zero above means anything.**
   * A theme that stopped printing section headings entirely — or one whose
   * fixture lost its content, so every section rendered empty — would produce
   * twelve absent-from-both pairs and a clean mismatch list. Every run must
   * actually carry most of the inventory in *both* outputs.
   *
   * Measured before the fix: `both` is 12 of 12 for every run except `javascript`
   * and `plain`, which were 0 because their PDFs carried the translated default
   * instead of the override. A floor of 8 leaves room for a theme that
   * legitimately prints no heading for a section or two without letting a
   * wholesale regression through.
   */
  it.each(PLACEMENT_RUNS)(
    '%s (%s) carries most section labels into both outputs',
    (id, placement) => {
      expect(outcomeFor(id, placement).both).toBeGreaterThanOrEqual(8);
    },
  );
});
