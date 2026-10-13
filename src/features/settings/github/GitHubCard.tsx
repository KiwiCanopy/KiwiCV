import { FaGitAlt } from 'react-icons/fa';
import { SiGithub } from 'react-icons/si';

import { ServiceCard } from '@/features/settings/shared/ServiceCard';
import { disconnectGitHub } from '@/hooks/sync/disconnectGitHub';
import { useProviderStates } from '@/hooks/sync/useProviderStates';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { hasStoredGitHubCreds } from '@/services/storage/githubStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useToastStore } from '@/store/ui/useToastStore';
import type { FocusAnchor } from '@/utils/focus';

export const GitHubCard = () => {
  const { t } = useTranslation();
  const { sync, updateSync } = useResumeStore();
  const confirm = useConfirmStore((state) => state.confirm);
  const addToast = useToastStore((state) => state.addToast);

  const config = sync?.github || { enabled: false };
  const isEnabled = !!config.enabled;
  const { github: githubState } = useProviderStates();

  const onToggle = async (enabled: boolean) => {
    if (enabled && githubState === 'not_connected') {
      useFlowStore.getState().openGitHubLogin('settings');
      return;
    }

    if (!enabled) {
      // Show confirmation modal BEFORE any state update
      const result = await confirm({
        title: t('sync.confirm_delete_github_title'),
        message: t('sync.confirm_delete_github_message'),
        confirmText: t('sync.confirm_delete_github_yes'),
        cancelText: t('sync.confirm_delete_github_no'),
        variant: 'destructive',
      });

      // If dismissed (X or Escape), don't do anything (keep it active)
      if (result === null) return;

      // YES deactivates and removes the connection; NO only deactivates.
      if (result) {
        disconnectGitHub();
        addToast(t('settings.github.disconnect_success'), 'success');
      } else {
        updateSync({ github: { ...config, enabled: false } });
      }
      return;
    }

    analytics.track(ANALYTICS_EVENTS.SYNC_PROVIDER_TOGGLED, {
      provider: 'github',
      enabled,
    });
    updateSync({
      github: {
        ...config,
        enabled,
      },
    });
  };

  // Reachable from every state that holds a token, `connected_disabled` included,
  // and never through the switch: turning sync on first could push.
  const onDisconnect = async (restoreFocusTo: FocusAnchor) => {
    const result = await confirm({
      title: t('sync.confirm_disconnect_github_title'),
      message: t('sync.confirm_disconnect_github_message'),
      confirmText: t('sync.confirm_disconnect_github_yes'),
      variant: 'destructive',
      // The Disconnect button is gone once this succeeds.
      restoreFocusTo,
    });
    if (result !== true) return;

    disconnectGitHub();
    addToast(t('settings.github.disconnect_success'), 'success');
  };

  const isConfigured = githubState === 'active' || githubState === 'connected_disabled';

  return (
    <>
      <ServiceCard
        title={t('sync.github_title')}
        description={t('sync.github_desc')}
        icon={<SiGithub size="100%" />}
        isEnabled={isEnabled}
        isConfigured={isConfigured}
        onToggle={onToggle}
        isLoading={false}
        statusBadge={isEnabled ? t('sync.active') : undefined}
        metadata={
          isConfigured && config.repo
            ? {
                label: t('sync.repository'),
                value: config.repo,
                icon: <FaGitAlt size={14} className="text-primary-strong" />,
              }
            : undefined
        }
        onEdit={() => useFlowStore.getState().openGitHubLogin('settings')}
        activeIconClassName="text-black dark:text-white"
        editLabel={t('sync.edit_connection')}
        disconnect={
          hasStoredGitHubCreds()
            ? { onClick: onDisconnect, label: t('sync.disconnect_github') }
            : undefined
        }
      />
    </>
  );
};
