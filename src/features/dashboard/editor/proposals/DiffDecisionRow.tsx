import { type MouseEvent, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { diffActionProps, diffRowProps } from '@/features/dashboard/editor/proposals/diffContract';
import { useTranslation } from '@/hooks/useTranslation';

interface DiffDecisionRowProps {
  /** The row's body: everything between the top rule and the decision pair. */
  children: ReactNode;
  /** Takes the event: the panel gates its handoff on `isKeyboardActivation`. */
  onAccept: (event: MouseEvent<HTMLButtonElement>) => void;
  onDecline: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * The shell every proposal row shares — the `<li>`, its insets and the
 * keep-mine / use-proposal pair. Only the body differs between `EntryDiffRow`
 * and `ProseDiffRow`, so the contract below is written once.
 */
export function DiffDecisionRow({ children, onAccept, onDecline }: DiffDecisionRowProps) {
  const { t } = useTranslation();

  return (
    // `diffContract`: `useProposalFocusHandoff` finds the surviving row and
    // offers the same button it just took away.
    <li {...diffRowProps} className="border-border/60 border-t px-3 py-3 first:border-t-0 sm:px-4">
      {children}

      {/* Keep-mine LEFT, use-proposal RIGHT, mirroring the columns of a plain
          row; centred by owner request.

          ⚠️ `primary` and `secondary`, NOT `secondary` and `quiet`. Those two
          are separated by a fill at 1.19:1 on `--card` and nothing else, which
          in dark reads as one colour twice — so the pair looked symmetric when
          it is not. Green is "take the proposal" at every scope in this panel,
          including the header's accept-all. */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Button
          {...diffActionProps('decline')}
          variant="secondary"
          size="sm"
          className="border-input"
          onClick={onDecline}
        >
          {t('ai.diff_keep_mine')}
        </Button>
        <Button {...diffActionProps('accept')} variant="primary" size="sm" onClick={onAccept}>
          {t('ai.diff_replace_field')}
        </Button>
      </div>
    </li>
  );
}
