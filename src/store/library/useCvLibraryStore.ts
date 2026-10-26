import type { GoogleDriveRoot } from '@/constants/cloud';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface BackupFile {
  id?: string; // Provider-specific ID (e.g. Drive fileId)
  name: string; // Original filename (e.g., 'resume.json' or 'ProjectA.json')
  label: string; // User-friendly label (e.g., 'Manual Backup' or 'ProjectA')
  updatedAt?: string;
  size?: number;
  company?: string;
  position?: string;
  theme?: string;
  driveRoot?: GoogleDriveRoot;
  /** Job posting link saved at export (#54). GitHub rows fill it lazily. */
  postingUrl?: string;
  /** GitHub blob sha: the key of the per-device posting-link cache. */
  sha?: string;
}

export function getBackupFileKey(file: Pick<BackupFile, 'id' | 'name' | 'driveRoot'>) {
  return file.id || `${file.driveRoot || 'path'}:${file.name}`;
}

export type BackupSource = 'github' | 'google_drive';
export type BackupDiscoveryMap = Record<string, Partial<Record<BackupSource, BackupFile[]>>>;

export type CvLibraryStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unconfigured';

interface CvLibraryState {
  status: CvLibraryStatus;
  discoveryData: BackupDiscoveryMap | null;
  /**
   * locale -> `backups/<locale>` or `backup/<locale>`.
   *
   * It lives here rather than in a `useRef` inside `useCloudDiscovery` because
   * `useCloudOperations` needs the mapping to build a GitHub path, and the page
   * must keep it across a remount. The ref version only worked because both
   * hooks happened to be constructed in the same render.
   */
  githubPaths: Record<string, string>;
  /** Providers that were attempted and threw. Empty on a clean load. */
  failedSources: BackupSource[];
  loadedAt: number | null;
  error: string | null;

  /**
   * Bumped by every `reset()`, so a discovery that began before a sign-out or an
   * account switch cannot write the previous user's rows back (#63).
   */
  epoch: number;

  /** Returns the epoch to hand back to `setReady` / `setError`. */
  setLoading: () => number;
  /** Ignored when `epoch` is given and a `reset()` has happened since. */
  setReady: (
    data: BackupDiscoveryMap,
    githubPaths: Record<string, string>,
    failedSources?: BackupSource[],
    epoch?: number,
  ) => void;
  setError: (message: string, epoch?: number) => void;
  setUnconfigured: () => void;
  removeFile: (locale: string, source: BackupSource, file: BackupFile) => void;
  /** A lazily read posting link, for the row still listing that blob (#54). */
  setPostingUrl: (locale: string, source: BackupSource, sha: string, postingUrl: string) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as CvLibraryStatus,
  discoveryData: null,
  githubPaths: {},
  failedSources: [],
  loadedAt: null,
  error: null,
};

export const useCvLibraryStore = create<CvLibraryState>()(
  immer((set, get) => ({
    ...initialState,
    epoch: 0,

    setLoading: () => {
      set((state) => {
        state.status = 'loading';
        state.error = null;
      });
      return get().epoch;
    },

    setReady: (data, githubPaths, failedSources = [], epoch) => {
      set((state) => {
        if (epoch !== undefined && epoch !== state.epoch) return;
        state.status = 'ready';
        state.discoveryData = data;
        state.githubPaths = githubPaths;
        state.failedSources = failedSources;
        state.loadedAt = Date.now();
        state.error = null;
      });
    },

    setError: (message, epoch) => {
      set((state) => {
        if (epoch !== undefined && epoch !== state.epoch) return;
        state.status = 'error';
        state.error = message;
      });
    },

    setUnconfigured: () => {
      set((state) => {
        state.status = 'unconfigured';
        state.discoveryData = null;
        state.failedSources = [];
        state.loadedAt = null;
        state.error = null;
      });
    },

    removeFile: (locale, source, file) => {
      set((state) => {
        if (!state.discoveryData || !state.discoveryData[locale]) return;
        const sourceMap = state.discoveryData[locale];
        if (!sourceMap[source]) return;

        // Drive files are matched by ID, so a legacy CVCanvas-root `resume.json`
        // and the canonical KiwiCV one cannot delete each other.
        const deletedKey = getBackupFileKey(file);
        sourceMap[source] = sourceMap[source]!.filter((candidate) => {
          return getBackupFileKey(candidate) !== deletedKey;
        });
      });
    },

    setPostingUrl: (locale, source, sha, postingUrl) => {
      set((state) => {
        const file = state.discoveryData?.[locale]?.[source]?.find(
          (candidate) => candidate.sha === sha,
        );
        if (file) file.postingUrl = postingUrl;
      });
    },

    reset: () => {
      set((state) => {
        Object.assign(state, initialState);
        state.epoch += 1;
      });
    },
  })),
);
