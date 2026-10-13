import { getThemeMeta } from '@/components/preview/ThemeRegistry';
import { ThemeHeadingContext, getThemeTranslations } from '@/components/preview/themes/shared';
import { useTranslation } from '@/hooks/useTranslation';
import type { ResumeData } from '@/types/resume';
import { generateJSONWithPlaceholders } from '@/utils/placeholder-fallback';

interface ResumeHTMLProps {
  data: ResumeData;
  headingTag?: 'h1' | 'h2' | 'div';
}

export const ResumeHTML = ({ data, headingTag }: ResumeHTMLProps) => {
  // ⚠️ No `cvLocale` here on purpose. `useTranslation` builds one from
  // `getThemeTranslations`, so its `addressSchema` is always `{ mode: 'default' }`
  // and its `boldHeader*` always `undefined`. Passing it down made it a decoy
  // every theme had to remember to shadow; each root calls
  // `useBoundFormatters(data)` itself and gets the résumé's own settings.
  // `bcp47` below is exempt: it depends on the locale code alone.
  const { tCV, formatCVDate, formatCVDateRange } = useTranslation(data.meta);
  // ⚠️ The fallback used to be `'macchiato'`, a theme that is not in
  // `ALL_THEME_IDS` and never has been — a sixth restatement of "the default
  // theme" naming one that does not exist. Inert (it resolved to `DEFAULT_THEME`
  // like any other unknown string), and deleted rather than corrected: passing
  // the raw value lets `getThemeMeta` own the fallback, which is its job.
  // Found by the architect pass.
  const themeId = data.meta.theme.name;
  const { HTMLComponent } = getThemeMeta(themeId);

  // Enrich data with placeholders if empty
  const enrichedData = generateJSONWithPlaceholders(data, tCV);

  // The CV's language, not the UI's: CSS `text-transform: uppercase` follows
  // `lang`, and Turkish uppercases `i` to `İ`.
  const { bcp47 } = getThemeTranslations(data.meta.theme.locale || 'en');

  return (
    <ThemeHeadingContext.Provider value={{ as: headingTag || 'h1' }}>
      <div lang={bcp47} style={{ display: 'contents' }}>
        <HTMLComponent
          data={enrichedData}
          formatCVDate={formatCVDate}
          formatCVDateRange={formatCVDateRange}
        />
      </div>
    </ThemeHeadingContext.Provider>
  );
};
