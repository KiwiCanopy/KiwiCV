import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CloudSaveButton } from '@/components/ui/CloudSaveButton';
import { ExportButton } from '@/components/ui/ExportButton';
import { HeaderActions } from '@/components/ui/HeaderActions';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSyncWorkflow } from '@/hooks/useSyncWorkflow';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useImportModalStore } from '@/store/ui/useImportModalStore';
import { isMeaningfullyEmpty } from '@/utils/validation';
import { CircleAlert, Share } from 'lucide-react';

export const DashboardHeaderActions = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const resume = useResumeStore((state) => state.resume);

  // Sync & Manage Hooks and State
  const {
    syncStatus,
    isAlreadySynced,
    errorMessage,
    handleTrigger: handleSave,
  } = useSyncWorkflow({
    mode: 'sync',
    variant: 'root',
  });

  const handledActionsRef = useRef<Record<string, boolean>>({});

  const openImportModal = useImportModalStore((state) => state.open);
  const openAIModal = useResumeStore((state) => state.openAIModal);
  const hasData = !isMeaningfullyEmpty(resume);
  const isTabletOrMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);

  // Automatically handle Try AI flows from Landing Page redirect or login action
  useEffect(() => {
    const action = searchParams.get('action');
    if (action !== 'try_ai') {
      handledActionsRef.current['try_ai'] = false;
      return;
    }

    if (!handledActionsRef.current['try_ai']) {
      handledActionsRef.current['try_ai'] = true;

      // Cleanse URL parameters instantly
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete('action');
      setSearchParams(updatedParams, { replace: true });

      if (!hasData) {
        openImportModal('import_choice', 'landing');
      } else {
        openAIModal('cv');
      }
    }
  }, [searchParams, setSearchParams, hasData, openImportModal, openAIModal]);

  return (
    <HeaderActions>
      <div className="relative order-first flex h-10 items-center">
        {/* Error Tooltip */}
        {syncStatus === 'error' && errorMessage && (
          <div className="animate-in fade-in slide-in-from-top-1 absolute top-full right-0 z-[100] mt-2 w-64 duration-200">
            <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md">
              <CircleAlert className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="flex h-10 items-center gap-3">
          <CloudSaveButton
            status={syncStatus}
            isAlreadySynced={isAlreadySynced}
            errorMessage={errorMessage || undefined}
            disabled={syncStatus === 'loading'}
            isTabletOrMobile={isTabletOrMobile}
            onClick={handleSave}
            idleLabel={t('dashboard.backup')}
          />
          <ExportButton
            id={EXPORT_TRIGGER_ANCHOR_ID}
            variant="full"
            mode="push"
            label={t('dashboard.export')}
            icon={<Share className="h-4 w-4 shrink-0" aria-hidden="true" />}
          />
        </div>
      </div>
    </HeaderActions>
  );
};
