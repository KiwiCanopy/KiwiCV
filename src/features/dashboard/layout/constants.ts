export const DASHBOARD_PHONE_MAX_WIDTH = 767;

export const DASHBOARD_SPLIT_MIN_WIDTH = 1180;
export const DASHBOARD_PANE_MIN_WIDTH = 480;

/** The editor section rail, expanded and icons-only. */
export const EDITOR_RAIL_WIDTH = 246;
export const EDITOR_RAIL_COLLAPSED_WIDTH = 64;

/**
 * The narrowest entry column that still gets the row-based form layout:
 * `useEditorBreakpoints().isStandard` is `width > 560`, so 561 is the first
 * width the forms themselves consider standard.
 */
export const EDITOR_ENTRY_COLUMN_MIN_WIDTH = 561;

/**
 * Below this measured **editor pane** width the rail starts collapsed. A user's
 * own toggle pins the state and this stops applying.
 *
 * ⚠️ **The pane, not the workspace** (2026-08-27). This used to be `1300`
 * compared against the workspace, but the rail's 246px comes out of the *pane*,
 * and at split the pane is only part of the workspace. A 1440 viewport gave a
 * 1372 workspace — over the old threshold, so the rail expanded — but a 704px
 * pane, leaving the form 457px, 32% of the screen. The rail was expanding into
 * the form's width rather than into spare room.
 *
 * ⚠️ **This is not the circular measurement the entry column would be.** The
 * column is a sibling of the rail and is already net of it, so it cannot answer
 * "is there room for a rail". The pane is set by `ResizableDivider` and does not
 * change when the rail collapses, so it can. Measured at 1440: pane 704, rail
 * 246, column 457 — the pane minus the rail *is* the column, within a pixel,
 * which is what makes this sum exact rather than an estimate.
 */
export const EDITOR_RAIL_EXPANDED_MIN_WIDTH = EDITOR_RAIL_WIDTH + EDITOR_ENTRY_COLUMN_MIN_WIDTH;
