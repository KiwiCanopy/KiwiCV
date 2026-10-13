import { clearGitHubCreds } from '@/services/storage/githubStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';

/**
 * Removes the GitHub connection from this device: the token, the repository
 * setting in storage and in the sync config, and the sync hashes. Sync goes off.
 */
export function disconnectGitHub() {
  clearGitHubCreds();
  // The store's repo would otherwise be written back to storage on the next load.
  useResumeStore
    .getState()
    .updateSync({ github: { enabled: false, repo: undefined, branch: undefined } });
}
