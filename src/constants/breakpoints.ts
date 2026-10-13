/**
 * Application-wide breakpoints matching Tailwind's defaults.
 *
 * LG (1024px): The 'Desktop' threshold.
 * - Content: Dual-pane (Editor + Preview)
 * - Sidebar: Persistent nav
 * - Tour: Attached tooltips
 *
 * MD (768px): Portrait Tablet threshold.
 *
 * SM (640px): Mobile threshold.
 * - Sizing: Modal and Tour card width scaling
 */
export const BREAKPOINTS = {
  LG: 1024,
  MD: 768,
  SM: 640,
} as const;
