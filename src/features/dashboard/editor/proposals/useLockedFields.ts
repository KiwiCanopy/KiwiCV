import { useCallback } from 'react';

import type { FieldLock } from '@/components/ui/fieldLock';
import { pendingFields } from '@/features/dashboard/editor/proposals/pendingFields';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type AITargetKey } from '@/utils/aiTarget';

/**
 * Which fields of one entry a pending AI proposal locks: a `FieldLock` for each
 * field the diff panel above offers a choice for, `null` for a field the user
 * may edit (it can still be locked by a later run), and `undefined` for an entry
 * AI cannot touch. Call once per entry and pass the returned function down.
 */
export function useLockedFields<T extends object>(target: AITargetKey | undefined) {
  const { t } = useTranslation();
  const suggestion = useResumeStore((state) => (target ? state.ai.suggestions[target] : undefined));
  const reason = t('ai.diff_field_locked');

  return useCallback(
    (field: keyof T & string): FieldLock | null | undefined => {
      if (!target) return undefined;
      if (!suggestion || !pendingFields(suggestion).includes(field)) return null;
      return {
        reason,
        mine: suggestion.originalValue[field],
        keepTyped: (value) => useResumeStore.getState().keepTypedAsMine(target, field, value),
      };
    },
    [target, suggestion, reason],
  );
}
