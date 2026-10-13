import { memo } from 'react';

import { type ThemeMeta, paletteNameKey } from '@/components/preview/ThemeRegistry';
import type { ThemeId } from '@/components/preview/themeIds';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { Paintbrush } from 'lucide-react';

/**
 * ⚠️ A palette's swatch is **one colour**. This component used to branch
 * on `p.ui.length` into a solid fill, a two-stop linear gradient or a conic one
 * — and every one of the forty registry palettes declared exactly one colour, so
 * two of the three branches had never run in any locale, on any theme. They are
 * deleted rather than kept as headroom: a gradient swatch needs a second colour
 * before it needs code, and `ThemePaletteMeta.ui` records how to bring both
 * back.
 */
const SUBTLE_OVERLAY =
  'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)';

interface ColorPickerProps {
  /**
   * The theme the palettes belong to — half of the `themes.palettes.…` name key.
   *
   * ⚠️ `ThemeId`, not `string`. With both parameters `string`, the review pass
   * swapped `paletteNameKey`'s arguments here and at `DesignTab.tsx` and the raw
   * key rendered in every locale with `tsc`, the suite and lint all clean.
   */
  themeId: ThemeId;
  /**
   * ⚠️ `ThemeMeta['palettes']`, not a structural restatement of it. This prop
   * used to spell the shape out inline *and* admit `undefined`, which is what
   * paid for the early return and the `currentPalettes[0]?.id` below — neither
   * state was reachable, since every theme has always had at least one palette
   *
   */
  currentPalettes: ThemeMeta['palettes'];
  localPaletteId: string | undefined;
  setLocalPaletteId: (id: string) => void;
  t: (path: string) => string;
}

export const ColorPicker = memo(
  ({ themeId, currentPalettes, localPaletteId, setLocalPaletteId, t }: ColorPickerProps) => {
    const resume = useResumeStore((state) => state.resume);
    const updateMeta = useResumeStore((state) => state.updateMeta);

    return (
      <div className="flex flex-col items-start space-y-3 text-left">
        <SectionLabel label={t('design.color_chooser')} icon={<Paintbrush size={20} />} />
        <div className="flex flex-wrap items-center gap-3">
          {currentPalettes.map((p) => {
            const isPaletteActive =
              localPaletteId === p.id || (!localPaletteId && currentPalettes[0].id === p.id);
            // ⚠️ No `|| p.nameKey` fallback: the key is composed from ids the
            // locale table is checked against, so a miss is a build error rather
            // than something to paper over at runtime. The old fallback is why
            // fifteen locales showed English and nobody noticed.
            const name = t(paletteNameKey(themeId, p.id));

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id === localPaletteId) return;
                  setLocalPaletteId(p.id);
                  analytics.track(ANALYTICS_EVENTS.PALETTE_CHANGED, {
                    paletteId: p.id,
                    theme: resume.meta.theme.name,
                  });
                  setTimeout(() => {
                    updateMeta({
                      theme: {
                        ...resume.meta.theme,
                        params: { ...resume.meta.theme.params, palette: p.id },
                      },
                    });
                  }, 0);
                }}
                className={`relative h-11 w-11 overflow-hidden rounded-full border border-black/10 transition-transform ${
                  isPaletteActive
                    ? 'ring-primary-strong ring-offset-background ring-2 ring-offset-2'
                    : 'hover:scale-105'
                }`}
                style={{ background: `${SUBTLE_OVERLAY}, ${p.ui}` }}
                title={name}
                aria-label={name}
                aria-pressed={isPaletteActive}
              >
                {isPaletteActive && (
                  <div className="absolute inset-0 rounded-full border border-black/10 shadow-[inner_0_1px_2px_rgba(0,0,0,0.2)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';
