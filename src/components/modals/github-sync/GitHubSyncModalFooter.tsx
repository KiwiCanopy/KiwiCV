import type { GitHubConnectStatus } from '@/components/modals/github-sync/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Check, ChevronLeft, Link as LinkIcon } from 'lucide-react';

interface GitHubSyncModalFooterProps {
  status: GitHubConnectStatus;
  isLoading: boolean;
  canConnect: boolean;
  onConnect: () => void;
  onBack?: () => void;
  onClose: () => void;
}

export function GitHubSyncModalFooter({
  status,
  isLoading,
  canConnect,
  onConnect,
  onBack,
  onClose,
}: GitHubSyncModalFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 pt-4">
      <button
        onClick={onConnect}
        disabled={isLoading || !canConnect || status === 'success'}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60',
          status === 'success'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/50'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong',
        )}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : status === 'success' ? (
          <Check className="h-5 w-5" />
        ) : (
          <LinkIcon className="h-5 w-5" />
        )}
        {status === 'success'
          ? isLoading
            ? t('sync.checking')
            : t('common.continue')
          : t('settings.github.modal_connect_btn')}
      </button>

      <button
        type="button"
        disabled={isLoading || status === 'success'}
        onClick={(e) => {
          e.stopPropagation();
          if (onBack) {
            onBack();
          } else {
            onClose();
          }
        }}
        className="border-input bg-card text-foreground hover:bg-muted focus-visible:ring-primary-strong flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 sm:px-6 sm:py-3"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('common.back')}
      </button>
    </div>
  );
}
