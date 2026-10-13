import { ALL_THEME_IDS, THEME_LAYOUTS, type ThemeId } from '@/components/preview/themeIds';
import type { ResumeData } from '@/types/resume';

/**
 * Which column placement a run renders in.
 *
 * ⚠️ **`swapped` is not a second helping of the same coverage — it is the only
 * thing that reaches the *other* branch of every two-column theme.** Each theme
 * ships one default placement, and a sweep that renders only that measures half
 * of every two-column theme. Four defects have lived in that gap: the four
 * unasserted `SIDE_OVERRIDES` entries, the four main-column `projects.type` rows,
 * skyline's main column (it derived both project sections from
 * `data.projects` and never read `data.privateProjects`), and four more rows.
 *
 * One-column themes have no second placement, so they run `default` only —
 * `swapped` for them would re-measure the identical render and inflate the run
 * count without covering anything.
 */
export type Placement = 'default' | 'swapped';

/**
 * Every (theme, placement) pair worth rendering. One-column themes have one.
 *
 * ⚠️ **Shared because a second copy is a second thing to quietly shrink**, not
 * to save lines. This matrix is what makes a sweep's zero mean "zero across both
 * columns of every theme"; a sweep that rebuilt it locally could drop `swapped`
 * on its own and stay green over half the surface, which is exactly the state
 * the four defects above hid in. `previewExportParity.test.ts` layers a third
 * axis on top of this and `sectionLabelParity.test.ts` uses it as-is.
 */
export const PLACEMENT_RUNS: ReadonlyArray<readonly [ThemeId, Placement]> = ALL_THEME_IDS.flatMap(
  (id) =>
    THEME_LAYOUTS[id] === 'two-column'
      ? ([
          [id, 'default'],
          [id, 'swapped'],
        ] as const)
      : ([[id, 'default']] as const),
);

/**
 * Move every section to the other column, in place.
 *
 * ⚠️ Swapped wholesale rather than moving a named list of sections. A list here
 * would be a copy of the section inventory to drift, and the point is to reach
 * the other branch for *every* section a theme has, not for the ones someone
 * remembered.
 */
export function applyPlacement(data: ResumeData, placement: Placement): void {
  if (placement !== 'swapped') return;
  const two = data.meta.content.order.twoColumn;
  data.meta.content.order.twoColumn = { ...two, main: two.sidebar, sidebar: two.main };
}
