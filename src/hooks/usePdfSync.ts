import { useCallback, useEffect, useRef, useState } from 'react';

import { useResumeStore } from '@/store/resume/useResumeStore';
import type { ResumeData } from '@/types/resume';

/**
 * Hook to manage synchronization between real-time resume data and PDF preview.
 * PDF updates are expensive, so we only sync on 'blur' or after an idle period.
 */
export function usePdfSync() {
  const resume = useResumeStore((state) => state.resume);
  const setIsSyncingData = useResumeStore((state) => state.setIsSyncingData);

  // The 'synced' version of the resume that the PDF actually uses
  const [syncedResume, setSyncedResume] = useState<ResumeData>(resume);
  const lastSyncedRef = useRef<ResumeData>(resume);
  const isInitialMount = useRef(true);

  const sync = useCallback(() => {
    // Only sync if data actually changed to avoid unnecessary PDF re-generations
    if (JSON.stringify(resume) === JSON.stringify(lastSyncedRef.current)) {
      return;
    }

    setSyncedResume(resume);
    lastSyncedRef.current = resume;
    setIsSyncingData(false);
  }, [resume, setIsSyncingData]);

  // 1. Idle Debounce (Sync after 3 seconds of no changes)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Signal that we have 'pending' changes
    if (JSON.stringify(resume) !== JSON.stringify(lastSyncedRef.current)) {
      // Defer state update to avoid lint error / cascading renders
      const timer = setTimeout(() => setIsSyncingData(true), 0);
      const syncTimer = setTimeout(sync, 3000);
      return () => {
        clearTimeout(timer);
        clearTimeout(syncTimer);
      };
    }

    const timer = setTimeout(sync, 3000);
    return () => clearTimeout(timer);
  }, [resume, sync, setIsSyncingData]);

  // 2. Global Blur Sync (Sync immediately when user clicks away from a field)
  useEffect(() => {
    const handleGlobalBlur = (e: FocusEvent) => {
      // We only care about blur on inputs, textareas, or other editable elements
      const target = e.target as HTMLElement | null;
      if (!target || typeof target.hasAttribute !== 'function') {
        return;
      }

      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.hasAttribute('contenteditable')
      ) {
        sync();
      }
    };

    window.addEventListener('blur', handleGlobalBlur, true);
    return () => window.removeEventListener('blur', handleGlobalBlur, true);
  }, [sync]);

  // 3. Immediate sync on theme/layout changes (these should feel snappier)
  const metaKey = JSON.stringify({
    themeId: resume.meta.theme.name,
    params: resume.meta.theme.params,
    order: resume.meta.content.order,
  });

  useEffect(() => {
    // Avoid synchronous setState in effect by deferring
    const timer = setTimeout(sync, 0);
    return () => clearTimeout(timer);
  }, [metaKey, sync]);

  return syncedResume;
}
