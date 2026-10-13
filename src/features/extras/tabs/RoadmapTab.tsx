import { useSearchParams } from 'react-router-dom';

import { SUPPORT_EMAIL } from '@/constants/contact';
import { changelog } from '@/data/changelog';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, ExternalLink, Mail, Square } from 'lucide-react';

// Copy lives in `roadmap.items.<key>.{title,desc}` across all fifteen locales.
// `roadmap.items.` is registered in the dynamic-key allowlist (scripts/i18n/config.cjs).
const roadmapItems = [
  { key: 'mobile_support_v1', done: true, version: '2.0.0' },
  { key: 'live_preview', done: true, version: '2.0.0' },
  { key: 'layout_switch', done: true, version: '2.0.0' },
  { key: 'cloud_sync', done: true, version: '3.0.0' },
  { key: 'llm_integration', done: true, version: '3.0.0' },
  { key: 'matching_cover_letters', done: true, version: '4.1.0' },
  { key: 'ai_cover_letters', done: true, version: '4.4.0' },
  { key: 'mobile_support', done: false },
  { key: 'more_themes', done: false },
] as const;

export const RoadmapTab = () => {
  const { t, formatUIDate } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const getItemCopy = (item: (typeof roadmapItems)[number], field: 'title' | 'desc') =>
    t(`roadmap.items.${item.key}.${field}`);

  const plannedItems = roadmapItems.filter((item) => !item.done);
  const releasedItems = roadmapItems
    .filter((item) => item.done)
    .sort((a, b) => {
      const releaseA = changelog.find((entry) => entry.version === a.version);
      const releaseB = changelog.find((entry) => entry.version === b.version);
      if (releaseA && releaseB) {
        return new Date(releaseB.date).getTime() - new Date(releaseA.date).getTime();
      }
      return 0;
    });

  const handleViewChangelog = (version?: string) => {
    setSearchParams({ tab: 'changelog', ...(version && { v: version }) });
  };

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-foreground text-3xl font-extrabold">{t('roadmap.title')}</h2>
        <p className="text-foreground/60 text-lg leading-relaxed">{t('roadmap.intro')}</p>
      </div>

      {/* Planned Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary-strong rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            {t('roadmap.status.planned')}
          </span>
          <div className="bg-border/40 h-px flex-1" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plannedItems.map((item) => (
            <div
              key={item.key}
              className="group bg-card border-border/60 hover:border-primary-strong/20 flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="border-muted-foreground/20 text-muted-foreground/30 group-hover:border-primary-strong/30 group-hover:text-primary-strong/40 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors">
                <Square className="h-4 w-4" strokeWidth={3} />
              </div>
              <div className="min-w-0 space-y-2">
                <h4 className="text-foreground text-lg leading-tight font-bold">
                  {getItemCopy(item, 'title')}
                </h4>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {getItemCopy(item, 'desc')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggest Feature Mid-Banner */}
      <div className="bg-secondary border-border rounded-3xl border p-8 sm:p-10">
        <div className="flex flex-col items-center justify-between gap-10 text-center md:flex-row md:text-left">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-foreground text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
                {t('roadmap.contact_text')}
              </h3>
              <p className="text-foreground/60 mx-auto max-w-md text-sm leading-relaxed sm:text-base md:mx-0">
                {t('roadmap.contact_subtitle')}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3">
            <span className="text-muted-foreground/60 text-[10px] font-black tracking-[0.3em] uppercase">
              {t('roadmap.suggest_via')}
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="btn-primary group/btn min-h-11 gap-3 px-6 py-3 text-base"
            >
              <div className="bg-primary-foreground/10 rounded-lg p-1.5">
                <Mail className="h-5 w-5" />
              </div>
              <span className="tracking-wide">{t('roadmap.mail')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Released Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="bg-success/10 text-success rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
            {t('roadmap.status.released')}
          </span>
          <div className="bg-border/40 h-px flex-1" />
        </div>

        <div className="space-y-4">
          {releasedItems.map((item) => {
            const releaseInfo = changelog.find((entry) => entry.version === item.version);
            return (
              <div
                key={item.key}
                className="bg-secondary border-border flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center"
              >
                <div className="bg-success/10 text-success flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h4 className="text-foreground text-lg font-bold italic opacity-80">
                      {getItemCopy(item, 'title')}
                    </h4>
                  </div>
                  <p className="text-foreground/50 text-sm leading-relaxed italic">
                    {getItemCopy(item, 'desc')}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => handleViewChangelog(item.version)}
                    className="btn-outline group flex min-h-11 items-center gap-2.5 px-4 py-2 text-sm font-semibold"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground text-[10px] font-extrabold tracking-widest uppercase transition-colors">
                      V{item.version} • {releaseInfo ? formatUIDate(releaseInfo.date) : ''}
                    </span>
                    <ExternalLink className="text-muted-foreground/50 group-hover:text-primary-strong h-3.5 w-3.5 transition-colors" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
