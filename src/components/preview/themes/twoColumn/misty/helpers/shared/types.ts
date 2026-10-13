import type { ThemePalette, UnifiedSectionProps } from '@/components/preview/themes/shared';

export interface MistyPalette extends ThemePalette {
  primaryHover: string;
  primaryVeryLight: string;
  /**
   * ⚠️ **Not a restatement — `ThemePalette` does not declare this at
   * all.** It used to be an optional there and this a narrowing to required; the
   * field now lives on the five themes that read it, misty among them.
   * Mutation-verified as `TS2741`, but ⚠️ only on misty's **HTML** literals:
   * `PALETTES_PDF` is built by spreading `PALETTES_HTML.*`, so it inherits the
   * field and would not independently fail. All eight of misty's own readers use
   * `p?.textLight` and would tolerate its absence, so those five HTML literals
   * are the entire enforcement.
   *
   * ⚠️ That spread is also why "misty `PALETTES_PDF` declares five dead
   * `textLight` values" was not a deletion: there is nothing declared there to
   * delete. Only misty's **`primaryLight`** overrides were real dead
   * declarations, and they are gone — misty reads `primaryLight` nowhere, and it
   * is `SkylinePalette`'s field now.
   */
  textLight: string;
  bgPage: string;
  bgCard: string;
  bgSidebar: string;
  // `textMain`, `bgLight`, `text` and `textMuted` were dead restatements.
}

export type MistySharedProps<T = unknown> = UnifiedSectionProps<T> & {
  p: MistyPalette;
  labels: Record<string, string>;
  styles?: Record<string, never>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnifiedSectionComponent<T = any> = React.ComponentType<MistySharedProps<T>>;
