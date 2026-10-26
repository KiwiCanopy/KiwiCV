export const GITHUB_PAT_KEY = 'github_pat';
export const GITHUB_REPO_KEY = 'github_repo';
export const GITHUB_LAST_SYNC_HASH_KEY = 'github_last_sync_hash';
export const GITHUB_LAST_FULL_PUSH_HASH_KEY = 'github_last_full_push_hash';
export const GITHUB_LAST_HOSTING_HASH_KEY = 'github_last_hosting_hash';

export interface StoredGitHubCreds {
  pat: string;
  repoUrl: string;
  rememberPat: boolean;
}

export const loadGitHubCreds = (): StoredGitHubCreds => {
  const localPat = localStorage.getItem(GITHUB_PAT_KEY) || '';
  const sessionPat = sessionStorage.getItem(GITHUB_PAT_KEY) || '';
  const storedRepo = localStorage.getItem(GITHUB_REPO_KEY) || '';

  return {
    pat: localPat || sessionPat,
    repoUrl: storedRepo,
    rememberPat: Boolean(localPat),
  };
};

/** True when a GitHub token is stored on this device, remembered or session-only. */
export const hasStoredGitHubCreds = (): boolean => Boolean(loadGitHubCreds().pat);

export const saveGitHubCreds = (pat: string, repoUrl: string, rememberPat: boolean) => {
  if (rememberPat) {
    localStorage.setItem(GITHUB_PAT_KEY, pat);
    sessionStorage.removeItem(GITHUB_PAT_KEY);
  } else {
    sessionStorage.setItem(GITHUB_PAT_KEY, pat);
    localStorage.removeItem(GITHUB_PAT_KEY);
  }

  localStorage.setItem(GITHUB_REPO_KEY, repoUrl);
};

export const resetGitHubSyncHashes = () => {
  localStorage.removeItem(GITHUB_LAST_SYNC_HASH_KEY);
  localStorage.removeItem(GITHUB_LAST_FULL_PUSH_HASH_KEY);
  localStorage.removeItem(GITHUB_LAST_HOSTING_HASH_KEY);
};

export type GitHubSyncHashKey =
  | typeof GITHUB_LAST_SYNC_HASH_KEY
  | typeof GITHUB_LAST_FULL_PUSH_HASH_KEY
  | typeof GITHUB_LAST_HOSTING_HASH_KEY;

/**
 * Snapshots the stored GitHub connection (token and repository). A hash says
 * what that repository holds, so `writeHash` writes only while the same
 * connection is still stored: a disconnect or a Connect mid-await drops it.
 */
export const githubConnection = () => {
  const { pat, repoUrl } = loadGitHubCreds();
  return {
    pat,
    writeHash: (key: GitHubSyncHashKey, value: string) => {
      const now = loadGitHubCreds();
      if (pat && now.pat === pat && now.repoUrl === repoUrl) localStorage.setItem(key, value);
    },
  };
};

/** Job posting links of this repo's backups, by blob sha (`utils/applicationMeta`, #54). */
export const GITHUB_POSTING_URL_CACHE_KEY = 'kiwicv_github_posting_urls';

export const clearGitHubCreds = () => {
  localStorage.removeItem(GITHUB_PAT_KEY);
  localStorage.removeItem(GITHUB_POSTING_URL_CACHE_KEY);
  sessionStorage.removeItem(GITHUB_PAT_KEY);
  localStorage.removeItem(GITHUB_REPO_KEY);
  resetGitHubSyncHashes();
};
