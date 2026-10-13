import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { InfoCard, type InfoCardColor } from '@/components/ui/InfoCard';
import { Section } from '@/components/ui/Section';
import { type VersionHighlight, changelog } from '@/data/changelog';
import { getHighlightStyle } from '@/data/changelogHighlights';
import { TYPE_CONFIG, TYPE_ORDER, parseChangelogEntry } from '@/features/extras/utils/changelog';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, History, Rocket } from 'lucide-react';

/**
 * The shared `HIGHLIGHT_STYLES` map (see `@/data/changelogHighlights`) stores a
 * semantic `InfoCardColor` token; the badge here is a bordered `<span>`, so it
 * resolves the token to its own classes. Every current highlight is `brand`.
 */
const BADGE_CLASSES: Record<InfoCardColor, string> = {
  brand: 'text-primary-strong bg-primary/10 border-primary-strong/30',
  neutral: 'text-muted-foreground bg-muted/40 border-border',
  success: 'text-success bg-success/10 border-success/30',
  warning: 'text-warning bg-warning/10 border-warning/30',
  danger: 'text-danger bg-danger/10 border-danger/30',
};

interface RawChangelogEntry {
  _highlights?: Record<string, { badge: string; title: string; content: string }>;
  [key: string]:
    string | Record<string, { badge: string; title: string; content: string }> | undefined;
}

interface Highlight extends VersionHighlight {
  badge?: string;
  title?: string;
  content?: string;
}

function HighlightBadge({ highlight }: { highlight: Highlight }) {
  const [open, setOpen] = useState(false);
  const { icon: Icon, token } = getHighlightStyle(highlight.id);
  const hasExplanation = Boolean(highlight.title || highlight.content);

  const badgeElement = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all select-none',
        hasExplanation ? 'cursor-help hover:scale-105 hover:shadow-sm' : 'cursor-default',
        BADGE_CLASSES[token],
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {highlight.badge}
    </span>
  );

  if (!hasExplanation) return badgeElement;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="focus:outline-none"
        >
          {badgeElement}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          onClick={(e) => e.stopPropagation()}
          className="animate-in fade-in bg-card border-primary-strong/30 z-[110] w-[calc(100vw-64px)] max-w-[280px] rounded-xl border p-3 shadow-lg transition-opacity duration-200 sm:w-64"
        >
          {highlight.title && (
            <p className="text-foreground mb-1 text-xs font-bold">{highlight.title}</p>
          )}
          {highlight.content && (
            <p className="text-muted-foreground text-xs leading-relaxed">{highlight.content}</p>
          )}
          <Popover.Arrow
            className="fill-card stroke-primary-strong/30 stroke-[1.5px]"
            width={12}
            height={6}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export const ChangelogTab = () => {
  const { t, tObject, formatUIDate } = useTranslation();
  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get('v');
  const scrollRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v');
    if (v && changelog.some((e) => e.version === v)) {
      return { [v]: true };
    }
    return { [changelog[0]?.version]: true };
  });

  useEffect(() => {
    if (versionParam && changelog.some((e) => e.version === versionParam)) {
      // Small delay to ensure the view is ready and any layout shifts have settled
      const timer = setTimeout(() => {
        // Ensure it's expanded if the param changes while already mounted
        // Moving this here also solves the lint error for synchronous setState in effect
        setExpandedVersions({ [versionParam]: true });

        const element = scrollRef.current[versionParam];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [versionParam]);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }));
  };

  return (
    <div className="w-full max-w-none space-y-12 px-1">
      <div className="space-y-2 px-2">
        <h2 className="text-foreground text-3xl font-extrabold">{t('changelog.title')}</h2>
        <p className="text-foreground/60 text-lg leading-relaxed">{t('changelog.intro')}</p>
      </div>

      <div className="space-y-8">
        {changelog.map((entry, index) => {
          const rawEntries = tObject<RawChangelogEntry>(`changelog.entries.${entry.id}`) || {};

          const entries = Object.entries(rawEntries)
            .map(([key, val]) => parseChangelogEntry(key, String(val)))
            .filter((e): e is { type: string; content: string } => e.type !== null);

          const grouped = entries.reduce(
            (acc, curr) => {
              if (!acc[curr.type]) acc[curr.type] = [];
              acc[curr.type].push(curr.content);
              return acc;
            },
            {} as Record<string, string[]>,
          );

          const types = Object.keys(grouped).sort(
            (a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b),
          );

          const isExpanded = !!expandedVersions[entry.version];

          const highlightsMetadata = entry.highlights || [];
          const highlightsTranslations = rawEntries._highlights || {};
          const highlights: Highlight[] = highlightsMetadata.map((meta) => ({
            ...meta,
            ...(highlightsTranslations[meta.id] || {}),
          }));

          return (
            <div
              key={entry.version}
              ref={(el) => {
                scrollRef.current[entry.version] = el;
              }}
              className={cn(
                'group overflow-hidden rounded-2xl border transition-colors duration-200',
                versionParam === entry.version
                  ? 'border-primary-strong/40 bg-secondary shadow-[var(--elevation-1)]'
                  : 'border-border bg-card',
              )}
            >
              {/* Version Header Card. The highlight badges are popover
                  <button>s, so they live NEXT TO the toggle button rather than
                  inside it — a button nested in a button is invalid HTML and
                  React flags it as a hydration hazard. */}
              <div className="border-border hover:bg-secondary flex w-full flex-col gap-4 border-b p-6 transition-colors sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => toggleVersion(entry.version)}
                  aria-expanded={isExpanded}
                  aria-controls={`changelog-${entry.version}`}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left select-none"
                >
                  <span className="bg-secondary text-primary-strong flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <History className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-foreground font-mono text-xl font-black tracking-tighter">
                      v{entry.version}
                    </span>
                    <ChevronDown
                      className={cn(
                        'text-muted-foreground/50 h-5 w-5 transition-transform duration-300',
                        isExpanded ? 'rotate-180' : '',
                      )}
                    />
                  </span>
                </button>

                <span className="flex flex-wrap items-center justify-end gap-3 self-end sm:self-center">
                  {entry.isMajor && (
                    <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold tracking-wider uppercase">
                      <Rocket className="h-3.5 w-3.5" />
                      {t('updates.major_release')}
                    </span>
                  )}
                  {highlights.map((highlight) => (
                    <HighlightBadge key={highlight.id} highlight={highlight} />
                  ))}
                  <span className="border-border bg-background flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-semibold">
                    <span className="text-foreground font-mono text-[11px] font-extrabold tracking-widest uppercase transition-colors">
                      {formatUIDate(entry.date)}
                    </span>
                  </span>
                </span>
              </div>

              {/* Collapsible Content */}
              <div id={`changelog-${entry.version}`} hidden={!isExpanded} className="p-6 pt-2">
                {highlights.length > 0 && (
                  <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {highlights.map((highlight) => {
                      const { icon: Icon, token } = getHighlightStyle(highlight.id);
                      const fullDescription =
                        highlight.title && highlight.content
                          ? `${highlight.title}: ${highlight.content}`
                          : highlight.content || highlight.title;

                      return (
                        <InfoCard
                          key={highlight.id}
                          icon={Icon}
                          label={highlight.badge || highlight.title || ''}
                          description={fullDescription}
                          color={token}
                        />
                      );
                    })}
                  </div>
                )}
                <div className="mt-2 grid grid-cols-1 gap-y-4">
                  {types.map((type) => {
                    const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;
                    const Icon = config.icon;

                    return (
                      <Section
                        key={type}
                        variant="nested"
                        title={t(`changelog.types.${type}`)}
                        collapsible
                        itemCount={grouped[type].length}
                        icon={<Icon className={cn('h-5 w-5', config.color)} />}
                        defaultCollapsed={!(type === 'feat' || (index === 0 && type === types[0]))}
                      >
                        <ul className="space-y-4 md:space-y-5">
                          {grouped[type].map((content, idx) => (
                            <li
                              key={idx}
                              className="text-foreground/80 group/item flex items-start gap-4 text-sm leading-relaxed md:text-[15px]"
                            >
                              <div className="relative mt-[6px] flex-shrink-0">
                                <div
                                  className={cn(
                                    'h-2 w-2 rounded-full',
                                    config.bgColor,
                                    'ring-background ring-2 ring-offset-0',
                                  )}
                                />
                              </div>
                              <span className="group-hover/item:text-foreground overflow-hidden break-words transition-colors">
                                {content}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Section>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
