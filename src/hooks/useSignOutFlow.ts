import { disconnectGitHub } from '@/hooks/sync/disconnectGitHub';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { hasStoredGitHubCreds } from '@/services/storage/githubStorage';
import { useConfirmStore } from '@/store/ui/useConfirmStore';

/**
 * The user-initiated sign-out. A GitHub token is device-bound and survives
 * sign-out by default, so when one is stored the user is offered its removal
 * first (owner, 2026-10-13; `ops/SYNC_FLOWS.md` §9).
 *
 * Resolves `false` when the user dismissed the prompt and nothing happened.
 */
export function useSignOutFlow() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const confirm = useConfirmStore((state) => state.confirm);

  return async (): Promise<boolean> => {
    if (hasStoredGitHubCreds()) {
      const result = await confirm({
        title: t('auth.sign_out_github_title'),
        message: t('auth.sign_out_github_message'),
        confirmText: t('auth.sign_out_github_remove'),
        cancelText: t('auth.sign_out_github_keep'),
        variant: 'destructive',
        preferredFocus: 'cancel',
      });
      if (result === null) return false;
      if (result) disconnectGitHub();
    }

    await signOut();
    return true;
  };
}
