import type { ResumeMeta } from '@/types/resume';
import { isTwoColumnTheme } from '@/utils/layout/predicates';

/**
 * Determines if a theme supports 2-column layout.
 *
 * ⚠️ **`utils/layout/predicates` directly, not the `@/utils/layoutMetadata`
 * barrel**. The barrel is `export * from './layout'`, which re-exports all
 * seven `utils/layout/` modules, so this file pulled the whole of it at runtime
 * to get one predicate: measured, the value-import closure of this module was 11
 * modules and is 4. That breadth is the shape that made an import cycle possible —
 * `ThemeRegistry.ts` → `themes/shared` → here → the barrel → `predicates`.
 *
 * ⚠️ Not a blanket rule for this directory, and nothing enforces it: `sections.ts`
 * imports the barrel legitimately, and `twoColumnSections.test.ts` spies on it
 * for `getRenderableTwoColumnSections` — a spy that would go vacuous if that
 * import were narrowed, which its own docblock says. `isTwoColumnTheme` has no
 * such spy, which is why this one is safe to point at the source module.
 */
export function isTwoColumnLayout(meta: ResumeMeta | undefined): boolean {
  const themeName = meta?.theme?.name || '';
  return isTwoColumnTheme(themeName);
}
