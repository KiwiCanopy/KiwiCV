import type { ThemeId } from '@/components/preview/themeIds';
import type { ThemePaletteIds } from '@/components/preview/themePaletteIds';
import type { SectionLabelKey } from '@/components/preview/themes/shared/sections';

/**
 * The theme picker looks these up dynamically — `t(theme.nameKey)`, where
 * `nameKey` is an unchecked `string` on `ThemeMeta`. `scripts/i18n/check-usage.cjs`
 * cannot see a dynamic lookup — the picker's calls are in fact explicitly
 * allowlisted at `scripts/i18n/config.cjs:58-66`, which is the hole itself — so a
 * theme registered without an entry here used to show its raw key
 * (`themes.names.foo`) in the picker, in all fifteen locales at once.
 *
 * `satisfies Record<ThemeId, string>` moves both drift directions to the
 * compiler at the definition site: a registered theme with no name here is a
 * build error, and so is a name for a theme that is not registered. One
 * assertion covers all fifteen locales because `checkLocales` already enforces
 * key-for-key parity against English, and the other fourteen files are typed
 * `Translations['themes']`, which is derived from this object.
 *
 * `ThemeId` comes from `themeIds.ts`, exactly as `themes/shared/fonts.ts` takes
 * it: a value import of `ThemeRegistry` from a locale file would close a cycle
 * (`ThemeRegistry` -> every `*HTML.tsx` -> `themes/shared` -> the locales), and
 * that module imports nothing at all.
 */
export const themes = {
  names: {
    elegant: 'Elegant',
    foggy: 'Foggy',
    javascript: 'JavaScript',
    lunar: 'Lunar',
    misty: 'Misty',
    plain: 'Plain',
    plain2: 'Plain 2',
    skyline: 'Skyline',
    soft: 'Soft',
    stackoverflow: 'Stack Overflow',
    swiss_grid: 'Swiss Grid',
    timeless: 'Timeless',
  } satisfies Record<ThemeId, string>,

  /**
   * Every palette's display name, keyed by theme and then by palette id — the
   * `themes.palettes.<themeId>.<paletteId>` that `paletteNameKey` composes.
   *
   * ⚠️ **These were English literals living on `ThemeMeta` until they moved
   * here.** The picker rendered `t(p.nameKey) || p.nameKey` and `nameKey`
   * held `'Arctic Mint'`, so the lookup missed every time and the `||` printed the English —
   * in all fifteen locales, silently, because a missing key and a display string
   * look identical to `t()`.
   *
   * ⚠️ **Keyed by theme, not by name**, and the duplication is deliberate: the
   * forty palettes share only twenty-four distinct English names, but `default`
   * is `Default` on misty, `Forest` on foggy and `Standard` on timeless, so no
   * id-keyed table can serve them. It also lets a translator give the same
   * English word different renderings where a theme's tone calls for it.
   *
   * The `satisfies` is the whole guarantee, and it is the same one
   * `names` above makes: `ThemePaletteIds[K]` comes off each theme's own palette
   * map (`keyof typeof PALETTES`), so a palette added without a name here is a
   * build error, and so is a name for a palette that does not exist. One
   * assertion covers all fifteen locales — `checkLocales` enforces key-for-key
   * parity against English, and the other fourteen files are typed
   * `Translations['themes']`, which is derived from this object.
   *
   * ⚠️ Type-only import, like `ThemeId` above and for the same reason: a value
   * import of `ThemeRegistry` from a locale file would close a cycle
   * (`ThemeRegistry` -> every `*HTML.tsx` -> `themes/shared` -> the locales).
   * `themePaletteIds.ts` re-exports nothing but types.
   */
  palettes: {
    elegant: {
      default: 'Default',
    },
    foggy: {
      default: 'Forest',
      ocean: 'Ocean',
      pink: 'Pink',
      purple: 'Purple',
      sunset: 'Sunset',
    },
    javascript: {
      dark: 'Dark',
      light: 'Light',
    },
    lunar: {
      berry: 'Midnight Berry',
      cyan: 'Cyan',
      default: 'Default',
      lavender: 'Lavender Mist',
      lilac: 'Lilac Breeze',
      mint: 'Arctic Mint',
      orchid: 'Royal Orchid',
    },
    misty: {
      default: 'Default',
      ocean: 'Ocean',
      pink: 'Pink',
      purple: 'Purple',
      sunset: 'Sunset',
    },
    plain: {
      default: 'Default',
    },
    plain2: {
      default: 'Default',
    },
    skyline: {
      default: 'Default',
      green: 'Green',
      sunset: 'Sunset',
    },
    soft: {
      default: 'Default',
      ocean: 'Ocean',
    },
    stackoverflow: {
      dark: 'Dark',
      default: 'Default',
    },
    swiss_grid: {
      blue: 'Blue',
      default: 'Default',
      green: 'Green',
      rose: 'Rose',
    },
    timeless: {
      blue: 'Soft Blue',
      default: 'Standard',
      green: 'Soft Green',
      lavender: 'Soft Lavender',
      orange: 'Soft Orange',
      rose: 'Soft Rose',
      white: 'White',
    },
  } satisfies { [K in ThemeId]: Record<ThemePaletteIds[K], string> },
};

export const theme_translations = {
  bcp47: 'en-US',
  present: 'Present',
  /**
   * Every section header a theme can print: the twelve `DataSectionKey`s plus the
   * two synthesised labels `about` and `contact` — exactly `SectionLabelKey`.
   *
   * `satisfies Record<SectionLabelKey, string>` moves both drift directions to
   * the compiler at the definition site, the same guarantee as `names` and
   * `palettes` above: a missing label is a build error, and so is a label for
   * something that is not a section — which is what a fifteenth `profiles` entry
   * was, shipped in all fifteen locales and read only by an unimported stub.
   * One assertion covers all fifteen because `checkLocales` enforces
   * key-for-key parity and the other fourteen files are typed
   * `Translations['themes']`, derived from this object.
   */
  sections: {
    about: 'About',
    awards: 'Awards',
    certificates: 'Certificates',
    contact: 'Contact',
    customSection: 'Additional Details',
    education: 'Education',
    interests: 'Interests',
    languages: 'Languages',
    privateProjects: 'Private Projects',
    projects: 'Projects',
    publications: 'Publications',
    references: 'References',
    skills: 'Skills',
    volunteer: 'Volunteer',
    work: 'Experience',
  } satisfies Record<SectionLabelKey, string>,
};
