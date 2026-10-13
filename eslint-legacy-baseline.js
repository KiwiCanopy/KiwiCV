/**
 * Pre-existing violations of the product-chrome lint guards, frozen on
 * 2026-07-20 so the guards can run as errors on new code without a
 * repository-wide rewrite.
 *
 * These lists only shrink. When a Phase 7 package migrates a surface off
 * `btn-3d-*`, raw `@radix-ui/react-dialog`, or a direct `clsx` import,
 * delete its entry here in the same commit.
 *
 * Permanently exempt, and deliberately absent below: `src/utils/cn.ts` owns
 * the sanctioned `clsx` wrapper, and `DialogFrame` and `Sheet` plus their
 * tests own the sanctioned Radix dialog composition.
 *
 * Every list is now empty. The guards run unexempted across `src`, and this
 * file can go once nothing imports it.
 */

/**
 * Files referencing the `btn-3d-*` / `badge-primary-3d` utilities. Empty:
 * `src/styles/legacy-controls.css` defined them and has been deleted, so the
 * guard is now a plain ban on classes that no longer exist.
 */
export const legacyControlClasses = [];

/**
 * Files importing `clsx` directly instead of `cn`, and not also importing
 * Radix dialog primitives. Empty: every such file now uses `cn`.
 */
export const directClsxOnly = [];

/**
 * Files composing `@radix-ui/react-dialog` directly instead of `DialogFrame`
 * or `Sheet`, and not also importing `clsx` directly. Empty: every such file
 * has been migrated.
 */
export const rawRadixDialogOnly = [];

/**
 * Files carrying both the direct `clsx` import and the raw Radix dialog
 * composition. Empty: `Sidebar` was the last one, and its drawer now composes
 * `Sheet`.
 */
export const directClsxAndRawRadixDialog = [];

/**
 * Large clickable REGIONS that keep `border-border` on purpose — and this list
 * is a permanent exemption, not debt. It does not shrink to zero.
 *
 * ⚠️ It is deliberately NOT a baseline. A baseline says "this is wrong, fix it
 * later", and the header of this file says its lists only shrink. Filing
 * correct code there guarantees someone eventually "drains" it and restyles the
 * app: `--border` is `#D7E0DA` at 1.35:1 on `--card`, `--input` is `#6C8978` at
 * 3.83:1, so the conversion turns a hairline into a distinct mid-green outline
 * on every entry.
 *
 * ⚠️ Why these five are correct as they stand. 1.4.11 binds when the BOUNDARY
 * is what identifies the control. Each of these encloses a heading, body text
 * or an image, so the content identifies it and the border merely frames it —
 * the same reasoning `Button.tsx` uses to leave a filled button edgeless. The
 * guard cannot see the difference between a chip and a card, which is why the
 * judgement is recorded here rather than inferred.
 *
 * - `CloudSyncGatewayModal` — a service row: icon, title, description, status.
 * - `PhotoEditor` — the photo tile; the image is the affordance.
 * - `PhoneGroupRow` — a `min-h-14` row of label plus number.
 * - `ServiceCard` — a full card with heading and body.
 * - `BlogOverview` — a post card: image, title, excerpt.
 *
 * Add an entry only with a sentence saying what content identifies the control.
 *
 * ⚠️ Three files are deliberately ABSENT because they were never violations,
 * not because they were fixed. `ThemeCard` frames a preview inside its button
 * and `EmptySectionCard`'s dashed edge wraps a card whose real control is an
 * inner button on `border-current/15` — both were once named and neither is
 * an offender. `VersionUpdateModal` is a `DialogFrame`, which the guard flagged
 * for the children of its `header={<div>…}` render prop until the selector
 * was corrected.
 *
 * ⚠️ That last one is the trap worth remembering: a file may leave this list
 * because it was FIXED or because it was NEVER a violation — never because a
 * selector stopped seeing it. A dead selector produces a green lint run and an
 * empty list, which looks exactly like success.
 */
export const controlEdgeIsFrameNotAffordance = [
  'src/components/modals/CloudSyncGatewayModal.tsx',
  'src/components/ui/PhotoEditor.tsx',
  'src/features/dashboard/editor/phone/PhoneGroupRow.tsx',
  'src/features/settings/shared/ServiceCard.tsx',
  'src/pages/Blog/BlogOverview.tsx',
];
