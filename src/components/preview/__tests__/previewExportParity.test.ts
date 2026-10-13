import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { getBoundFormatters } from '@/components/preview/themes/shared/translations';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { PLACEMENT_RUNS, type Placement, applyPlacement } from '@/test/themePlacements';
import { ALL_BOLD_HEADERS, type ResumeData } from '@/types/resume';
import { createEmptyItem } from '@/utils/items';
import { ALL_EMPTY_ITEM_KEYS } from '@/utils/layoutMetadata';
import { describe, expect, it } from 'vitest';

/**
 * **The live preview must agree with the exported PDF about which fields a
 * résumé shows.**
 *
 * This repo renders every theme **twice**: a React component (`{Name}HTML.tsx`)
 * for the on-screen preview, and a serializer (`{Name}Serializer.ts`) emitting
 * Typst markup that a WASM compiler turns into the PDF. Twelve themes, twenty-
 * four independent implementations of one design. `themes/shared/` holds the
 * rules both sides call, and every round of this cleanup has been moving another
 * rule in there — but nothing has ever asserted the outcome. "The preview shows
 * what you will export" has been a habit, not a property.
 *
 * That habit fails. The instance that prompted this file: `skyline`
 * stripped sixteen field/section pairs from its preview via
 * `utils/componentVariants.ts` and its serializer stripped none, so a user typed
 * a job location, watched it vanish, and found it in the PDF anyway. The preview
 * contradicting the export is the one thing a live preview cannot do.
 *
 * All sixteen are fixed. Six were `location` — drift in `componentVariants.ts`
 * — and the other ten were skyline's *intentional* side-column blanks reaching
 * the PDF because `SkylineHTML.tsx` ran sections through `applyLayoutVariant`
 * and `SkylineSerializer.ts` did not; that was closed by teaching the
 * **serializer** the same projection, not by weakening the filter. The
 * baseline below is what this file is for: whatever has not been decided yet is
 * named there and held rather than allowed to drift.
 *
 * ## The property
 *
 * For every theme and every user-authored field: the value is **in both outputs
 * or in neither**. Absent from both is fine and common — a theme legitimately
 * choosing not to render `awards.url` is a design decision, and this file is
 * deliberately neutral about it. Only *disagreement* is a finding.
 *
 * ## Scoped by the property, not by a list
 *
 * The field inventory is derived from `createEmptyItem` over
 * `ALL_EMPTY_ITEM_KEYS`, plus `basics`' own scalars and `basics.location`'s. A
 * field added to `ResumeData` enters this sweep with no edit here, which is the
 * whole point — a restated list would be the fourteenth copy of the inventory
 * this repo keeps collapsing.
 *
 * ## What it does NOT cover, stated rather than implied
 *
 * - **`image`** — a URL or data URI consumed by an image renderer, not text. A
 *   text sentinel is not a valid value for it, so including it measured the
 *   fixture rather than the themes (nine false mismatches).
 * - **Non-string fields** — `level` (numeric), `visible`, `_vId`. A sentinel has
 *   nowhere to go.
 * - **`coverLetter` and `meta`** — not part of the section inventory this walks.
 * - **Formatting, ordering, styling.** This asserts *presence*, not that the two
 *   outputs look alike. A field rendered in both but in the wrong place passes.
 * - **`url` fields carry a URL-shaped sentinel**, because `sanitizeUrl`
 *   legitimately drops a non-URL and the probe would otherwise read its own
 *   fixture as a mismatch.
 *
 * ⚠️ The HTML side is given `getBoundFormatters(data)`, the same formatters the
 * serializers use and the documented non-hook equivalent of what `ResumeHTML`
 * passes down. An identity stub instead made every date field disagree — the
 * harness measuring itself.
 */

interface Field {
  section: string;
  field: string;
  sentinel: string;
  kind: 'string' | 'stringArray' | 'url';
}

function buildInventory(): Field[] {
  const out: Field[] = [];
  let n = 0;
  const next = () => `ZQ${String(n++).padStart(4, '0')}`;
  const skip = (field: string) => field === '_vId' || field === 'visible' || field === 'image';

  for (const key of ALL_EMPTY_ITEM_KEYS) {
    for (const [field, value] of Object.entries(createEmptyItem(key) as Record<string, unknown>)) {
      if (skip(field)) continue;
      if (field === 'url') out.push({ section: key, field, sentinel: next(), kind: 'url' });
      else if (typeof value === 'string')
        out.push({ section: key, field, sentinel: next(), kind: 'string' });
      else if (Array.isArray(value))
        out.push({ section: key, field, sentinel: next(), kind: 'stringArray' });
    }
  }

  const basics = buildSingleItemResume('lunar').basics as unknown as Record<string, unknown>;
  for (const [field, value] of Object.entries(basics)) {
    if (field === 'profiles' || field === 'location' || skip(field)) continue;
    if (field === 'url') out.push({ section: 'basics', field, sentinel: next(), kind: 'url' });
    else if (typeof value === 'string')
      out.push({ section: 'basics', field, sentinel: next(), kind: 'string' });
  }
  for (const field of Object.keys(basics.location as Record<string, unknown>)) {
    out.push({ section: 'basics.location', field, sentinel: next(), kind: 'string' });
  }

  return out;
}

const FIELDS = buildInventory();

const valueFor = (f: Field): string =>
  f.kind === 'url' ? `https://${f.sentinel.toLowerCase()}.example.com/p` : f.sentinel;

/** A URL is rewritten on the way out (the scheme is stripped for display), so match its stable middle. */
const needleFor = (f: Field): string =>
  f.kind === 'url' ? `${f.sentinel.toLowerCase()}.example.com` : f.sentinel;

/**
 * Which `boldHeader*` mode a run renders in.
 *
 * ⚠️ **A theme *param* is a third axis, and it hid half of a defect.**
 * `boldHeaderWork` and `boldHeaderEducation` are user-facing switches in the
 * design panel, and every work-like and education-like renderer in the repo
 * branches on them — which party is the bold heading and which drops to the
 * muted line below it. Until this existed the sweep rendered only the default
 * `'position'`, so it measured one branch of a two-branch conditional in
 * twenty-four renderers.
 *
 * That is not hypothetical. Soft's `side/Education.tsx` built its heading by
 * hand and got **both** branches wrong: `'position'` printed `area` where every
 * other education renderer prints `studyType area`, and `'company'` printed the
 * **empty string** where it should print `institution`. The sweep reported the
 * first as `soft education.studyType export-only` and was structurally blind to
 * the second — a user who picked "bold the institution" got a blank heading and
 * lost `institution` from the preview entirely while the PDF kept it. Closing
 * only the row this file could see would have left the other half live.
 *
 * ⚠️ Derived from `ALL_BOLD_HEADERS`, not written out. It is the same list
 * `sanitizeThemeParams` narrows the stored param against, so a third mode enters
 * this sweep with no edit here.
 */
type BoldHeader = (typeof ALL_BOLD_HEADERS)[number];

function seeded(themeId: string, placement: Placement, boldHeader: BoldHeader): ResumeData {
  const data = buildSingleItemResume(themeId);
  data.meta.theme.params = {
    ...data.meta.theme.params,
    boldHeaderWork: boldHeader,
    boldHeaderEducation: boldHeader,
  };
  const record = data as unknown as Record<string, unknown>;

  applyPlacement(data, placement);

  for (const f of FIELDS) {
    if (f.section === 'basics') {
      (data.basics as unknown as Record<string, unknown>)[f.field] = valueFor(f);
    } else if (f.section === 'basics.location') {
      (data.basics.location as unknown as Record<string, unknown>)[f.field] = valueFor(f);
    } else if (f.section === 'profiles') {
      const profile = data.basics.profiles[0] as unknown as Record<string, unknown> | undefined;
      if (profile) profile[f.field] = valueFor(f);
    } else {
      const items = record[f.section] as Array<Record<string, unknown>> | undefined;
      if (items?.[0]) items[0][f.field] = f.kind === 'stringArray' ? [f.sentinel] : valueFor(f);
    }
  }

  return data;
}

interface Outcome {
  mismatches: string[];
  both: number;
  neither: number;
}

function measure(themeId: ThemeId, placement: Placement, boldHeader: BoldHeader): Outcome {
  const data = seeded(themeId, placement, boldHeader);
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

  for (const f of FIELDS) {
    const inHtml = html.includes(needleFor(f));
    const inTypst = typst.includes(needleFor(f));
    if (inHtml && inTypst) both += 1;
    else if (!inHtml && !inTypst) neither += 1;
    else
      mismatches.push(
        // ⚠️ The placement **and** the bold-header mode are part of the identity
        // of a row. The same field/theme pair can agree in one column and
        // disagree in the other — that is the whole reason `swapped` exists —
        // and it can agree in one `boldHeader` branch and disagree in the other,
        // which is how half of soft's sidebar-heading defect stayed hidden. A
        // row that omitted either would let one run's failure look like a
        // stale entry from another.
        `${themeId} ${f.section}.${f.field} ${inHtml ? 'preview-only' : 'export-only'} (${placement}, ${boldHeader})`,
      );
  }

  return { mismatches, both, neither };
}

/**
 * Every (theme, placement, bold-header) triple this sweep renders.
 *
 * The column matrix comes from `PLACEMENT_RUNS` — shared with
 * `sectionLabelParity.test.ts` so there is one definition of "both columns of
 * every theme" rather than two that can drift apart. Every run is then taken in
 * **both** bold-header modes, because the param is a global design switch and
 * one-column themes branch on it too: `elegant`, `plain` and `plain2` each read
 * `boldHeaderEducation` in both of their renderers.
 */
const RUNS: ReadonlyArray<readonly [ThemeId, Placement, BoldHeader]> = PLACEMENT_RUNS.flatMap(
  ([id, placement]) => ALL_BOLD_HEADERS.map((bold) => [id, placement, bold] as const),
);

const OUTCOMES = new Map<string, Outcome>(
  RUNS.map(([id, placement, bold]) => [`${id}:${placement}:${bold}`, measure(id, placement, bold)]),
);
const outcomeFor = (id: ThemeId, placement: Placement, bold: BoldHeader): Outcome => {
  const found = OUTCOMES.get(`${id}:${placement}:${bold}`);
  if (!found) throw new Error(`no outcome for ${id}:${placement}:${bold}`);
  return found;
};
const ALL_MISMATCHES = [...OUTCOMES.values()].flatMap((o) => o.mismatches).sort();

/**
 * ⚠️ **A shrinking BASELINE, not an allowlist, and the difference is direction.**
 * An allowlist names files a scan skips and hides whatever else is in them; a
 * baseline names the exact offending triples. Asserted with `toEqual`, so it
 * fails in *both* directions — a new disagreement fails, and so does a stale
 * entry once a theme is fixed. There is no separate stale-entry test to forget.
 *
 * 44 were pre-existing in the `default` placement (measured), and
 * every one was fixed rather than deleted: soft's seven `preview-only` rows,
 * lunar's three and the last four, all sixteen of skyline's, the
 * ten `type` rows and soft's four sidebar date ranges. **The
 * `default` placement is now at zero.**
 *
 * **The last 4 were all `swapped`, and all four are closed.** They were
 * invisible to this file until it started rendering the other column (see
 * `Placement`), and every one turned out to be drift with a lopsided majority
 * against it — measured across all eighteen runs, not argued from this list:
 *
 * - `skyline work.summary export-only` — `WorkForm.tsx` gives `summary` the
 *   `main_column_only_section` badge, exactly as `VolunteerForm.tsx` does, but
 *   `SIDE_OVERRIDES.work` named only `highlights`. **Every** sidebar renderer in
 *   the repo dropped this paragraph — all five other two-column themes in both
 *   outputs, plus skyline's own `side/Work.tsx` — leaving skyline's *serializer*
 *   as the lone dissenter, eleven to one. Closed by adding `summary: ''` to the
 *   projection, which is what the editor had already promised the user. The
 *   projection is now *derived* from the badge table, so that particular
 *   gap — a badged field the projection omits — is unrepresentable.
 * - `soft education.score` / `education.studyType export-only` — one root cause,
 *   not two. `side/Education.tsx` built its heading by hand and got both
 *   branches of `boldHeaderEducation` wrong; see `educationHeading` in soft's
 *   `CommonHTML.tsx`, which the two components now share. Seventeen of eighteen
 *   runs rendered `score` in both outputs.
 * - `soft education.url preview-only` — the severe direction, and the one whose
 *   fix this file could not have scoped on its own. Eleven of twelve themes link
 *   the education heading in **both** outputs and **both** columns; soft
 *   rendered it in one of its four education renderers. Its main column had the
 *   identical hole as *absent-from-both*, which this file scores as agreement —
 *   so fixing only the sidebar row would have moved the defect into the column
 *   this file was already green about.
 *
 * ⚠️ **Zero is a weaker claim than it looks, and this file has been wrong about
 * that three times.** `toEqual` covers every (theme, placement, field) triple
 * the sweep renders — no more. Three defect classes sit outside it:
 *
 * - **What the editor promised.** Parity is agreement between the two renderers,
 *   never agreement with the badge the editor printed next to the field. Now
 *   covered by `mainColumnOnlyPromise.test.ts` — see the `entity` note below for
 *   the defect that motivated it.
 * - **Section labels.** A whole second axis — a defect printed one section's heading
 *   over two sections and left this file green. Now covered by
 *   `sectionLabelParity.test.ts`, which found a defect on its first run: two
 *   serializers discarded the labels a user had renamed, so twelve headings per
 *   theme reached the screen and not the PDF. **Icons are covered by
 *   `iconGeometryParity.test.ts`** — this file and that one are blind to
 *   each other, and a section drawn with a briefcase on screen and a graduation
 *   cap in the PDF passes here.
 * - **Theme *params*.** The sweep renders one `boldHeaderEducation` mode, the
 *   default `'position'`. Soft's sidebar heading was broken in *both* branches,
 *   and this file could only ever see one symptom at a time: it reported
 *   the missing `studyType` and was structurally blind to the `'company'` branch
 *   rendering an empty heading and losing `institution` from the preview
 *   outright. Fixing the reported symptom alone would have left the other live.
 *
 * Do not read zero as done.
 *
 * ⚠️ **`projects.type` / `privateProjects.type` is the worked example of
 * how a direction gets decided, and the deciding evidence was not in this file
 * or in the themes.** Ten rows on five themes, all `export-only`, all in the
 * **sidebar**. The `type` input in `ProjectsForm.tsx` carries
 * `editor.hints.main_column_only_section`, which `MainColumnBadge` renders
 * beside the label: *"In 2-column layouts only rendered if Projects lies within
 * Main column."* The product had already promised the user the rule; five
 * serializers were breaking it in the sidebar and two previews (foggy, lunar)
 * were breaking it the other way in the **main** column — four more rows this
 * sweep could not see, because it renders one layout per theme. **Read the
 * editor's own hints before inferring a rule from the renderers.**
 *
 * ⚠️ **`entity` was the same promise, unkept, and never in this list — the worked
 * example of what this file is structurally blind to.** It carried the
 * identical `main_column_only_section` hint, and five of the six two-column themes
 * rendered it in the sidebar in *both* outputs, so the two renderers agreed and no
 * row ever appeared here. skyline was the only theme that honoured it.
 * **Parity is agreement between the two renderers, not agreement with what the
 * editor told the user.**
 *
 * Closed by keeping the promise: `entity` is out of the sidebar subtitle in all
 * ten renderers, and `mainColumnOnlyPromise.test.ts` now asserts the property
 * directly — a badged field is in neither output from a sidebar and in both from
 * the main column, across both placements and both bold-header modes of every
 * two-column theme. The decision rested on the editor's hint plus the strongest
 * available sibling evidence: `type` and `description` carry the *same badge on
 * the same form for the same item* and all six themes honour them.
 *
 * ⚠️ **Do not re-derive that inventory with a `grep`; it has been wrong three
 * times.** The inventory was first filed as twelve badged fields, corrected to fourteen
 * when the `grep` behind it turned out to have been truncated by a `head -30`
 * that cut `WorkForm.tsx` off, and corrected again to **fifteen** when
 * `SkillsForm/SkillsFormField.tsx` turned up passing the hint as a JSX prop
 * rather than the `layoutHint:` object property every census had been scoped by.
 * The inventory now lives in `MAIN_COLUMN_ONLY_FIELDS` (seventeen pairs, after
 * `projects.highlights` and `privateProjects.highlights` gained the badge they had
 * always behaved as though they carried), the editor prints the badge from it, and
 * `mainColumnOnlyPromise.test.ts` sweeps it.
 *
 * ⚠️ **One placement per theme was not coverage, and three defects lived in
 * that gap at once — which is why `Placement` exists.** While the sweep rendered
 * only each theme's default: (1) `SIDE_OVERRIDES` had seven entries (nine since
 * it was derived from the badge table) and skyline's default sidebar holds three
 * of them, so the blanks for `work`, `education`, `awards` and `publications`
 * were unasserted and a serializer that
 * stopped projecting them kept this green; (2) the four main-column `type` rows
 * were invisible and had to be found by probing the other column by hand;
 * (3) skyline's main column derived *both* project sections from
 * `data.projects` by filtering on `type === 'work'` and never read
 * `data.privateProjects`, so a user's whole Private Projects section was missing
 * from the preview and present in the PDF. All three are closed, and `swapped`
 * is what keeps them closed: reverting that one-line fix reproduces nine
 * `skyline privateProjects.* export-only (swapped)` rows here, which is the
 * guard binding rather than a claim that it would.
 *
 * ⚠️ **Read the direction before triaging a failure.** An `export-only` row
 * means the PDF carries more than the screen promised; a `preview-only` row
 * means the user watched a field appear and sent an employer a document without
 * it. They are regressions of different severity, and the second is the one a
 * live preview exists to make impossible.
 *
 * ⚠️ **Direction is decided per field, and two fixes went opposite ways in
 * the same component pair.** Both were `export-only` rows on sidebar project
 * entries. One removed `type` from five serializers, because the editor's
 * `main_column_only_section` hint says it does not belong in a sidebar at all.
 * The other added the date range to soft's *preview*, because soft's own sidebar
 * renders a date in all six of its other date-bearing sections and four other
 * themes do the same — no hint, and the siblings pointed the other way. Same
 * file, same direction of mismatch, opposite fixes. The mismatch direction tells
 * you the severity; it never tells you the resolution.
 *
 * ⚠️ **The 14 did not all resolve the same way, and that is the point of
 * deciding per theme.** Ten were fixed by teaching the serializer to emit
 * a field the preview already showed; four — lunar's `projects.description`,
 * `privateProjects.description` and `interests.keywords`, plus soft's — by
 * removing the field from the *preview*. Which direction is right is settled by
 * finding a **sibling pair that already agrees**, not by reading this list: an
 * agreeing pair is a recorded design decision, and it leaves no trace here,
 * which is exactly why it is easy to miss.
 *
 *   - lunar's sidebar is a compact list and its own siblings said so
 *     unanimously — six sidebar sections render no prose in either renderer
 *     (lunar drops `work.summary` in the sidebar on both sides and always has),
 *     and `side/Skills.tsx` renders a name with no keyword badges while its
 *     serializer emits a name and a level bar. Two components disagreed with
 *     twelve, so the design won. Both fields still render in full in the main
 *     column, where the serializer emits them too.
 *   - The last four went the other way, on the same evidence read the other
 *     direction. `elegant`/`plain` `awards.location`: five sections have
 *     `location` and both renderers agree on it for the other four, in every
 *     theme — plain2 and timeless build the missing
 *     `[awarder, location].join(' · ')` line verbatim. `stackoverflow`
 *     `projects.type`/`privateProjects.type`: its serializer already joined
 *     `entity` and `location` in one `org` string and dropped only the middle
 *     element, and elegant renders `[entity, type].join(' — ')` identically in
 *     both renderers. Lone dissenter on the serializer side each time.
 *
 * ⚠️ Do not "fix" a failure by editing this list. A new entry means the two
 * renderers disagree about a field a user typed, which is the defect.
 */
const KNOWN_MISMATCHES: string[] = [];

describe('the preview and the export agree about which fields a résumé shows', () => {
  it('disagrees in exactly the places it already disagreed', () => {
    expect(ALL_MISMATCHES).toEqual(KNOWN_MISMATCHES);
  });
});

/**
 * The controls. "The walk compared 972 pairs" and "the walk can see a field at
 * all" are independent properties, and a sweep whose sentinels never reach the
 * output would report perfect parity forever — every pair would be
 * absent-from-both, which this file counts as agreement.
 */
describe('the sweep can actually see the fields it compares', () => {
  it('sweeps the whole derived inventory', () => {
    // ⚠️ Pinned so a *shrinking* inventory is loud. A `createEmptyItem` entry
    // that stopped yielding fields, or a section dropped from
    // `ALL_EMPTY_ITEM_KEYS`, would otherwise quietly reduce the sweep and leave
    // it green over less.
    expect(FIELDS.length).toBe(85);
    expect(ALL_THEME_IDS).toHaveLength(12);
  });

  /**
   * ⚠️ Pinned so a *shrinking* set of runs is loud. Six two-column themes ×
   * two placements plus six one-column themes × one is eighteen, and each runs
   * in both bold-header modes: thirty-six. If `swapped` were dropped, or
   * `THEME_LAYOUTS` stopped calling a theme two-column, or the bold-header axis
   * collapsed to the default mode, the sweep would silently go back to covering
   * less and stay green over the smaller surface — which is exactly the state
   * skyline's missing Private Projects, four `SIDE_OVERRIDES` entries, and half of
   * soft's sidebar-heading defect hid in.
   */
  it('renders both column placements and both bold-header modes', () => {
    expect(RUNS).toHaveLength(36);
    expect(RUNS.filter(([, placement]) => placement === 'swapped')).toHaveLength(12);
    for (const bold of ALL_BOLD_HEADERS) {
      expect(RUNS.filter(([, , b]) => b === bold)).toHaveLength(18);
    }
  });

  it.each(RUNS)(
    '%s (%s, %s) renders most of the inventory in both outputs',
    (themeId, placement, bold) => {
      // Measured: `both` ranges 57 (soft) to 80 (javascript,
      // plain2) of 81. A floor of 40 catches a theme whose content stopped
      // reaching either renderer without pinning numbers that legitimately move.
      expect(outcomeFor(themeId, placement, bold).both).toBeGreaterThan(40);
    },
  );

  it('some themes agree completely, so parity is achievable rather than aspirational', () => {
    const clean = RUNS.filter(
      ([id, placement, bold]) => outcomeFor(id, placement, bold).mismatches.length === 0,
    );

    expect(clean.length).toBeGreaterThanOrEqual(3);
  });

  /**
   * The narrowest control: one field every theme is known to render in both.
   * If the harness broke — a renderer throwing, the fixture losing its work
   * section, the sentinels not being written — this fails immediately and by
   * name, rather than the baseline assertion failing with forty-four diffs.
   *
   * ⚠️ Run per *run*, not per theme. `work` sits in the main column by default
   * in all six two-column themes, so a theme-only version would never exercise a
   * sidebar `work` — the placement that reaches `SIDE_OVERRIDES`' `work` entry —
   * and `position` swaps roles with `name` between the two bold-header modes, so
   * a default-mode-only version would measure one branch of that conditional.
   */
  it.each(RUNS)('%s (%s, %s) shows work.position in both outputs', (themeId, placement, bold) => {
    const field = FIELDS.find((f) => f.section === 'work' && f.field === 'position');
    expect(field).toBeDefined();
    expect(outcomeFor(themeId, placement, bold).mismatches).not.toContain(
      `${themeId} work.position preview-only (${placement}, ${bold})`,
    );
    expect(outcomeFor(themeId, placement, bold).mismatches).not.toContain(
      `${themeId} work.position export-only (${placement}, ${bold})`,
    );
  });
});
