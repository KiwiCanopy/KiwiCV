import { useMemo, useState } from 'react';
import { FaRegFolderOpen } from 'react-icons/fa6';

import { TYPE_CONFIG } from '@/features/extras/utils/changelog';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { renderWithIcons } from '@/utils/text-rendering';
import { ChevronRight } from 'lucide-react';

/** Lines shown inline before the reader is sent to the full changelog. */
const MAX_ITEMS = 5;

interface VersionUpdateChangelogProps {
  /** False when the version shipped no highlight cards. The accordion is then
   *  the only content, so it renders open and its toggle is inert. */
  hasHighlights: boolean;
  grouped: Record<string, string[]>;
  types: string[];
  totalEntries: number;
  missedVersionCount: number;
  onFullChangelog: () => void;
}

/** Collapsible list of every changelog line, grouped by change type. */
export function VersionUpdateChangelog({
  hasHighlights,
  grouped,
  types,
  totalEntries,
  missedVersionCount,
  onFullChangelog,
}: VersionUpdateChangelogProps) {
  const { t } = useTranslation();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const isExpanded = isAccordionOpen || !hasHighlights;

  // Budget shared across type groups: the fifth line ends the list wherever it
  // falls, rather than each group getting five of its own. Resolved up front
  // so the render itself stays free of the running counter.
  const visibleGroups = useMemo(() => {
    const groups: { type: string; items: string[] }[] = [];
    let remaining = MAX_ITEMS;

    for (const type of types) {
      if (remaining <= 0) break;
      const items = grouped[type].slice(0, remaining);
      remaining -= items.length;
      groups.push({ type, items });
    }

    return groups;
  }, [types, grouped]);

  return (
    <div className="relative z-10">
      <div
        className={cn(
          'border-border/50 overflow-hidden rounded-2xl border transition-all duration-300',
          isExpanded ? 'bg-muted/30' : 'bg-transparent',
        )}
      >
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          disabled={!hasHighlights}
          className={cn(
            'flex w-full items-center justify-between p-4 text-left transition-colors',
            hasHighlights ? 'hover:bg-muted/50' : 'cursor-default',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg text-purple-600 dark:text-purple-400">
              <FaRegFolderOpen className="h-4 w-4" />
            </div>
            <div>
              <span className="text-foreground text-sm font-bold">{t('updates.view_details')}</span>
              <p className="text-muted-foreground text-[10px] font-medium">
                {totalEntries}{' '}
                {missedVersionCount > 1
                  ? t('updates.changes_count_multiple')
                  : t('updates.changes_count')}
              </p>
            </div>
          </div>
          {hasHighlights && (
            <ChevronRight
              className={cn(
                'text-muted-foreground h-5 w-5 transition-transform duration-300',
                isAccordionOpen ? 'rotate-90' : '',
              )}
            />
          )}
        </button>

        <div
          className={cn(
            'transition-all duration-500 ease-in-out',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="space-y-6 border-t border-blue-200/20 p-5 dark:border-blue-500/10">
            {types.length > 0 ? (
              <>
                {visibleGroups.map(({ type, items: visibleItems }) => {
                  const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;
                  const Icon = config.icon;

                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Icon className={cn('h-4 w-4', config.color)} />
                        <h5 className="text-foreground text-[11px] font-black tracking-wider uppercase opacity-60">
                          {t(`changelog.types.${type}`)}
                        </h5>
                      </div>
                      <ul className="space-y-3">
                        {visibleItems.map((content, idx) => (
                          <li
                            key={idx}
                            className="text-foreground/90 flex items-start gap-3 text-sm leading-relaxed"
                          >
                            <div
                              className={cn('mt-2 h-1 w-1 shrink-0 rounded-full', config.bgColor)}
                            />
                            <span>{renderWithIcons(content)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {totalEntries > MAX_ITEMS && (
                  <button
                    type="button"
                    onClick={onFullChangelog}
                    className="text-primary-strong hover:text-foreground group flex items-center gap-2 px-1 pt-2 text-xs font-bold transition-colors"
                  >
                    <div className="bg-primary/20 flex h-5 w-5 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    {t('updates.more_highlights_desc')}
                  </button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm italic">
                {t('common.empty_list')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
