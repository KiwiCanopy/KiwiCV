import { GitHubSyncModal } from '@/components/modals/GitHubSyncModal';
import { GoogleAuthModal } from '@/components/modals/GoogleAuthModal';
import { ImportModal } from '@/components/modals/ImportModal';
import { VersionUpdateModal } from '@/components/modals/VersionUpdateModal';
import { PricingDialog } from '@/components/monetization/PricingDialog';
import { PurchaseSuccessHandler } from '@/components/monetization/PurchaseSuccessHandler';
import { useAuth } from '@/hooks/useAuth';
import { useLegalConsentPending } from '@/hooks/useLegalConsentPending';
import { useTranslation } from '@/hooks/useTranslation';
import { type AuthTriggerSource, useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';

interface MainLayoutOverlaysProps {
  closeUpdateModal: () => void;
  currentVersion: string;
  isUpdateModalOpen: boolean;
  missedVersions: string[];
}

// ⚠️ Typed, so a renamed or misspelled member is a build error rather than a
// source that silently stops matching. This Set is what makes `source`
// load-bearing rather than cosmetic.
const googleModalSources = new Set<AuthTriggerSource>([
  'sync',
  'manage',
  'landing_try_ai',
  'import_after_tour',
  'import_editor',
  'import_raw_json',
]);

export function MainLayoutOverlays(props: MainLayoutOverlaysProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const authSurface = useFlowStore((state) => state.auth.authSurface);
  const authDescription = useFlowStore((state) => state.auth.description);
  const allowGitHubInAuth = useFlowStore((state) => state.auth.allowGitHub);
  const closeGoogleLogin = useFlowStore((state) => state.closeGoogleLogin);
  const openGitHubLogin = useFlowStore((state) => state.openGitHubLogin);
  const closeGitHubLogin = useFlowStore((state) => state.closeGitHubLogin);
  const openGoogleLogin = useFlowStore((state) => state.openGoogleLogin);
  const resetAuth = useFlowStore((state) => state.resetAuth);
  const isPricingModalOpen = useUIStore((state) => state.isPricingModalOpen);
  const setIsPricingModalOpen = useUIStore((state) => state.setIsPricingModalOpen);
  const authSource = useFlowStore.getState().auth.source;
  /**
   * Only for re-threading across the Google ⇄ GitHub hand-off below. Each modal
   * reads the anchor from the store itself.
   *
   * ⚠️ Read from this render's closure, deliberately, not `getState()`. Both
   * hand-offs run `onClose()` — which is `resetAuth()` — before their callback,
   * so a fresh read would find the field already cleared. The closure still
   * holds what the opening caller named.
   */
  const restoreFocusToId = useFlowStore((state) => state.auth.restoreFocusToId);
  const legalConsentPending = useLegalConsentPending();

  return (
    <>
      <VersionUpdateModal
        // Waits for the blocking consent modal: opened after it, this dialog
        // would take Radix's scroll lock and freeze the consent text.
        isOpen={props.isUpdateModalOpen && !legalConsentPending}
        onClose={props.closeUpdateModal}
        version={props.currentVersion}
        missedVersions={props.missedVersions}
      />
      <ImportModal />
      <GoogleAuthModal
        isOpen={
          authSurface === 'google' &&
          !authLoading &&
          (!user || (authSource ? googleModalSources.has(authSource) : false))
        }
        onClose={() => {
          closeGoogleLogin();
          resetAuth();
        }}
        description={authDescription || t('auth.welcome_subtitle')}
        allowGHAlternative={allowGitHubInAuth}
        onSelectGH={() =>
          // ⚠️ Carried across the hand-off in BOTH directions. Each of these
          // closes the other, so whichever the user finally dismisses is the one
          // that has to know where the outer flow started.
          openGitHubLogin({ allowBack: true, restoreFocusToId: restoreFocusToId ?? undefined })
        }
      />
      <GitHubSyncModal
        isOpen={authSurface === 'github'}
        onClose={() => {
          closeGitHubLogin();
          resetAuth();
        }}
        onBack={
          allowGitHubInAuth
            ? () =>
                openGoogleLogin({
                  description: authDescription || undefined,
                  allowGitHub: true,
                  restoreFocusToId: restoreFocusToId ?? undefined,
                })
            : undefined
        }
      />
      <PurchaseSuccessHandler />
      <PricingDialog isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
    </>
  );
}
