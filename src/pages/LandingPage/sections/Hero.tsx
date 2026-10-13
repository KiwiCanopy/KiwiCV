import { useState } from 'react';

import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { HeroGraphic } from '@/pages/LandingPage/sections/components/HeroGraphic';
import {
  DEFAULT_HERO_THEME,
  HERO_THEMES,
  type HeroThemeName,
} from '@/pages/LandingPage/sections/components/heroThemes';
import { ArrowRight, FileInput, Palette } from 'lucide-react';

interface HeroProps {
  /** A non-empty CV is stored in this browser; the primary action then resumes it. */
  hasCv: boolean;
  onCreate: () => void;
  onImport: () => void;
}

export function Hero({ hasCv, onCreate, onImport }: HeroProps) {
  const { t } = useTranslation();
  const [heroTheme, setHeroTheme] = useState<HeroThemeName>(DEFAULT_HERO_THEME);

  // ⚠️ The vertical padding is asymmetric on phones ONLY: `pt-6 pb-14`. Below
  // `sm` the bar above this hero is the blended logo bar (`MainLayout`), so the
  // old symmetric `py-14` stacked 56px of hero padding under a 64px bar, and the
  // content started a third of the way down the screen. Below `lg` the h1 opens
  // the hero (the eyebrow is desktop-only; the bar shows the brand).
  // `sm:py-20` takes over at every larger width and restores the symmetric pair,
  // so the desktop hero is untouched — keep any change to the phone gap in
  // `pt-6` alone.
  return (
    <section className="bg-background border-border relative overflow-hidden border-b px-5 pt-6 pb-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)] lg:gap-16">
        <div className="max-w-2xl">
          {/* Desktop only: below `lg` the header bar already shows the logo and name. */}
          <div className="mb-5 hidden items-center gap-2 text-sm font-semibold lg:flex">
            <span className="bg-kiwi h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            KiwiCV
          </div>
          <h1 className="text-[2rem] leading-[1.18] font-extrabold tracking-[-0.035em] text-balance sm:text-5xl sm:leading-[1.12]">
            {t('landing.hero.title')}
          </h1>
          {/* ⚠️ Rendered as markup so the emphasis can travel WITH the words.
              German reorders the clause, so a fixed `<span>` in the JSX would
              highlight the wrong fragment there.
              The emphasis is weight, not colour. The page's `text-primary-strong`
              convention was tried first and looked wrong here — it works on the
              short section titles that carry it ("No subscriptions.") and turns
              a long clause inside a running sentence into a link-alike. Italic
              was the other option and reads as a caveat, which is the wrong tone
              for a capability. */}
          <p
            className="text-muted-foreground mt-6 max-w-[62ch] text-base leading-7 text-pretty sm:text-lg"
            dangerouslySetInnerHTML={{ __html: t('landing.hero.subtitle') }}
          />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCreate}
              className="btn-primary min-h-11 gap-2 px-5 py-3"
            >
              {hasCv ? t('cvs.continue_editing') : t('landing.hero.primary_action')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onImport}
              className="btn-outline bg-card min-h-11 gap-2 px-5 py-3"
            >
              <FileInput className="h-4 w-4" aria-hidden="true" />
              {t('landing.hero.secondary_action')}
            </button>
          </div>

          {/* The price, beside the buttons it applies to. The privacy summary that
              sat here is the Privacy section's own text, so it is not repeated. */}
          <p className="text-muted-foreground mt-5 text-sm">{t('landing.hero.pricing_note')}</p>
        </div>

        <div className="space-y-3">
          <HeroGraphic themeName={heroTheme} />

          {/* Outside `HeroGraphic`, deliberately: its root is `aria-hidden`, and
              a focusable control in there would be keyboard-reachable while
              staying invisible to assistive tech. */}
          <div className="mx-auto flex w-full max-w-[42rem] flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <p
              className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm font-semibold"
              id="hero-theme-switcher-label"
            >
              {/* `Palette` is the Design tab's own glyph, and the mock above
                  this strip paints it on that very tab — so the control echoes
                  what it demonstrates. Not `Sparkles` (this app's AI marker,
                  which would read as "AI changes your design") and not `Zap`
                  (the AI-cost glyph, which would read as "this costs you
                  something"). Swapping a theme is instant, local and free. */}
              <Palette className="text-primary-strong h-4 w-4" aria-hidden="true" />
              {t('landing.hero.theme_switcher_label')}
            </p>
            {/* ⚠️ No `variant="pill"`. `rect` is the component's default and what
                every toggle in the app itself wears — HTML/PDF in the preview
                header, Edit/Design in the dashboard. The hero exists to depict
                the app, so a rounder, shorter switcher here made the one control
                a visitor touches before signing up the one that looks unlike
                the product. It was also off the 8/12/16/24px radius scale and
                `h-9` against the `min-h-11` target size used everywhere else. */}
            <SegmentedToggle
              value={heroTheme}
              onChange={setHeroTheme}
              className="w-full max-w-[20rem]"
              options={HERO_THEMES.map((name) => ({
                value: name,
                label: t(`themes.names.${name}`),
              }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
