import { FiSave } from 'react-icons/fi';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { SiGithub } from 'react-icons/si';

import { GoogleDriveIcon } from '@/components/ui/Icons';
import { BREAKPOINTS } from '@/constants/breakpoints';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSyncWorkflow } from '@/hooks/useSyncWorkflow';
import { useTranslation } from '@/hooks/useTranslation';
import { hasStoredGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';

export function ExportButton({
  variant = 'root',
  label,
  mode = 'sync',
  showTextOnMobile = false,
  disabled = false,
  className,
  icon,
  id,
}: {
  variant?: 'root' | 'full' | 'hosting';
  label?: string;
  icon?: React.ReactNode;
  mode?: 'sync' | 'push';
  showTextOnMobile?: boolean;
  disabled?: boolean;
  className?: string;
  /**
   * Addresses this button as a focus anchor. Passed by the one call site that
   * starts the export flow, not baked in here — the component is reusable and an
   * id has to stay unique.
   */
  id?: string;
}) {
  const { t } = useTranslation();
  const { hasDrivePermission } = useAuth();
  const isTabletOrMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MD - 1}px)`);

  const sync = useResumeStore((state) => state.sync);

  const {
    syncStatus,
    isAlreadySynced,
    errorMessage,
    setActiveModal,
    handleTrigger: handleWorkflowTrigger,
  } = useSyncWorkflow({ mode, variant });

  const handleTrigger = () => {
    if (mode === 'push') {
      setActiveModal('name', 'export');
      return;
    }
    handleWorkflowTrigger();
  };

  const getButtonIcon = (sizeClass = 'h-5 w-5') => {
    if (mode === 'sync') {
      return <FiSave className={cn(sizeClass, 'shrink-0')} />;
    }

    if (variant === 'hosting') {
      return <SiGithub className={cn(sizeClass, 'shrink-0')} />;
    }

    const hasPat = !!(localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat'));
    const hasDriveCreds = hasStoredGoogleDriveCreds();

    const isGitHubActive = sync.github.enabled && hasPat;
    const isGoogleActive = sync.googleDrive.enabled && hasDriveCreds && hasDrivePermission === true;

    if (isGoogleActive && !isGitHubActive) {
      return (
        <GoogleDriveIcon
          size={18}
          className={cn(sizeClass, 'shrink-0 transition-transform group-hover:scale-110')}
        />
      );
    }

    if (isGitHubActive && !isGoogleActive) {
      return <SiGithub className={cn(sizeClass, 'shrink-0')} />;
    }

    return <IoCloudUploadOutline className={cn(sizeClass, 'shrink-0')} />;
  };

  const getStatusLabel = () => {
    if (syncStatus === 'loading') {
      return mode === 'push' ? t('sync.pushing') : t('sync.backing_up');
    }
    if (syncStatus === 'success') {
      if (isAlreadySynced) {
        return variant === 'hosting' || variant === 'full'
          ? t('sync.already_pushed')
          : t('sync.up_to_date');
      }
      return errorMessage || (mode === 'push' ? t('sync.pushed') : t('sync.backed_up'));
    }
    if (syncStatus === 'error') {
      return errorMessage || t('common.error');
    }

    if (label) return label;
    if (variant === 'hosting') return t('header.push_to_cloud');
    if (mode === 'sync') return t('sync.backup_action');

    const hasPat = !!(localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat'));
    const hasDriveCreds = hasStoredGoogleDriveCreds();

    const isGitHubActive = sync.github.enabled && hasPat;
    const isGoogleActive = sync.googleDrive.enabled && hasDriveCreds && hasDrivePermission === true;

    if (isGoogleActive && !isGitHubActive) return t('sync.push_google_drive');
    if (isGitHubActive && !isGoogleActive) return t('sync.push_github');

    return t('header.push_to_cloud');
  };

  const isActuallyDisabled = disabled || syncStatus === 'loading';

  return (
    <div className={cn('relative inline-block h-10 w-auto', className)}>
      {syncStatus === 'error' && errorMessage && (
        <div className="animate-in fade-in slide-in-from-top-1 absolute top-full right-0 z-[100] mt-2 w-64 duration-200">
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-md">
            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        </div>
      )}

      <button
        id={id}
        onClick={handleTrigger}
        disabled={isActuallyDisabled}
        title={isTabletOrMobile ? getStatusLabel() : undefined}
        className={cn(
          'group flex h-10 min-w-[40px] items-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-all',
          isActuallyDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'disabled:cursor-not-allowed disabled:opacity-80',
          syncStatus === 'success'
            ? 'bg-success text-success-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {syncStatus === 'loading' && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />}
        {syncStatus === 'success' && <Check className="h-4 w-4 shrink-0" />}
        {syncStatus === 'error' && <CircleAlert className="h-4 w-4 shrink-0" />}
        {syncStatus === 'idle' && (icon || getButtonIcon())}

        <span
          className={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
            showTextOnMobile
              ? 'ml-2 max-w-none opacity-100'
              : 'max-w-0 opacity-0 sm:group-hover:ml-2 sm:group-hover:max-w-xs sm:group-hover:opacity-100 md:ml-2 md:max-w-none md:opacity-100',
          )}
        >
          {getStatusLabel()}
        </span>
      </button>
    </div>
  );
}
