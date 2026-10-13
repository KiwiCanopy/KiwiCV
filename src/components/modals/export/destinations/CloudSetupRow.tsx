import { IoCloudUploadOutline } from 'react-icons/io5';

import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface CloudSetupRowProps {
  onSetup: () => void;
  disabled?: boolean;
}

/**
 * Stands in for the cloud destinations while nothing is connected.
 *
 * The row replaces the "manage in Settings" sentence rather than joining it:
 * with no provider connected there is nothing to manage yet, and an offer to
 * connect is the only useful thing to say.
 */
export function CloudSetupRow({ onSetup, disabled }: CloudSetupRowProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border/70 flex items-start gap-3 rounded-xl border border-dashed p-3 sm:p-4">
      <span className="text-muted-foreground mt-0.5 shrink-0" aria-hidden="true">
        <IoCloudUploadOutline className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-bold tracking-tight">
          {t('sync.export_dialog.cloud_setup_label')}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {t('sync.export_dialog.cloud_setup_desc')}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onSetup} disabled={disabled}>
        {t('sync.export_dialog.cloud_setup_action')}
      </Button>
    </div>
  );
}
