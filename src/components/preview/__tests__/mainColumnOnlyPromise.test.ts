import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { THEME_LAYOUTS, type ThemeId } from '@/components/preview/themeIds';
import { getBoundFormatters } from '@/components/preview/themes/shared/translations';
import { en } from '@/locales/en/index';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { named, sourceFiles } from '@/test/sourceFiles';
import { PLACEMENT_RUNS, type Placement, applyPlacement } from '@/test/themePlacements';
import { ALL_BOLD_HEADERS, type ResumeData } from '@/types/resume';
import { MAIN_COLUMN_ONLY_FIELDS } from '@/utils/componentVariants';
import type { SectionKey } from '@/utils/layout/constants';
import { lookupTranslation } from '@/utils/translationLookup';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * **A field the editor promises is main-column-only must not reach either output
 * from a sidebar.**
 *
 * `previewExportParity.test.ts` asserts that the two renderers agree with *each
 * other*, and `sectionLabelParity.test.ts` does the same for headings. Neither
 * can see this defect class, and its own docblock says so: when both of a theme's
 * renderers break the same promise, they agree perfectly and no row appears. That
 * is exactly what happened — `entity` in the sidebar of five of the six
 * two-column themes, in *both* outputs, with both sweeps green over all ten.
 *
 * **Parity is agreement between the renderers. This file is agreement with what
 * the editor told the user.**
 *
 * ## The property
 *
 * For every two-column theme, both column placements, both bold-header modes, and
 * every (section, field) in `MAIN_COLUMN_ONLY_FIELDS`:
 *
 * - the section in the **sidebar** ⇒ the value is in **neither** output;
 * - the section in the **main column** ⇒ the value is in **both**.
 *
 * The second half is not decoration. A field no theme renders anywhere satisfies
 * the first half vacuously, and a sweep made of nothing but vacuous passes would
 * report a kept promise forever — which is the failure mode every sweep in this
 * directory has had to be defended against separately.
 *
 * ## Scoped by the promise, not by a list
 *
 * The inventory *is* `MAIN_COLUMN_ONLY_FIELDS`, the table the editor prints the
 * badge from. There is no field list in this file, and that is load-bearing
 * rather than stylistic: **the census was first taken as a hand-written list of
 * twelve, corrected to fourteen when the `grep` that produced it turned out to have been
 * truncated by a `head -30` that cut `WorkForm.tsx` off, and corrected again to
 * fifteen when `SkillsForm/SkillsFormField.tsx` turned up passing the same hint
 * as a JSX prop rather than an object property.** Three counts, three methods,
 * one rule that lived in no single place. A written-out list here would be a
 * fourth attempt at the same census, and it would not have caught `entity`
 * either — `entity` was on all three lists.
 *
 * ## What it does NOT cover, stated rather than implied
 *
 * - **One-column themes.** There is no sidebar, so the promise is vacuous. They
 *   are excluded explicitly rather than by relying on `PLACEMENT_RUNS` to omit
 *   them, which it does not.
 * - **Fields with no badge.** `projects.location` sits on the same subtitle line
 *   as `entity` and carries no badge, so it stays in the sidebar. That asymmetry
 *   is deliberate and was weighed when this direction was decided.
 * - **Formatting and placement.** Presence in each output, nothing more.
 * - **Whether the badge is *visible*.** That the editor renders `layoutHint` at
 *   all is `MainColumnBadge`'s business; this asserts the promise's meaning, and
 *   the source scan below asserts that no component can print the badge without
 *   going through the table.
 */

const sentinelFor = (section: string, field: string) =>
  `ZH${section.toUpperCase()}${field.toUpperCase()}ZH`;

/**
 * Every badged (section, field) pair, flattened off the table.
 *
 * ⚠️ `Object.entries` over the table rather than `ALL_SECTION_KEYS` with a
 * lookup. The table is deliberately partial — `certificates`, `languages` and
 * `references` carry no promise — and iterating the section inventory instead
 * would invite a `?? []` that turns a section dropped from the table into a
 * silent zero rather than a failure. The pinned length in "sweeps the whole badge
 * table" below is what makes a shrink loud.
 */
const PAIRS: ReadonlyArray<readonly [SectionKey, string]> = Object.entries(
  MAIN_COLUMN_ONLY_FIELDS,
).flatMap(([section, fields]) =>
  (fields ?? []).map((field) => [section as SectionKey, field] as const),
);

type BoldHeader = (typeof ALL_BOLD_HEADERS)[number];

/**
 * ⚠️ **The bold-header axis is here for the same reason it is in
 * `previewExportParity.test.ts`: it once hid half a defect.** Three badged fields belong
 * to sections whose renderers branch on it — `work.summary`, `work.highlights`
 * and `education.courses` — and soft's `side/Education.tsx` got *both* branches
 * of `boldHeaderEducation` wrong at once. A sweep that renders only the default
 * `'position'` measures one branch of a two-branch conditional in twenty-four
 * renderers and reports the other as clean.
 */
const RUNS: ReadonlyArray<readonly [ThemeId, Placement, BoldHeader]> = PLACEMENT_RUNS.filter(
  ([id]) => THEME_LAYOUTS[id] === 'two-column',
).flatMap(([id, placement]) => ALL_BOLD_HEADERS.map((bold) => [id, placement, bold] as const));

interface Outcome {
  /** A badged field that reached an output from the sidebar. */
  leaks: string[];
  /** A badged field that failed to reach both outputs from the main column. */
  vacuous: string[];
}

function measure(themeId: ThemeId, placement: Placement, bold: BoldHeader): Outcome {
  const data: ResumeData = buildSingleItemResume(themeId);
  data.meta.theme.params = {
    ...data.meta.theme.params,
    boldHeaderWork: bold,
    boldHeaderEducation: bold,
  };
  applyPlacement(data, placement);

  const record = data as unknown as Record<string, unknown>;
  for (const [section, field] of PAIRS) {
    const items = record[section] as Array<Record<string, unknown>> | undefined;
    const first = items?.[0];
    if (!first) continue;
    first[field] = Array.isArray(first[field])
      ? [sentinelFor(section, field)]
      : sentinelFor(section, field);
  }

  const bound = getBoundFormatters(data);
  const html = renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data,
      formatCVDate: bound.formatCVDate,
      formatCVDateRange: bound.formatCVDateRange,
    }),
  );
  const typst = SERIALIZERS[themeId](data);

  const { main, sidebar } = data.meta.content.order.twoColumn;
  const leaks: string[] = [];
  const vacuous: string[] = [];

  for (const [section, field] of PAIRS) {
    const needle = sentinelFor(section, field);
    const inHtml = html.includes(needle);
    const inTypst = typst.includes(needle);
    const where = `${themeId} ${section}.${field} (${placement}, ${bold})`;

    if (sidebar.includes(section)) {
      if (inHtml || inTypst) {
        // ⚠️ Which output leaked is part of the row. `entity` leaked into both on
        // five themes, which is precisely why the parity sweeps could not see it;
        // a row that said only "leaked" would lose the fact that distinguishes
        // this defect class from a parity mismatch.
        leaks.push(`${where} ${inHtml && inTypst ? 'both' : inHtml ? 'preview' : 'export'}`);
      }
    } else if (main.includes(section) && !(inHtml && inTypst)) {
      vacuous.push(`${where} ${inHtml ? 'preview-only' : inTypst ? 'export-only' : 'neither'}`);
    }
  }

  return { leaks, vacuous };
}

const OUTCOMES = RUNS.map(([id, placement, bold]) => measure(id, placement, bold));
const ALL_LEAKS = OUTCOMES.flatMap((o) => o.leaks).sort();
const ALL_VACUOUS = OUTCOMES.flatMap((o) => o.vacuous).sort();

/**
 * ⚠️ **Empty, and it starts empty — the ten rows it would have held were fixed in
 * the same change that added this file.** Asserted with `toEqual`, so a
 * new leak fails and so would a stale entry.
 *
 * The ten were `projects.entity` and `privateProjects.entity` in the sidebar of
 * foggy, lunar, misty, soft and swiss_grid, in `both` outputs every time. Both
 * directions of the binding are measured rather than asserted to work:
 *
 * - Reverting **one** of a theme's two renderers — dropping `item.entity` back
 *   into foggy's serializer alone — yields four rows, `foggy {projects,
 *   privateProjects}.entity (default, {company, position}) export`.
 * - Reverting **both** of foggy's renderers, the earlier state, yields the
 *   same four rows marked `both`. **That is the case this file exists for**, and
 *   the one where `previewExportParity.test.ts` stays green: the two renderers
 *   agree with each other and disagree with the editor.
 *
 * Four rows per theme rather than two because the bold-header axis doubles every
 * run; the pair is the defect, and the mode is part of a row's identity for the
 * reason `previewExportParity.test.ts` gives.
 *
 * ⚠️ Do not "fix" a failure by editing this list. An entry means the editor
 * printed a promise next to a field and a theme broke it.
 */
const KNOWN_LEAKS: string[] = [];

/** Every badged field reaches both outputs from the main column, on every run. */
const KNOWN_VACUOUS: string[] = [];

describe('a main-column-only field stays out of the sidebar', () => {
  it('leaks in exactly the places it already leaked', () => {
    expect(ALL_LEAKS).toEqual(KNOWN_LEAKS);
  });

  /**
   * ⚠️ **The non-vacuity half, and the reason the assertion above means
   * anything.** Absence is trivially satisfied by a field no theme renders. Every
   * badged field must be one the theme genuinely shows in the main column, in
   * both outputs — otherwise "kept the promise" and "never renders it" are
   * indistinguishable here, which is the state `interests.keywords` was in: a
   * badge nothing enforced, on a field that happens to appear in no sidebar.
   */
  it('shows every badged field in the main column, in both outputs', () => {
    expect(ALL_VACUOUS).toEqual(KNOWN_VACUOUS);
  });
});

/**
 * The controls. "No badged field leaks" and "the sweep can see a badged field at
 * all" are independent properties, and a sweep whose sentinels never reached
 * either output would report a perfectly kept promise forever.
 */
describe('the sweep covers what it claims to', () => {
  /**
   * ⚠️ Pinned so a *shrinking* inventory is loud. The table is the census, so a
   * section quietly dropped from it — or a field dropped from a section's list —
   * would remove the promise from the editor *and* shrink this sweep in the same
   * edit, leaving it green over less. Seventeen: `work` and `volunteer` 2 each,
   * `education`, `awards`, `publications`, `interests` and `skills` 1 each,
   * `projects` and `privateProjects` 4 each.
   */
  it('sweeps the whole badge table', () => {
    expect(PAIRS).toHaveLength(17);
    expect(new Set(PAIRS.map(([section]) => section)).size).toBe(9);
  });

  /**
   * ⚠️ Pinned so a *shrinking* set of runs is loud, exactly as in the two parity
   * sweeps. Six two-column themes × two placements × two bold-header modes. If
   * `swapped` were dropped the sweep would never put a badged section in a
   * sidebar at all on the themes whose default keeps it in the main column, and
   * every row would go vacuously clean.
   */
  it('renders both placements and both bold-header modes of every two-column theme', () => {
    expect(RUNS).toHaveLength(24);
    expect(RUNS.filter(([, placement]) => placement === 'swapped')).toHaveLength(12);
    for (const bold of ALL_BOLD_HEADERS) {
      expect(RUNS.filter(([, , b]) => b === bold)).toHaveLength(12);
    }
  });

  /**
   * ⚠️ **The control that makes the leak assertion non-trivial: the sweep must
   * actually put badged sections in a sidebar.** Every run above could place all
   * nine badged sections in the main column and the leak list would be empty by
   * construction. Measured: every badged section reaches a sidebar in at least
   * one run, and every run has at least one badged section in its sidebar.
   */
  it('puts every badged section in a sidebar in some run', () => {
    const sidebarred = new Set<string>();
    for (const [themeId, placement] of RUNS) {
      const data = buildSingleItemResume(themeId);
      applyPlacement(data, placement);
      const { sidebar } = data.meta.content.order.twoColumn;
      const badged = [...new Set(PAIRS.map(([section]) => section))].filter((s) =>
        sidebar.includes(s),
      );
      expect(badged.length).toBeGreaterThan(0);
      for (const section of badged) sidebarred.add(section);
    }
    expect(sidebarred.size).toBe(new Set(PAIRS.map(([section]) => section)).size);
  });
});

/**
 * `MAIN_COLUMN_ONLY_FIELDS` is only the census if nothing can print the badge
 * behind its back.
 */
describe('the badge cannot be printed without the table', () => {
  /**
   * ⚠️ **Scoped by the translation *key*, not by a call shape.** A scan for
   * `layoutHint:` was what produced the fourteen-pair count: `SkillsFormField.tsx`
   * passes the same hint as a JSX prop, so the object-property spelling missed it
   * entirely. The key is the thing that cannot be avoided — a component that wants
   * this badge has to name it, and any other key is a different badge.
   *
   * The one permitted file is `mainColumnHints.ts`, whose whole job is to own the
   * key and answer the table with it.
   *
   * ⚠️ **The needle is concatenated so this file is not its own offender.** The
   * first draft asserted a one-element list and got a two-element one back,
   * naming itself — and the obvious repair, excluding this path, would have turned
   * the assertion into an allowlist with a hole in exactly the place a future
   * author is most likely to paste a hint while debugging. Composing the string
   * means the scan genuinely has zero occurrences to forgive.
   */
  it('spells the hint key in exactly one file', () => {
    const needle = `'editor.hints.` + `main_column_only_section'`;
    const root = join(__dirname, '..', '..', '..');
    const offenders = sourceFiles(root, { extensions: ['.ts', '.tsx'], skip: [named('locales')] })
      .filter((file) => readFileSync(file, 'utf8').includes(needle))
      .map((file) => relative(root, file));

    expect(offenders).toEqual(['components/editor/mainColumnHints.ts']);
  });

  /**
   * ⚠️ **The badge's section name is composed, so `check-i18n` cannot verify it.**
   * `mainColumnOnlyHint` builds `editor.sections.<section>`, which is a registered
   * `DYNAMIC_PREFIXES` entry — a registration silences the checker rather than
   * proving the key exists. `t` returns the path verbatim for a key it cannot
   * find, so a section added to the table with no `editor.sections` entry would
   * render the literal string `editor.sections.foo` inside the badge sentence.
   * This is the `labelKeyForWarningSection` shape, and the same argument.
   */
  it.each([...new Set(PAIRS.map(([section]) => section))])(
    'resolves the badge section name for %s',
    (section) => {
      expect(typeof lookupTranslation(en, `editor.sections.${section}`)).toBe('string');
    },
  );
});
