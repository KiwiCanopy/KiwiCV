import { CiExport } from 'react-icons/ci';
import { FaRegFolderOpen } from 'react-icons/fa6';
import { FiSave } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

import { CloudSyncGatewayModal } from '@/components/modals/CloudSyncGatewayModal';
import { ExportModal } from '@/components/modals/export/ExportModal';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { useLanguage } from '@/hooks/useLanguage';
import { useSyncWorkflow } from '@/hooks/useSyncWorkflow';
import { useTranslation } from '@/hooks/useTranslation';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { anchorById } from '@/utils/focus';
import { localizedPath } from '@/utils/localeRouting';

export function SyncWorkflowModals() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lang = useLanguage();
  const location = useLocation();
  const activeSyncModal = useUIStore((state) => state.activeSyncModal);
  const syncGatewayTarget = useUIStore((state) => state.syncGatewayTarget);
  const setSyncModal = useUIStore((state) => state.setSyncModal);

  // Use 'sync' mode by default for the modals themselves,
  // but performSync will be called with proper context
  const { performSync } = useSyncWorkflow({
    mode: 'sync',
    variant: 'root',
  });

  const onClose = () => setSyncModal('none');

  /**
   * ⚠️ Both of these dialogs can be opened by the OTHER one closing: the export
   * chain swaps `activeSyncModal` between `'name'` and `'gateway'` in a single
   * commit, so whichever mounts finds its opener already unmounted and captures
   * nothing. The anchor is the control that started the chain.
   *
   * ⚠️ The gateway's is CONDITIONAL and the export dialog's is not, and the
   * asymmetry is the point. The gateway serves three targets, and one raised
   * from `/cvs` or the header keeps a live opener — handing it this anchor would
   * send focus to a control that user never pressed, the "nearest survivor"
   * fallback that is ruled out. The `'name'` dialog has only ever one caller shape:
   * every route to it is an export. Making it conditional would make it depend
   * on `syncGatewayTarget` staying `'export'` across the whole flow, which it
   * does not — the post-sign-in reopen re-stamps it (see `useSyncWorkflow`).
   */
  const gatewayAnchor =
    syncGatewayTarget === 'export' ? anchorById(EXPORT_TRIGGER_ANCHOR_ID) : undefined;
  const exportDialogAnchor = anchorById(EXPORT_TRIGGER_ANCHOR_ID);

  /**
   * ⚠️ The manage gateway opens FROM `/cvs` — that is the only place its
   * button lives — so its CTA navigated to the route the user was already on:
   * the dialog closed and the identical not-connected panel was still there,
   * under a button labelled with the name of that page. Here the CTA has
   * nothing to go to, so it says `continue` and only closes.
   */
  const manageTarget = localizedPath(lang, '/cvs');
  const isOnManageTarget = syncGatewayTarget === 'manage' && location.pathname === manageTarget;

  return (
    <>
      <CloudSyncGatewayModal
        isOpen={activeSyncModal === 'gateway'}
        onClose={onClose}
        restoreFocusTo={gatewayAnchor}
        label={
          isOnManageTarget
            ? t('common.continue')
            : syncGatewayTarget === 'manage'
              ? t('sync.cv_management_label')
              : syncGatewayTarget === 'export'
                ? t('common.export')
                : t('sync.backup_action')
        }
        icon={
          syncGatewayTarget === 'manage' ? (
            <FaRegFolderOpen className="h-6 w-6" />
          ) : syncGatewayTarget === 'export' ? (
            <CiExport className="h-6 w-6" />
          ) : (
            <FiSave className="h-6 w-6" />
          )
        }
        onStartSync={() => {
          if (syncGatewayTarget === 'export') {
            setSyncModal('name');
          } else {
            onClose();
            if (syncGatewayTarget === 'manage') {
              if (!isOnManageTarget) navigate(manageTarget);
            } else if (syncGatewayTarget === 'save') {
              performSync();
            }
          }
        }}
        onConnectGitHub={() =>
          useFlowStore.getState().openGitHubLogin({
            source: syncGatewayTarget === 'manage' ? 'manage' : 'sync',
            syncMode: syncGatewayTarget === 'manage' ? 'manage' : 'sync',
          })
        }
        onConnectGoogle={() =>
          useFlowStore.getState().openGoogleLogin({
            description: t('auth.sync_login_required'),
            source: syncGatewayTarget === 'manage' ? 'manage' : 'sync',
            allowGitHub: false,
            syncMode: syncGatewayTarget === 'manage' ? 'manage' : 'sync',
            requireDrive: true,
          })
        }
      />

      {/* The export dialog runs every selected destination itself and reports
          inside its own surface, so it neither confirms out to `performSync`
          nor closes on success. */}
      <ExportModal
        isOpen={activeSyncModal === 'name'}
        onClose={onClose}
        restoreFocusTo={exportDialogAnchor}
        onSetupRequired={() => {
          setSyncModal('gateway', 'export');
        }}
      />
    </>
  );
}
