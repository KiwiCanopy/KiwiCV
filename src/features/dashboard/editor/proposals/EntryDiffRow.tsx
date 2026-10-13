import { type MouseEvent } from 'react';

import { DiffDecisionRow } from '@/features/dashboard/editor/proposals/DiffDecisionRow';
import { ProseDiffRow } from '@/features/dashboard/editor/proposals/ProseDiffRow';
import { type DiffMark, type EntryDiffRowModel } from '@/features/dashboard/editor/proposals/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

interface EntryDiffRowProps {
  row: EntryDiffRowModel;
  /** Takes the event: the panel gates its handoff on `isKeyboardActivation`. */
  onAccept: (event: MouseEvent<HTMLButtonElement>) => void;
  onDecline: (event: MouseEvent<HTMLButtonElement>) => void;
}

const MARK_GLYPH: Record<DiffMark['mark'], string> = {
  added: '+',
  removed: '−',
  unchanged: '·',
};

const MARK_LABEL_KEY: Record<DiffMark['mark'], string> = {
  added: 'ai.diff_mark_added',
  removed: 'ai.diff_mark_removed',
  unchanged: 'ai.diff_mark_unchanged',
};

// ⚠️ Hue alone does not separate these; the tint and the left rule give each
// state a shape. Unchanged keeps a transparent rule so all three rows align.
const MARK_ROW_CLASS: Record<DiffMark['mark'], string> = {
  added: 'bg-success/10 border-l-success',
  removed: 'bg-destructive/10 border-l-destructive',
  unchanged: 'border-l-transparent',
};

// Split from the row class: `line-through` there would strike the glyph too.
const MARK_TEXT_CLASS: Record<DiffMark['mark'], string> = {
  added: 'text-success',
  removed: 'text-destructive line-through',
  unchanged: 'text-muted-foreground',
};

/**
 * ⚠️ Sized against the PANEL's width — not the viewport's, and not the pane's.
 *
 * This was `sm:grid-cols-2`: a viewport breakpoint inside a pane-relative
 * layout, which `UI_PATTERNS.md`'s Pane-Relative Breakpoint System rules
 * against. At a 1440 viewport it split however narrow the pane was, giving
 * 214px text columns ≈ 28 characters per line against a ~45 floor for prose —
 * worst where there was most room, and correct only on a phone.
 *
 * The pane's own `isSocial` (>650px) was no better, and was measured before it
 * shipped: a 704px pane still holds this panel at 517px and split it exactly
 * the same way. Only the panel knows how much room a column gets, because it is
 * inset differently at its two mount sites. 48rem is where two columns first
 * clear ~45 characters; `EntryDiffPanel` supplies the `@container`.
 */
const COMPARISON_GRID = 'grid gap-2 @min-[48rem]:grid-cols-2';

export function EntryDiffRow({ row, onAccept, onDecline }: EntryDiffRowProps) {
  const { t } = useTranslation();

  if (row.prose) {
    return (
      <ProseDiffRow prose={row.prose} label={row.label} onAccept={onAccept} onDecline={onDecline} />
    );
  }

  return (
    <DiffDecisionRow onAccept={onAccept} onDecline={onDecline}>
      <p className="text-muted-foreground mb-2 text-[0.7rem] font-semibold tracking-wide uppercase">
        {row.label}
      </p>

      {row.marks ? (
        <ul className="space-y-1">
          {row.marks.map((mark, index) => (
            <li
              key={`${mark.mark}-${index}-${mark.value}`}
              className={cn(
                'flex items-start gap-2 rounded-r-md border-l-2 py-1 pr-2 pl-2 text-sm',
                MARK_ROW_CLASS[mark.mark],
              )}
            >
              {/* ⚠️ The glyph is decoration; +, − and · have no accessible name
                  of their own, and a screen reader would read the bullet as
                  bare punctuation or skip it entirely. */}
              <span
                className={cn('shrink-0 font-bold', MARK_TEXT_CLASS[mark.mark])}
                aria-hidden="true"
              >
                {MARK_GLYPH[mark.mark]}
              </span>
              <span className="sr-only">{t(MARK_LABEL_KEY[mark.mark])}</span>
              <span className="min-w-0 flex-1">
                <span className={MARK_TEXT_CLASS[mark.mark]}>{mark.value}</span>
                {/* Text, not a tint: it has to read as a caution in the narrow
                    panel and in the accessibility tree alike. */}
                {mark.unsourced && (
                  <span className="text-warning block text-xs font-medium">
                    {t('ai.diff_mark_unsourced')}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={COMPARISON_GRID}>
          <div className="bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-muted-foreground mb-1 text-[0.7rem] font-medium tracking-wide uppercase">
              {t('ai.diff_mine')}
            </p>
            <p className="text-muted-foreground text-sm leading-6">
              {row.mine.trim() === '' ? (
                <span className="italic opacity-70">{t('ai.diff_empty')}</span>
              ) : (
                row.mine
              )}
            </p>
          </div>
          <div className="bg-primary/10 border-l-primary-strong rounded-lg border-l-4 px-3 py-2">
            <p className="text-primary-strong mb-1 text-[0.7rem] font-semibold tracking-wide uppercase">
              {t('ai.diff_proposal')}
            </p>
            <p className="text-foreground text-sm leading-6">{row.proposal}</p>
          </div>
        </div>
      )}
    </DiffDecisionRow>
  );
}
