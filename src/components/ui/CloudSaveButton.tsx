import React from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Check, CircleAlert, CloudUpload, LoaderCircle } from 'lucide-react';

interface CloudSaveButtonProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  isAlreadySynced: boolean;
  errorMessage?: string;
  disabled?: boolean;
  isTabletOrMobile?: boolean;
  onClick: () => void;
  className?: string;
  idleLabel?: string;
}

export const CloudSaveButton: React.FC<CloudSaveButtonProps> = ({
  status,
  isAlreadySynced,
  errorMessage,
  disabled,
  isTabletOrMobile,
  onClick,
  className,
  idleLabel,
}) => {
  const { t } = useTranslation();

  const getStatusLabel = () => {
    if (status === 'loading') return t('sync.backing_up');
    if (status === 'success') {
      if (isAlreadySynced) return t('sync.up_to_date');
      return errorMessage || t('sync.backed_up');
    }
    if (status === 'error') return errorMessage || t('common.error');
    return idleLabel || t('sync.backup_action');
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isTabletOrMobile ? getStatusLabel() : undefined}
      className={cn(
        // Matches `Button variant="secondary"`, which is borderless by
        // decision — see the note there. The 1px `border-transparent` stays so
        // this button is the same height as its bordered neighbours in the
        // header row.
        'group flex h-full min-w-10 items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors',
        status === 'success'
          ? 'bg-success text-success-foreground'
          : cn('bg-secondary text-foreground', !disabled && 'hover:bg-mist active:bg-border'),
        disabled && 'cursor-not-allowed opacity-80',
        className,
      )}
    >
      {status === 'loading' && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />}
      {status === 'success' && <Check className="h-4 w-4 shrink-0" />}
      {status === 'error' && <CircleAlert className="h-4 w-4 shrink-0" />}
      {status === 'idle' && <CloudUpload className="h-4 w-4 shrink-0" />}

      <span
        className={cn(
          'whitespace-nowrap transition-all duration-300',
          isTabletOrMobile ? 'hidden' : 'inline',
        )}
      >
        {getStatusLabel()}
      </span>
    </button>
  );
};
