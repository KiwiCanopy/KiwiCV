import type { ThemeId } from '@/components/preview/themeIds';
import type { ElegantPaletteId } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/constants';
import type { JavaScriptPaletteId } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import type { Plain2PaletteId } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/constants';
import type { PlainPaletteId } from '@/components/preview/themes/oneColumn/plain/helpers/shared/constants';
import type { StackoverflowPaletteId } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/constants';
import type { TimelessPaletteId } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/constants';
import type { FoggyPaletteId } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/constants';
import type { LunarPaletteId } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/constants';
import type { MistyPaletteId } from '@/components/preview/themes/twoColumn/misty/helpers/shared/constants';
import type { SkylinePaletteId } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/constants';
import type { SoftPaletteId } from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';
import type { SwissGridPaletteId } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/constants';

/**
 * Which palette ids each theme offers — one declaration, derived from the
 * palette maps themselves (each is `keyof typeof PALETTES`).
 *
 * ⚠️ **Type-only, and that is what makes it importable from a locale file.**
 * `locales/en/themes.ts` needs this fact to check its palette names and must not
 * take a value import from the preview tree. Under `verbatimModuleSyntax` an
 * `import type` is erased outright, so nothing here survives into the module
 * graph — verified after a build: no `themePaletteIds`, `PaletteIdMap` or
 * `_PaletteIdMapHasNoStrangers` anywhere in `dist/`.
 *
 * ⚠️ **The cycle is TWO `import type` → `import` flips away — not one, which
 * this comment and an earlier analysis both said.** The path itself is right, and is not the
 * one an even earlier draft named ("`ThemeRegistry` reaches every `*HTML.tsx`" —
 * this module does not import `ThemeRegistry` at all):
 *
 *   `locales/en/themes.ts` → here → `…/helpers/shared/constants.ts` →
 *   `themes/shared` → `@/locales`
 *
 * `themes/shared` value-imports the locales (`levels.ts:1`, `translations.ts:1`),
 * but an `import type` is erased *outright*, so flipping one edge leaves the next
 * one still erasing the rest of the chain. Measured with a value-only closure
 * walk: this module reaches exactly itself, and a flip here or in a
 * `constants.ts` alone leaves it reaching one module. It takes a flip at the top
 * **and** one at the bottom, after which the closure contains
 * `src/locales/index.ts`.
 *
 * ⚠️ **It is enforced now**, by
 * `__tests__/themePaletteIdsAreTypeOnly.test.ts` rather than by a dependency:
 * there is still no `madge` and no `import/no-cycle`, which would need
 * `eslint-plugin-import`. That file asserts the closure here and in
 * `themeIds.ts`, forbids a surviving import in any of the thirteen one-hop
 * modules — the tripwire, so the cycle costs two deliberate violations — and
 * walks from `@/locales` too, for a route neither of those can see.
 *
 * ⚠️ The analogy to `themeIds.ts` is imperfect and was asserted rather than
 * held: `themeIds.ts` has **zero** imports, which is the property it relies on.
 * This module has thirteen.
 *
 * The two consumers are `ThemeRegistry.ts`, which keys each theme's palette
 * metadata by its own ids, and `locales/en/themes.ts`, which owes a display name
 * for every one of the forty. Both drift directions are build errors on each.
 */

/**
 * ⚠️ Written out rather than mapped, because there is nothing to map *from*:
 * the twelve id types live in twelve modules under names the compiler cannot
 * compose. `ThemePaletteIds` below is what makes the omission of a theme an
 * error; `_PaletteIdMapHasNoStrangers` catches the other direction.
 */
type PaletteIdMap = {
  elegant: ElegantPaletteId;
  foggy: FoggyPaletteId;
  javascript: JavaScriptPaletteId;
  lunar: LunarPaletteId;
  misty: MistyPaletteId;
  plain: PlainPaletteId;
  plain2: Plain2PaletteId;
  skyline: SkylinePaletteId;
  soft: SoftPaletteId;
  stackoverflow: StackoverflowPaletteId;
  swiss_grid: SwissGridPaletteId;
  timeless: TimelessPaletteId;
};

/**
 * ⚠️ A **type parameter constrained to `never`**, not `A extends B ? true :
 * never` — the latter produces no error at all, it merely resolves to `never`,
 * and a module-scope `const _check` is dead under `noUnusedLocals`. Both are
 * recorded traps here; see `themes/shared/types.ts`'s `_PaletteHasNoOptionals`.
 *
 * Exported for the same reason: an unused local type alias is a `noUnusedLocals`
 * error, so the assertion has to be part of the module's surface to run at all.
 */
export type _PaletteIdMapHasNoStrangers<
  Stranger extends never = Exclude<keyof PaletteIdMap, ThemeId>,
> = Stranger;

/**
 * The mapped form, and the half that catches a **missing** theme: `PaletteIdMap[K]`
 * is an error when `K` is not a key of it, so a thirteenth theme cannot be
 * registered without declaring which palettes it offers.
 */
export type ThemePaletteIds = { [K in ThemeId]: PaletteIdMap[K] };
