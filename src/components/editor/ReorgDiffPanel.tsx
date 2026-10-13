import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import { Check, History, ListChecks, Trash2, X } from 'lucide-react';

export const ReorgDiffPanel: React.FC = () => {
  const { t } = useTranslation();
  const reorg = useResumeStore((state) => state.ai.reorgSuggestion);
  const acceptReorg = useResumeStore((state) => state.acceptReorg);
  const declineReorg = useResumeStore((state) => state.declineReorg);

  const [view, setView] = useState<'original' | 'proposed'>('proposed');
  const [hasSwapped, setHasSwapped] = useState(false);

  const { isStandard } = useEditorBreakpoints();

  if (!reorg || reorg.sectionKey !== 'skills') return null;

  const { originalItems, proposedItems, classification } = reorg;

  const added = proposedItems
    .map((item, i) => ({ item, key: `proposed_${i}` }))
    .filter(({ key }) => classification[key] === 'added');

  const modified = proposedItems
    .map((item, i) => ({ item, key: `proposed_${i}` }))
    .filter(({ key }) => classification[key] === 'modified');

  const unchanged = proposedItems
    .map((item, i) => ({ item, key: `proposed_${i}` }))
    .filter(({ key }) => classification[key] === 'unchanged');

  const removed = originalItems.filter(
    (item) => classification[`original_${item._vId}`] === 'removed',
  );

  const modifiedSources = originalItems.filter((item) => {
    const isRemoved = classification[`original_${item._vId}`] === 'removed';
    if (isRemoved) return false;
    return modified.some((m) =>
      ((m.item._sourceVIds as string[]) || []).includes(item._vId as string),
    );
  });

  const originalChanges = [...removed, ...modifiedSources];
  const originalUnchanged = originalItems.filter(
    (item) => !removed.includes(item) && !modifiedSources.includes(item),
  );

  return (
    <div
      className={cn(
        'border-primary-strong/20 bg-primary/5 overflow-hidden border',
        isStandard ? 'mb-8 rounded-2xl' : 'mb-6 rounded-xl',
      )}
    >
      <div
        className={cn(
          'border-primary-strong/10 bg-primary/10 flex flex-wrap items-center justify-between gap-3 border-b',
          isStandard ? 'px-6 py-4' : 'px-4 py-3',
        )}
      >
        <SegmentedToggle
          value={view}
          onChange={(newView) => {
            setView(newView);
            setHasSwapped(true);
            analytics.track(ANALYTICS_EVENTS.AI_REORG_VIEW_TOGGLED, { view: newView });
          }}
          variant="pill"
          className={cn('h-8', isStandard ? 'w-48' : 'w-40')}
          options={[
            { value: 'original', label: t('ai.reorg_original_short') },
            { value: 'proposed', label: t('ai.reorg_proposed_short') },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              analytics.track(ANALYTICS_EVENTS.AI_REORG_REJECTED, {
                hasSwapped,
                currentView: view,
                sectionKey: reorg.sectionKey,
              });
              declineReorg();
            }}
            variant="secondary"
            size="sm"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('ai.reorg_reject')}</span>
          </Button>
          <Button
            onClick={() => {
              analytics.track(ANALYTICS_EVENTS.AI_REORG_ACCEPTED, {
                hasSwapped,
                currentView: view,
                sectionKey: reorg.sectionKey,
              });
              acceptReorg();
            }}
            variant="primary"
            size="sm"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('ai.reorg_accept')}</span>
          </Button>
        </div>
      </div>

      <div className={cn(isStandard ? 'p-6' : 'p-4')}>
        {view === 'original' ? (
          /* Step 1: Original Structure (The "Before") */
          <div className="space-y-4">
            <div className="text-destructive flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-70">
              <History className="h-3 w-3" />
              <span>{t('ai.reorg_original')}</span>
            </div>

            <div className="space-y-3">
              {originalChanges.map((item) => {
                const isRemoved = classification[`original_${item._vId}`] === 'removed';

                return (
                  <div
                    key={item._vId as string}
                    className={cn(
                      'rounded-xl border p-4 transition-all',
                      'border-red-500/20 bg-red-500/5',
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          isRemoved ? 'text-destructive line-through' : 'text-foreground',
                        )}
                      >
                        {(item.name as string) || t('common.untitled')}
                      </span>
                      {isRemoved && <Trash2 className="text-destructive/50 h-3 w-3" />}
                    </div>
                    <p
                      className={cn(
                        'mt-1 text-xs leading-relaxed',
                        isRemoved ? 'text-muted-foreground' : 'text-foreground/60',
                      )}
                    >
                      {(item.keywords as string[])?.join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>

            {originalUnchanged.length > 0 && (
              <div className="pt-4">
                <div className="text-muted-foreground/30 mb-6 flex items-center gap-4 text-[9px] font-black tracking-widest uppercase">
                  <div className="h-px flex-1 bg-current" />
                  <span>{t('ai.reorg_unchanged')}</span>
                  <div className="h-px flex-1 bg-current" />
                </div>
                <div className="space-y-3">
                  {originalUnchanged.map((item) => (
                    <div
                      key={item._vId as string}
                      className="border-border/50 bg-background/50 rounded-xl border p-4 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">
                          {(item.name as string) || t('common.untitled')}
                        </span>
                      </div>
                      <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                        {(item.keywords as string[])?.join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Optimized Structure (The "After") */
          <div className="space-y-4">
            <div className="text-primary-strong flex items-center gap-2 text-xs font-semibold">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              <span>{t('ai.reorg_optimized')}</span>
            </div>

            <div className="space-y-6">
              {/* Modified Items */}
              {modified.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-3">
                    {modified.map(({ item, key }) => {
                      const sourceVIds = (item._sourceVIds as string[]) || [];
                      const sources = originalItems.filter((o) =>
                        sourceVIds.includes(o._vId as string),
                      );
                      const sourceNames = sources.map((s) => s.name).join(', ');

                      return (
                        <div
                          key={key}
                          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all"
                        >
                          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-foreground text-sm font-bold">
                              {(item.name as string) || t('common.untitled')}
                            </span>
                            {sourceNames && sourceNames !== item.name && (
                              <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] italic">
                                <span className="opacity-70">( {t('ai.reorg_was')}:</span>
                                <span className="max-w-[150px] truncate">{sourceNames}</span>
                                <span className="opacity-70">)</span>
                              </div>
                            )}
                          </div>
                          <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                            {(item.keywords as string[])?.join(' · ')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Added Items */}
              {added.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-3">
                    {added.map(({ item, key }) => (
                      <div
                        key={key}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-foreground text-sm font-bold">
                            {(item.name as string) || t('common.untitled')}
                          </span>
                        </div>
                        <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                          {(item.keywords as string[])?.join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unchanged Items */}
              {unchanged.length > 0 && (
                <div className="border-primary-strong/5 border-t pt-8">
                  <div className="text-muted-foreground/30 mb-6 flex items-center gap-4 text-[9px] font-black tracking-widest uppercase">
                    <div className="h-px flex-1 bg-current" />
                    <span>{t('ai.reorg_unchanged')}</span>
                    <div className="h-px flex-1 bg-current" />
                  </div>
                  <div className="space-y-3">
                    {unchanged.map(({ item, key }) => (
                      <div
                        key={key}
                        className="border-border/50 bg-background/50 rounded-xl border p-4 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">
                            {(item.name as string) || t('common.untitled')}
                          </span>
                        </div>
                        <p className="text-foreground/80 mt-1 text-xs leading-relaxed">
                          {(item.keywords as string[])?.join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
