/**
 * The palette ids one map offers and the other does not, in **both** directions
 * — `never` exactly when two maps agree. Constrain a type parameter to `never`
 * with it (`_XPaletteMapsOfferTheSameIds` below each pair of maps) and drift
 * becomes a build error.
 *
 * ⚠️ **Not "whatever the maps are annotated with" — an earlier draft of this
 * line said that and it is false in two spellings.** This reads `keyof typeof`,
 * which is the *declared* type, so anything that declares the key set defeats
 * it: `} as Record<MistyPaletteId, MistyPalette>` with an entry deleted is
 * `tsc -b` **exit 0**, and `Partial<Record<…>>` produces no error here at all
 * (its `TS2345`/`TS18048` come from `resolvePalette`'s signature, so a fourth
 * map read directly rather than passed to `resolvePalette` would get nothing
 * from either). What this alias genuinely covers is the **absent** annotation,
 * the one spelling nothing else caught. `__tests__/paletteMapKeySets.test.ts`
 * reads the literals instead and is the complement, not a duplicate — it is
 * what catches the `as` cast. Both found by the code-reviewer pass.
 *
 * ⚠️ **It exists because the annotation is not the guard it reads as.**
 * foggy, skyline and misty each declare a second, PDF-only map, keyed to the
 * first with a hand-written `Record<XPaletteId, XPalettePDF>`. Every
 * way of loosening that annotation was measured against a deleted `pink` entry
 * in misty's PDF map, and only one is silent:
 *
 * | declaration                                | missing entry           |
 * | ------------------------------------------ | ----------------------- |
 * | `Record<MistyPaletteId, MistyPalette>`      | `TS2741`, at the literal |
 * | `Record<string, MistyPalette>`              | `TS2345` at `MistySerializer.ts:47` |
 * | `Record<never, MistyPalette>`               | `TS2345` at `MistySerializer.ts:47` |
 * | `Partial<Record<MistyPaletteId, …>>`        | `TS2345` + two `TS18048` |
 * | **no annotation at all**                    | **exit 0** |
 *
 * ⚠️ So the claim "loosen it to `Record<string, …>` and it compiles clean"
 * **does not reproduce**, and neither does the `never` degeneration. Both were
 * once true and were overtaken by `FallbackArg`: its
 * first arm turns a widened `K` into `[fallbackId: never]`, so the call below
 * cannot be satisfied at all. Every one of the three maps is passed to
 * `resolvePalette`, so all three inherit that. What `FallbackArg` cannot see is a map
 * with **no annotation**, whose `keyof` is simply the literal's own keys — the
 * one spelling left, and the one an author writing a fourth map would reach for
 * first.
 *
 * ⚠️ **Not the `pdfPalettes(htmlMap, { … })` helper.** A helper
 * binds the key set and then owes the *value* type to a type argument, which is
 * omittable — the reason for the hand-written annotation, and here the loss would be silent and
 * per-theme: `FoggyPalettePDF` requires `textLight`, `SkylinePalettePDF`
 * extends `SkylinePalette`, and misty's map reuses `MistyPalette`. The
 * annotation stays, for the value type; this alias holds the key set
 * independently of it; and `__tests__/paletteMapKeySets.test.ts` is the forward
 * guard for the pair of maps declared tomorrow with neither.
 */
export type PaletteIdDrift<A, B> = Exclude<keyof A, keyof B> | Exclude<keyof B, keyof A>;

/**
 * The third argument of `resolvePalette`, expressed as a rest tuple so it can be
 * *optional on some maps and required on others* — which a plain parameter
 * cannot be.
 *
 * Three cases, and the first is the one that is easy to leave out:
 *
 * 1. ⚠️ `string extends K` — the map published no literal keys, because someone
 *    reverted its declaration from `satisfies Record<string, XPalette>` to the
 *    annotation `: Record<string, XPalette>`, **the form all twelve once
 *    had**. `'default' extends string` is *true*, so without this arm the map
 *    would silently take the optional branch and javascript's guard would
 *    disappear without a single error. This is the `Ids = string` degeneration,
 *    and the `never` makes it loud: the call cannot be satisfied with
 *    or without an argument, so the two sites using that map fail the build.
 *
 *    ⚠️ **`NoInfer` is what makes that last sentence true, and without it the arm
 *    protected the eleven themes that never needed it and not the one that did.**
 *    `K` is inferred from the rest tuple at *higher priority* than from
 *    `palettes`, so an explicit third argument simply became `K`:
 *    `resolvePalette(widenedMap, id, 'totallyBogus')` compiled clean, and the
 *    reviewer's end-to-end case — revert javascript's map to the annotation form
 *    **and** typo both its fallbacks to `'lite'` — produced exactly one error, in
 *    `ThemeRegistry.ts` from the registry binding, with both javascript call sites
 *    clean. `NoInfer<FallbackArg<K>>` makes `palettes` the only inference site;
 *    the same case now fails at `JavaScriptSerializer.ts:53` and
 *    `JavaScriptHTML.tsx:37` as well. Found by the code-reviewer pass; the
 *    architect pass probed eleven map shapes and did not reach it, because every
 *    one of them omitted the argument.
 * 2. The map has a `default` key — the argument is optional and defaults to
 *    `'default'` at runtime. Eleven themes.
 * 3. The map has no `default` — the argument is **required** and must be one of
 *    the map's own keys. Only javascript, whose keys are `light`/`dark`/…
 *
 * This works only because every palette map was turned from
 * `: Record<string, XPalette>` into `satisfies`, so `keyof` is a literal union
 * rather than `string`. The three maps still declared
 * `Record<XPaletteId, XPalette>` (skyline, misty and foggy's `PALETTES_PDF`)
 * publish a literal `XPaletteId`, so they take case 2 or 3 correctly — but
 * loosening *those* annotations to `Record<string, …>` is exactly case 1.
 *
 * ⚠️ That last sentence is why **those three annotations stay as they are**:
 * loosening them does not compile clean, because arm 1 above makes it `TS2345`
 * at all three serializers. Re-measured spelling by spelling in
 * `PaletteIdDrift`'s table above; the one gap left was a map with no annotation,
 * which is what that alias closes.
 *
 * Every arm is pinned by a `@ts-expect-error` in
 * `preview/__tests__/paletteResolution.test.tsx`, which `tsc -b` checks because
 * `tsconfig.app.json` includes all of `src`. A `@ts-expect-error` that stops
 * erroring is itself a build error, so the guard cannot rot silently.
 */
type FallbackArg<K extends string> = string extends K
  ? [fallbackId: never]
  : 'default' extends K
    ? [fallbackId?: K]
    : [fallbackId: K];

/**
 * Resolve a stored palette id against one theme's palette map.
 *
 * ⚠️ **This is the only place a palette map may be indexed by a stored id.**
 * `meta.theme.params.palette` is `palette?: string` (`src/types/resume.ts`) and
 * is never narrowed in `utils/validation.ts`, so it arrives off persisted state
 * and imported JSON as an arbitrary string. A plain `map[id] || map.default`
 * looks safe and is not: for any of `Object.prototype`'s **twelve** own property
 * names — `constructor`, `__proto__`, `toString`, `hasOwnProperty` and the rest
 * — the index resolves to an inherited, **truthy** value, so the `||` fallback
 * never fires and every colour read off the result is `undefined`. In the PDF
 * path those `undefined`s are interpolated straight into the Typst document and
 * the export **fails to compile** — measured on elegant, javascript, misty,
 * stackoverflow and timeless, with all twelve HTML previews miscoloured.
 *
 * ⚠️ Two separate measurements, do not read them as one: the compile failure
 * above was measured for `constructor` and `__proto__` only. The
 * twelve-name figure is a measurement of the *mechanism* — that all twelve
 * defeat the `||` — and the other ten were never run through a compile.
 *
 * `Object.hasOwn` is what makes the prototype keys fall back; the `hasOwn`
 * branch not firing is what keeps an ordinary unknown id (`'nonexistent'`)
 * falling back too. Both directions are guarded in
 * `preview/__tests__/paletteResolution.test.tsx`, on the serializers and the
 * HTML components alike, and a non-default palette compiles in
 * `preview/__tests__/typstCompile.test.ts`.
 *
 * ⚠️ **`fallbackId` used to be an unchecked `string`**. A caller that
 * passed a key the map does not hold got `undefined` typed as a palette, and
 * `tsc` could not see it — javascript is the one theme this can happen to, since
 * it has no `default`. It is now checked; see `FallbackArg` below. The
 * `not.toContain('undefined')` half of `paletteResolution.test.tsx` stays
 * anyway: equality alone cannot see that failure, because a wrong fallback fills
 * *both* arms of a comparison with `undefined` and they compare equal.
 *
 * @param palettes the theme's own `PALETTES_HTML` / `PALETTES_PDF` map
 * @param paletteId the stored id, unvalidated
 * @param fallbackId the theme's own fallback key — optional and defaulted on the
 *   eleven themes whose map has a `default`, **required** on javascript, which
 *   has no `default` palette
 */
export function resolvePalette<T, K extends string>(
  palettes: Record<K, T>,
  paletteId: string | undefined,
  ...[fallbackId]: NoInfer<FallbackArg<K>>
): T;
export function resolvePalette<T>(
  palettes: Record<string, T>,
  paletteId: string | undefined,
  fallbackId: string = 'default',
): T {
  if (paletteId && Object.hasOwn(palettes, paletteId)) return palettes[paletteId];
  return palettes[fallbackId];
}
