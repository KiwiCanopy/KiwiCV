import { type AccessChipState } from '@/features/dashboard/editor/composer/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { TriangleAlert } from 'lucide-react';

interface AIAccessChipProps {
  /** `null` — a Premium Pass inside its daily allowance — renders nothing. */
  state: AccessChipState | null;
  /**
   * Needed only when the chip sits inside a control that carries its own
   * `aria-label`. See the `compact` note below.
   */
  id?: string;
  /** Phones drop the sentence and keep the triangle; the text stays reachable. */
  compact?: boolean;
  className?: string;
}

/**
 * Why the run button will bounce, in the two cases where it will.
 *
 * ⚠️ A Premium Pass holder inside their daily allowance sees **no chip at all**.
 * There is nothing to warn them about, and decorating a working button is how a
 * pass starts feeling metered. `accessChip.test.tsx` pins that case.
 *
 * ⚠️ This replaced a cost chip that priced each run in credits. Both surviving
 * states are warnings, so there is no second visual treatment any more — the
 * chip used `--credits` for the one non-warning state, and that state is gone
 * along with the credits system it described.
 */
export function AIAccessChip({ state, id, compact, className }: AIAccessChipProps) {
  const { t } = useTranslation();

  if (!state) return null;

  const label =
    state === 'blocked' ? t('ai.insufficient_premium_access_title') : t('ai.limit_reached_title');

  /**
   * ⚠️ Compact drops to the triangle alone rather than shortening the wording.
   * Either sentence is a whole phrase at any size — the pricing chip that stood
   * here measured 224px of a 1324px row and was the single biggest item, which
   * tipped the resting row into wrapping below 1440. The label is never *lost*:
   * it stays as `sr-only` text and as the `title`.
   *
   * ⚠️ **`sr-only` text is only perceivable while the chip is not inside a
   * control that names itself.** The phone hand-off button carries its own
   * `aria-label`, and an explicit name stops the accname algorithm descending
   * into children — so nested there, this span is announced by nothing. That
   * call site passes an `id` and references it with `aria-describedby`; the two
   * desktop call sites are bare spans in normal flow and need neither.
   */
  return (
    <span
      id={id}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        'border-warning/30 bg-warning/10 text-warning',
        className,
      )}
      title={label}
    >
      <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {compact ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}
