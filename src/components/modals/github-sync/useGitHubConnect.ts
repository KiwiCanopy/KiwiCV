import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { GitHubConnectStatus } from '@/components/modals/github-sync/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { GitHubService } from '@/services/github';
import {
  loadGitHubCreds,
  resetGitHubSyncHashes,
  saveGitHubCreds,
} from '@/services/storage/githubStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { localizedPath } from '@/utils/localeRouting';

interface UseGitHubConnectOptions {
  setIsLoading: (val: boolean) => void;
  onConnected?: () => void;
  onClose: () => void;
}

/**
 * Owns the GitHub connection form state and the connect handshake.
 *
 * Extracted from GitHubSyncModal without behavior changes: the storage keys,
 * hash resets, success delay, analytics event, continuation order, and the
 * `github-sync-success` window event are all preserved verbatim.
 */
export function useGitHubConnect({ setIsLoading, onConnected, onClose }: UseGitHubConnectOptions) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lang = useLanguage();
  const updateSync = useResumeStore((state) => state.updateSync);

  const [pat, setPat] = useState(() => loadGitHubCreds().pat);
  const [repoUrl, setRepoUrl] = useState(() => loadGitHubCreds().repoUrl);
  const [rememberPat, setRememberPat] = useState(() => loadGitHubCreds().rememberPat);

  const [status, setStatus] = useState<GitHubConnectStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPat, setShowPat] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const gh = new GitHubService(pat);
      const user = await gh.getUser();

      let owner = user.login;
      let repoName = repoUrl;

      if (repoUrl.includes('/')) {
        const parts = repoUrl.split('/');
        if (parts.length === 2) {
          owner = parts[0];
          repoName = parts[1];
        } else if (repoUrl.includes('github.com')) {
          const urlParts = new URL(repoUrl).pathname.split('/').filter(Boolean);
          if (urlParts.length >= 2) {
            owner = urlParts[0];
            repoName = urlParts[1];
          }
        }
      }

      const repoData = await gh.getRepo(owner, repoName);
      if (!repoData) {
        throw new Error(t('settings.github.error_repo_not_found'));
      }

      // Store the parsed owner/repo, not the raw input the user typed
      saveGitHubCreds(pat, `${owner}/${repoName}`, rememberPat);

      // Reset sync hashes to force fresh sync after config change
      resetGitHubSyncHashes();

      setStatus('success');
      setIsLoading(false);
      setShowPat(false);

      // Update global sync store for reactivity
      updateSync({
        github: {
          enabled: true,
          repo: `${owner}/${repoName}`,
        },
      });

      // 1. Show 'Success' state first
      setStatus('success');
      setIsLoading(false);

      // 2. Wait a brief moment so the user sees the success
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 3. Then transition to 'Checking for backups'
      setIsLoading(true);

      // Dispatch success and close
      analytics.track(ANALYTICS_EVENTS.SYNC_PROVIDER_CONNECTED, { provider: 'github' });
      setIsLoading(false);
      onConnected?.();
      onClose();
      window.dispatchEvent(new Event('github-sync-success'));

      // Show what was just connected. This used to be a fire-and-forget
      // discovery racing the modal teardown; the page owns its own loading
      // state, so the navigation can wait for the close.
      navigate(localizedPath(lang, `/cvs?source=github`));
    } catch (error: unknown) {
      setStatus('error');
      const err = error as { message?: string; status?: number };
      let msg = err.message || t('common.error');

      if (err.status === 401) {
        msg = t('settings.github.error_invalid_token');
      } else if (err.status === 403) {
        msg = t('settings.github.error_forbidden');
      } else if (err.status === 404) {
        msg = t('settings.github.error_repo_not_found');
      }

      setErrorMessage(msg);
    } finally {
      if (status !== 'success') {
        setIsLoading(false);
      }
    }
  };

  return {
    pat,
    setPat,
    repoUrl,
    setRepoUrl,
    rememberPat,
    setRememberPat,
    status,
    errorMessage,
    showPat,
    setShowPat,
    handleConnect,
  };
}
