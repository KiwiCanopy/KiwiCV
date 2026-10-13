import type { LocaleCode } from '@/locales';
import type { AddressSchemaConfig, ResumeData } from '@/types/resume';

import type { SectionLabelKey } from './sections';

export type { SectionLabelKey };

/**
 * The per-render metadata every theme component and serializer receives.
 *
 * ⚠️ It is the shared **channel** for render-time settings, not only locale data.
 * `boldHeader*` and `addressSchema` ride here so a theme reads them from the
 * résumé it was handed rather than from the global store.
 *
 * ⚠️ **There are two producers and only one of them decorates.** `getThemeTranslations`
 * builds this from a bare locale code and can only supply the neutral
 * `{ mode: 'default' }`; `getBoundFormatters(data)` overwrites it with the
 * résumé's own. A holder of a `CVLocaleMetadata` cannot tell which kind it has,
 * so **the object must come from `getBoundFormatters`/`useBoundFormatters` at any
 * site that formats an address**. That is not a type guarantee and this comment
 * used to imply it was. What keeps it true is that no undecorated instance is
 * reachable from a theme: `ThemeProps` deliberately does **not** carry one (see
 * below), and `addressSchemaFallback.test.tsx` renders every theme under a
 * contradicting store.
 *
 * `addressSchema` being required buys less than it looks: there is exactly one
 * producer of this type, so `TS2741` guards a case that cannot arise today. It
 * stays required because the failure it *would* prevent — a new producer
 * defaulting every address to `default` mode — is silent.
 */
export interface CVLocaleMetadata {
  code: LocaleCode;
  present: string;
  bcp47: string;
  sections: Record<SectionLabelKey, string>;
  tabTitle: string;
  addressSchema: AddressSchemaConfig;
  // Both required: themes read them with no fallback, so the default lives
  // only in `THEME_PARAM_DEFAULTS`.
  boldHeaderWork: 'company' | 'position';
  boldHeaderEducation: 'company' | 'position';
}

/**
 * What `ResumeHTML` passes each theme's root component.
 *
 * ⚠️ **No `cvLocale`, and that is the point.** It used to carry one, built by
 * `ResumeHTML` from `getThemeTranslations` — so it was structurally always
 * `addressSchema: { mode: 'default' }` and `boldHeader*: undefined`, i.e. a decoy
 * that looked authoritative. All twelve themes happened to shadow it by calling
 * `useBoundFormatters(data)` themselves, and correctness rested entirely on that
 * habit continuing. Deleting the prop cost **zero** production errors and makes
 * the wrong object unreachable rather than merely unused: a thirteenth theme
 * cannot format an address from an undecorated `cvLocale`, because none is in
 * scope. Found by review.
 *
 * `formatCVDate`/`formatCVDateRange` are equally unread by all twelve roots today
 * and kept only because nothing about them is wrong — they carry no résumé state.
 */
export interface ThemeProps {
  data: ResumeData;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
}

/**
 * A theme's own palette **colours**, keyed by palette id in each theme's
 * `helpers/shared/constants.ts`. Every consumer resolves one entry through
 * `resolvePalette(map, meta.theme.params.palette)` and then reads colour fields
 * off it. (The fallback is `default` on eleven themes and `light` on
 * javascript, which has no `default` palette.)
 *
 * The two-map question has a **rule** rather than a "grep, don't
 * assume" caveat: *a theme declares `PALETTES_PDF` iff the PDF path resolves at
 * least one different colour.* **Nine** themes declare one map and their
 * serializers read it directly; only foggy, skyline and misty declare a second,
 * and each changes a shared key's value (9, 3 and 2 keys respectively, measured
 * per palette).
 *
 * ⚠️ **The hazard the rule replaces.** While the eight aliases existed, giving a
 * theme divergent PDF colours was enough on its own — its serializer already read
 * `PALETTES_PDF`. It is not any more: adding a `PALETTES_PDF` to one of the nine
 * now produces a **dead map and an unchanged PDF** until its serializer is
 * repointed. Repoint the serializer in the same change.
 *
 * ⚠️ **Never index one of these maps directly.** The stored id is unvalidated,
 * so `map[id] || map.default` returns an inherited, truthy value for
 * `constructor` and `__proto__` — which miscoloured all twelve previews and
 * once killed the PDF export on five themes. `resolvePalette`
 * (`shared/palette.ts`) is the one lookup. `preview/__tests__/paletteResolution.test.tsx`
 * asserts the behaviour on every serializer and every HTML component, and
 * scans this directory for a hand-written lookup — a scan rooted at `themes/`,
 * so a palette map indexed from `src/utils/` or an aliased import is on you.
 *
 * ⚠️ It deliberately carries **no** `id` or `ui` (and no `nameKey` — that field
 * is gone from the registry too). Those live on `ThemePaletteMeta` in
 * `ThemeRegistry.ts`, which is what the picker and the icon fill actually read —
 * **two** production sites, both in `DesignTab.tsx`. This said "the seven sites"
 * until five of them were collapsed into `paletteIconFills`. Restating
 * them here duplicated the registry with nothing asserting the two agreed, and
 * they had drifted in every theme that carried them: foggy's default
 * read `Default` against the registry's `Forest`, six of timeless's seven were
 * wrong (`Green` for `Soft Green`, `Default` for `Standard`, …), and skyline,
 * soft and swiss-grid used `common.palettes.*` keys that exist nowhere in
 * `src/locales/en`. The same shape as `ThemeMeta.fonts`, deleted for the
 * same reason.
 *
 * **There is no index signature, and that is load-bearing.** With one, an
 * excess property was absorbed rather than rejected, so a re-added `nameKey`
 * compiled and no test could see it — and a theme's own extra colours were
 * checked by nothing. Every theme now declares its extras on its own
 * `*Palette` interface (lunar was the last), which makes both a typo'd
 * colour and a resurrected metadata field a build error. Do not add one back:
 * declare the field.
 *
 * ⚠️ The remaining live overlap — the palette **id key set** against the
 * registry's — said here for two rounds that it "cannot be a type across two
 * modules". **False**: each theme's map now publishes
 * its keys (`satisfies` + `export type XPaletteId = keyof typeof PALETTES`),
 * `ThemeRegistry.ts`'s `paletteMetas(themeId, …)` consumes them, and
 * `locales/en/themes.ts` owes a display name per id. The runtime guard that
 * sentence pointed at, `__tests__/palettes.test.ts`, is deleted. A universal
 * about what the type system cannot do is worth doubting; this one cost a
 * runtime test that outlived its need by three rounds.
 */
/**
 * ⚠️ **Every field here is required, and that is the whole contract.**
 * Omitting one is `TS2741`; declaring one this interface and the theme's own
 * `*Palette` do not name is `TS2353`, because there is no index signature (see
 * above). Both drift directions are build errors.
 *
 * ⚠️ **The omission half fires per *literal*, and a spread-composed literal owes
 * nothing.** misty's `PALETTES_PDF` entries are `{ ...PALETTES_HTML.default, … }`,
 * so a missing required field is caught on misty's five HTML literals and
 * nowhere else. The excess half is unaffected by spreads (measured). Do not read
 * "both directions" as "at every literal".
 *
 * ⚠️ **Do not add an optional field back.** An optional has neither guarantee: a
 * theme can read `p.textLight` while none of its palettes declares it and that
 * compiles — exactly what lunar did on all seven of its palettes. The two
 * that were optional here, `primaryLight?` and `textLight?`, were never
 * genuinely shared: no code outside a theme read either, and each was
 * per-theme-required or per-theme-absent. They now live as **required** fields
 * on the interfaces of the themes that read them, which turns lunar's shipped
 * bug into `TS2339` and deleted the behavioural guard that had to detect it
 * instead (149 lines of assertions, 198 with its doc block). A colour only some themes want belongs on those themes.
 */
export interface ThemePalette {
  primary: string;
  text: string;
  textMain: string;
  textMuted: string;
  bg: string;
  bgLight: string;
  border: string;
}

/** The keys of `T` that may be omitted. */
type OptionalKeys<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * ⚠️ **The enforcement for the rule above, and it has to be a type.**
 *
 * `paletteInterfaces.test.ts` also asserts zero optionals, but it does so with a
 * line regex (`^\s*name?: type;$`), and a **trailing comment defeats it**:
 * `accentSoft?: string; // only some themes use this` never enters the parsed
 * set, so it is neither counted by that file's size pin nor listed by its
 * optional filter — and the bug shape it guards then compiles clean. Verified by
 * execution during review, and these palette files already use exactly that
 * comment style. `readonly` modifiers and multi-line types are invisible the
 * same way.
 *
 * This operates on the resolved type, so no formatting can hide a field from it.
 * ⚠️ Not `A extends B ? true : never` — that produces **no error at all**, it
 * just resolves to `never`, and a module-scope `const _check` is dead under
 * `noUnusedLocals`. Both are recorded traps in this repo. A type parameter
 * *constrained* to `never` does error (`TS2344`). Mutation-verified: adding any
 * optional field is `TS2344 Type '"…"' does not satisfy the constraint 'never'`.
 */
export type _PaletteHasNoOptionals<Optional extends never = OptionalKeys<ThemePalette>> = Optional;

export type ThemeSection<T = unknown> = {
  id: string;
  label: string;
  content: T[];
  component: (item: T, index: number, label: string, sectionNumber?: string) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UnifiedSectionProps<T = any> {
  data: T;
  /** A custom section rendered by the volunteer component: no volunteer glyph. */
  isCustomSection?: boolean;
  label?: string;
  fontScale: number;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  formatCVDateRange: (start?: string, end?: string) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles?: any;
  p?: ThemePalette;
  // Keyed on `SectionLabelKey`, not `Record<string, string>`: the wider type let
  // a theme read `labels.profiles` — a label no section has — and compile, which
  // is how a dead fifteenth entry survived in every locale. Narrowed, such
  // a read is `TS2339`. The value always originates from `getSectionLabels`, which
  // already returns `Record<SectionLabelKey, string>`.
  labels?: Record<SectionLabelKey, string>;
  boldHeaderWork?: 'company' | 'position';
  boldHeaderEducation?: 'company' | 'position';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<UnifiedSectionProps<T>>;

export interface ImageStyleOptions {
  width?: string | number;
  borderColor?: string;
  borderWidth?: number;
  hasBorder?: boolean;
  shadow?: string | boolean;
  background?: string;
}

export type ResumeSection = ResumeData[Extract<SectionLabelKey, keyof ResumeData>];
