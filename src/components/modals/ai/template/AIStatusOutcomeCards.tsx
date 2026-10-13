import React from 'react';

import {
  type AIChangeDetails,
  type CoverLetterOutcome,
  coverLetterPresentation,
} from '@/components/modals/ai/template/statusTypes';
import { COVER_LETTER_ICON } from '@/data/sections';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { CircleCheck, RefreshCcw } from 'lucide-react';

interface AIStatusOutcomeCardsProps {
  changeDetails?: AIChangeDetails;
  coverLetterOutcome?: CoverLetterOutcome | null;
}

/**
 * What the run produced, under the success panel. ⚠️ Not announced — the
 * panel above carries everything a screen reader hears, which is why a letter
 * FAILURE is a sentence there and never a card here.
 */
export const AIStatusOutcomeCards: React.FC<AIStatusOutcomeCardsProps> = ({
  changeDetails,
  coverLetterOutcome,
}) => {
  const { t } = useTranslation();

  const showItems = (changeDetails?.itemsCount ?? 0) > 0;
  const showReorg = (changeDetails?.reorgCount ?? 0) > 0;
  const showLetterCard = coverLetterPresentation(coverLetterOutcome) === 'card';
  const twoColumns = showItems && showReorg;

  if (!showItems && !showReorg && !showLetterCard) return null;

  return (
    // Stacks on narrow viewports so long locales wrap rather than squeeze. Two columns
    // only for the items and reorganisation cards together; anything else is full width.
    <div className={cn('grid grid-cols-1 gap-3', twoColumns && 'sm:grid-cols-2')}>
      {showItems && (
        <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-success/10 text-success flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <CircleCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-foreground min-w-0 text-sm leading-6 font-semibold">
            {t('ai.status.items_improved', { count: changeDetails?.itemsCount ?? 0 })}
          </p>
        </div>
      )}
      {showReorg && (
        <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <RefreshCcw className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-sm leading-6 font-semibold">
              {t('ai.status.reorg_count', { count: changeDetails?.reorgTotal ?? 0 })}
            </p>
            {/* A pure reshuffle reports +0/-0, which is noise; the count
                line already says something was restructured. */}
            {((changeDetails?.reorgAdded ?? 0) > 0 || (changeDetails?.reorgRemoved ?? 0) > 0) && (
              <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                +{changeDetails?.reorgAdded ?? 0} / -{changeDetails?.reorgRemoved ?? 0}
              </p>
            )}
          </div>
        </div>
      )}
      {/*
        ⚠️ `sm:col-span-2` in the two-column grid, so the letter takes its own full-width row
        rather than making a third card that orphans the two-column grid.
        `COVER_LETTER_ICON` is the glyph the section rail draws, read
        from the one source both share, so the card and the row the user
        clicks next cannot diverge — deliberately NOT `Sparkles`, which is
        the AI trigger, where this is an outcome.
        The muted treatment `RefreshCcw` uses: a drafted letter is a
        result, not a second success to celebrate beside the CV's.
      */}
      {showLetterCard && (
        <div
          className={cn(
            'border-border bg-card flex items-center gap-3 rounded-xl border p-4',
            twoColumns && 'sm:col-span-2',
          )}
        >
          <span className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <COVER_LETTER_ICON className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-foreground min-w-0 text-sm leading-6 font-semibold">
            {t('ai.status.cover_letter_ready')}
          </p>
        </div>
      )}
    </div>
  );
};
