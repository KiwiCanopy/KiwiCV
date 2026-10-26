import { useCallback, useEffect, useMemo, useRef } from 'react';

import { flattenDiscovery, selectMasterForLocale } from '@/features/cv-library/flattenDiscovery';
import { hydrateGitHubPostingUrls } from '@/features/cv-library/hydratePostingUrls';
import type { CvVersion } from '@/features/cv-library/types';
import { useCloudDiscovery } from '@/hooks/cloud/useCloudDiscovery';
import { useCloudOperations } from '@/hooks/cloud/useCloudOperations';
import { useCloudRestoreAction } from '@/hooks/cloud/useCloudRestoreAction';
import { useSyncAuthGateway } from '@/hooks/sync/useSyncAuthGateway';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useCvLibraryStore } from '@/store/library/useCvLibraryStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { cvLibraryDeleteAnchor } from '@/utils/focus';
import { saveAs } from 'file-saver';

/**
 * A cold load costs one provider round trip per GitHub file (`getLastCommit`),
 * so a back/forward navigation re-renders the cache instead of paying it again.
 * Refresh is an explicit button.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

export function useCvLibrary() {
  const { t, cvLanguage } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const { isCloudActive } = useSyncAuthGateway();

  const status = useCvLibraryStore((state) => state.status);
  const epoch = useCvLibraryStore((state) => state.epoch);
  const discoveryData = useCvLibraryStore((state) => state.discoveryData);
  const failedSources = useCvLibraryStore((state) => state.failedSources);
  const githubPaths = useCvLibraryStore((state) => state.githubPaths);
  const loadedAt = useCvLibraryStore((state) => state.loadedAt);
  const error = useCvLibraryStore((state) => state.error);

  const { discoverBackups } = useCloudDiscovery();
  const { downloadBackup, handleDelete } = useCloudOperations(githubPaths);
  const { performRestore } = useCloudRestoreAction(downloadBackup);

  // Discovery is not reentrant: a second pass while the first is in flight
  // would double every GitHub request for the same answer. Keyed by the store's
  // epoch, so a pass orphaned by a reset does not block the next user's (#63).
  const inFlightRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    const store = useCvLibraryStore.getState();
    if (inFlightRef.current === store.epoch) return;
    const epoch = store.setLoading();
    inFlightRef.current = epoch;

    try {
      const { foundBackups, githubPaths: paths, attempted, failed } = await discoverBackups();

      // One of two providers failing is a warning beside the results. Every
      // attempted provider failing is an error state — reporting "no backups"
      // there is how an expired token used to look like an empty account.
      if (attempted.length > 0 && failed.length === attempted.length) {
        store.setError(t('cvs.error_desc'), epoch);
        return;
      }

      store.setReady(foundBackups, paths, failed, epoch);
    } catch (err) {
      console.error('[CvLibrary] Discovery failed:', err);
      useCvLibraryStore.getState().setError(t('cvs.error_desc'), epoch);
    } finally {
      if (inFlightRef.current === epoch) inFlightRef.current = null;
    }
    // `discoverBackups` is rebuilt every render by design (it closes over the
    // current credentials), so it is deliberately not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    if (!isCloudActive) {
      if (useCvLibraryStore.getState().status !== 'unconfigured') {
        useCvLibraryStore.getState().setUnconfigured();
      }
      return;
    }

    const store = useCvLibraryStore.getState();
    if (store.status === 'loading') return;
    // A failed load stays failed until the user presses Retry. Re-running it on
    // every mount would replace the explanation with a spinner and, for a dead
    // token, do so on every navigation.
    if (store.status === 'error') return;
    const isFresh =
      store.status === 'ready' &&
      store.loadedAt !== null &&
      Date.now() - store.loadedAt < CACHE_TTL_MS;
    if (isFresh) return;

    void load();
    // `epoch`: a sign-out resets the store to idle under a page that stays
    // cloud-active (the GitHub PAT outlives the session), so reload then (#63).
  }, [isCloudActive, load, epoch]);

  // After every load, whoever ran it: the language-switch restore prompt fills
  // this store too, and a fresh device is exactly when the cache is empty.
  useEffect(() => {
    if (status !== 'ready' || !discoveryData) return;
    void hydrateGitHubPostingUrls(discoveryData, downloadBackup);
    // Once per load; `discoveryData` changes as links arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, loadedAt]);

  const { versions } = useMemo(() => flattenDiscovery(discoveryData), [discoveryData]);

  // The editor's draft is in one language, so only that language's master can
  // say when it was last backed up. Deliberately independent of the toolbar's
  // language filter: the card describes the draft, not the current view.
  const activeLanguageMaster = useMemo(
    () => selectMasterForLocale(versions, cvLanguage),
    [versions, cvLanguage],
  );

  const restore = useCallback(
    (version: CvVersion) => performRestore(version.source, version.file, version.locale),
    [performRestore],
  );

  const remove = useCallback(
    // The row's menu trigger goes with the row it opens, so the anchor is the
    // same trigger on the row that took its place.
    (version: CvVersion, index: number) =>
      handleDelete(version.file, version.source, version.locale, cvLibraryDeleteAnchor(index)),
    [handleDelete],
  );

  const downloadJson = useCallback(
    async (version: CvVersion) => {
      try {
        const { data } = await downloadBackup(version.source, version.file, version.locale);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, version.file.name);
      } catch (err) {
        console.error('[CvLibrary] Download failed:', err);
        addToast(t('sync.error'), 'error');
      }
    },
    [addToast, downloadBackup, t],
  );

  const refresh = useCallback(() => {
    analytics.track(ANALYTICS_EVENTS.CV_LIBRARY_REFRESHED);
    void load();
  }, [load]);

  return {
    status,
    error,
    failedSources,
    loadedAt,
    versions,
    activeLanguageMaster,
    activeLocale: cvLanguage,
    restore,
    remove,
    downloadJson,
    refresh,
  };
}
