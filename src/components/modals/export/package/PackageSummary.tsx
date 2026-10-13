import { useState } from 'react';
import { FaRegFileCode, FaRegFilePdf } from 'react-icons/fa';
import { FiSave } from 'react-icons/fi';

import { FormatCard } from '@/components/modals/export/package/FormatCard';
import { type ExportFormatId } from '@/components/modals/export/types';
import { Disclosure } from '@/components/ui/Disclosure';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, Package } from 'lucide-react';

interface PackageSummaryProps {
  formats: Record<ExportFormatId, boolean>;
  disabled: boolean;
  onToggleFormat: (id: ExportFormatId, enabled: boolean) => void;
}

/**
 * What the export contains, collapsed by default.
 *
 * The format choice stays reachable because it is the recovery route from a
 * failed build: switching the PDF off skips the Typst compile, which is the one
 * step slow and fragile enough to take a whole run down.
 */
export function PackageSummary({ formats, disabled, onToggleFormat }: PackageSummaryProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Disclosure
      open={open}
      onOpenChange={setOpen}
      className="border-border bg-card/40 rounded-xl border"
      headerClassName="px-3"
      triggerClassName="flex items-center justify-between gap-3 py-2"
      panelClassName="px-3 pb-3"
      trigger={
        <>
          <span className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
            <Package className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{t('sync.export_dialog.package_summary')}</span>
          </span>
          <span className="text-primary-strong inline-flex shrink-0 items-center gap-1 text-xs font-bold">
            {t('sync.export_dialog.package_change')}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </span>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <FormatCard
          icon={FaRegFilePdf}
          label={t('sync.export_dialog.package_pdf_label')}
          description={t('sync.export_dialog.package_pdf_desc')}
          checked={formats.pdf}
          disabled={disabled}
          onCheckedChange={(next) => onToggleFormat('pdf', next)}
        />
        <FormatCard
          icon={FaRegFileCode}
          label={t('sync.export_dialog.package_html_label')}
          description={t('sync.export_dialog.package_html_desc')}
          checked={formats.html}
          disabled={disabled}
          onCheckedChange={(next) => onToggleFormat('html', next)}
        />
        <FormatCard
          icon={FiSave}
          label={t('sync.export_dialog.package_backup_label')}
          description={t('sync.export_dialog.package_backup_desc')}
          checked
          locked
          lockedLabel={t('sync.export_dialog.package_always_included')}
        />
      </div>
    </Disclosure>
  );
}
