import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { type DiffAction } from '@/features/dashboard/editor/proposals/diffContract';
import { editorRailOrder } from '@/features/dashboard/editor/rail/railSections';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { getAISuggestionCount } from '@/utils/ai';

interface PendingDecision {
  action: DiffAction;
  /** The decided field's visible label, or `null` for the header's bulk pair. */
  field: string | null;
}

/**
 * What a screen reader hears after a proposal is decided: the outcome, then
 * what is left CV-wide, counted the way the pending bar counts it.
 *
 * Announces only after the rows actually change, and only for a press in this
 * panel — a run landing clears the message instead, so an identical decision
 * later is announced again rather than matching stale text.
 */
export function useProposalDecisionAnnouncement(rowCount: number) {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState('');
  const pending = useRef<PendingDecision | null>(null);
  const previousCount = useRef(rowCount);

  useLayoutEffect(() => {
    if (rowCount === previousCount.current) return;
    previousCount.current = rowCount;

    const decision = pending.current;
    pending.current = null;
    if (!decision) {
      setAnnouncement('');
      return;
    }

    const { action, field } = decision;
    let outcome: string;
    if (field === null) {
      outcome =
        action === 'accept' ? t('ai.diff_announce_used_all') : t('ai.diff_announce_kept_all');
    } else {
      outcome =
        action === 'accept'
          ? t('ai.diff_announce_used', { field })
          : t('ai.diff_announce_kept', { field });
    }

    const { ai, resume } = useResumeStore.getState();
    const left = getAISuggestionCount(
      ai.suggestions,
      editorRailOrder(resume),
      ai.reorgSuggestion,
      resume,
    );
    const remaining =
      left > 0 ? t('ai.pending_headline', { count: left }) : t('ai.diff_announce_none_left');

    setAnnouncement(`${outcome} ${remaining}`);
  }, [rowCount, t]);

  /** Call from a decision control, before it clears rows. */
  const armAnnouncement = useCallback((action: DiffAction, field: string | null) => {
    pending.current = { action, field };
  }, []);

  return { announcement, armAnnouncement };
}
