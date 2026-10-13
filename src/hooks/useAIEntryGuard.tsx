import { type ReactNode, useCallback, useState } from 'react';

import { InsufficientPremiumAccessModal } from '@/components/modals/InsufficientPremiumAccessModal';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { type AuthTriggerSource, useFlowStore } from '@/store/ui/useFlowStore';
import { hasAIAccess } from '@/utils/ai';

/**
 * Which surface raised the wall. Narrowed from `AuthTriggerSource`'s fourteen
 * members: `useAIEntryGuard('sync')` typechecked and would have routed an AI
 * press into the Drive funnel.
 */
type AIEntrySource = Extract<AuthTriggerSource, 'ai_suggest' | 'translation_invite'>;

/**
 * The two checks every AI entry point owes before starting a run: signed in,
 * then holding a pass. Extracted from `AISuggestButton` when the cover-letter
 * empty state became a second entry point to the same run.
 *
 * ⚠️ Returns `modals`, not just the flag behind them. A consumer that got a
 * boolean and had to remember its own JSX would, on forgetting, leave a
 * signed-in user without a pass pressing a button that does nothing at all —
 * `allowRun()` returns false against state nobody renders. Same shape as
 * `useTranslationInvite`.
 *
 * ⚠️ A pass holder who has spent the daily allowance passes here on purpose:
 * only the backend can tell "no pass" from "allowance spent" (`utils/ai.ts`).
 *
 * ⚠️ `source` is the hook's argument, not `allowRun`'s: it names the surface,
 * and it is load-bearing rather than cosmetic. `allowRun` takes no `description`
 * — there is one wall for every AI entry point.
 * `code/UI_PATTERNS.md` § One AI Control Per Section argues both.
 */
export function useAIEntryGuard(source: AIEntrySource = 'ai_suggest') {
  const { t } = useTranslation();
  const { isPremium, session } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  /** True when the caller may proceed; otherwise it has already routed the user. */
  const allowRun = useCallback(() => {
    if (!session) {
      useFlowStore.getState().openGoogleLogin({
        description: t('auth.ai_login_required'),
        source,
        allowGitHub: false,
      });
      return false;
    }
    if (!hasAIAccess(isPremium)) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  }, [session, isPremium, t, source]);

  /**
   * ⚠️ Mounted only once needed: it renders `PricingDialog`, which calls
   * `useNavigate()`, so an unconditional mount makes a Router a hard
   * requirement of every surface carrying an AI control.
   */
  const modals: ReactNode = showUpgradeModal ? (
    <InsufficientPremiumAccessModal isOpen onClose={() => setShowUpgradeModal(false)} />
  ) : null;

  return { allowRun, modals, hasPass: hasAIAccess(isPremium) };
}
