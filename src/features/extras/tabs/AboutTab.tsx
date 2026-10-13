import { Section } from '@/components/ui/Section';
import { SIBLING_PRODUCTS } from '@/config/brand';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowUpRight } from 'lucide-react';

export const AboutTab = () => {
  const { t } = useTranslation();

  // Literal `t()` keys per product so i18n:check can see them; keyed by the
  // brand name held in SIBLING_PRODUCTS.
  const descriptions: Record<string, string> = {
    KiwiCanopy: t('extras.about.kiwicanopy_desc'),
    KiwiDesk: t('extras.about.kiwidesk_desc'),
  };

  return (
    <div className="space-y-8">
      <Section title={t('extras.about.title')}>
        <div className="space-y-4">
          <h3 className="text-foreground text-xl font-extrabold">
            {t('extras.about.story_title')}
          </h3>
          <p className="text-foreground/80 leading-relaxed">{t('extras.about.story_p1')}</p>
          <p className="text-foreground/80 leading-relaxed">{t('extras.about.story_p2')}</p>
        </div>
      </Section>

      <Section title={t('extras.about.family_title')}>
        <div className="space-y-4">
          <p className="text-foreground/80 leading-relaxed">{t('extras.about.family_intro')}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SIBLING_PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-border/60 bg-card hover:border-primary-strong/30 focus-visible:ring-primary-strong flex flex-col gap-2 rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground text-lg font-bold tracking-tight">
                    {product.name}
                  </span>
                  <ArrowUpRight className="text-muted-foreground/50 group-hover:text-primary-strong h-5 w-5 shrink-0 transition-colors" />
                </div>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {descriptions[product.name]}
                </p>
                <span className="text-primary-strong mt-1 text-xs font-semibold tracking-wide uppercase">
                  {t('extras.about.visit_site')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
};
