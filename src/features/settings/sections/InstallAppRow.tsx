import { Button } from '@/components/ui/Button';
import { usePwaInstallStatus } from '@/hooks/usePwaInstallStatus';
import { promptPwaInstall } from '@/services/pwaInstall';
import { CircleCheck, Download } from 'lucide-react';

interface InstallAppRowProps {
  t: (key: string) => string;
}

/** Settings → Interface row. Always shown; only the right-hand side follows the browser. */
export const InstallAppRow = ({ t }: InstallAppRowProps) => {
  const status = usePwaInstallStatus();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-0.5">
        <p className="text-foreground text-sm font-semibold">
          {t('settings.interface.install.label')}
        </p>
        <p className="text-muted-foreground text-sm">
          {t('settings.interface.install.description')}
        </p>
      </div>
      {/* A standing live region, so the switch to "installed" is announced. */}
      <div role="status" className="shrink-0 sm:max-w-64">
        {status === 'installed' && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <CircleCheck className="text-primary-strong h-4 w-4" aria-hidden="true" />
            {t('settings.interface.install.installed')}
          </p>
        )}
        {status === 'ios' && (
          <p className="text-muted-foreground text-sm">
            {t('settings.interface.install.ios_hint')}
          </p>
        )}
        {(status === 'available' || status === 'unsupported') && (
          <Button
            variant="secondary"
            onClick={() => void promptPwaInstall()}
            disabled={status === 'unsupported'}
            disabledReason={
              status === 'unsupported' ? t('settings.interface.install.unsupported') : undefined
            }
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('settings.interface.install.action')}
          </Button>
        )}
      </div>
    </div>
  );
};
