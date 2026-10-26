import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import { normalizePostingUrl } from '@/utils/applicationMeta';
import { localizedPath } from '@/utils/localeRouting';
import { Folder } from 'lucide-react';

interface ExportNameFieldsProps {
  base: string;
  company: string;
  position: string;
  postingUrl: string;
  /** Only a cloud backup keeps the link, so the field shows only when one is selected. */
  showPostingUrl: boolean;
  /** The name every destination will actually write. */
  preview: string;
  suggestedBase: string;
  disabled: boolean;
  onBaseChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onPostingUrlChange: (value: string) => void;
}

/**
 * Company and position, over a preview of the name the export will carry.
 *
 * The base name lives behind `Rename` rather than in a permanent field: it is
 * generated from the Settings filename pattern and rarely edited, but
 * overriding it per export is a real capability and removing it outright would
 * cost more than the clutter it saves.
 *
 * The preview prints base, **company**, position — that is the order
 * `getCleanProjectName` emits, and that string is the folder actually created
 * in the repository and in Drive. Reordering it to read better would give every
 * existing user a fresh folder.
 */
export function ExportNameFields({
  base,
  company,
  position,
  postingUrl,
  showPostingUrl,
  preview,
  suggestedBase,
  disabled,
  onBaseChange,
  onCompanyChange,
  onPositionChange,
  onPostingUrlChange,
}: ExportNameFieldsProps) {
  const { t, uiLanguage } = useTranslation();
  const [renaming, setRenaming] = useState(false);
  const [postingInvalid, setPostingInvalid] = useState(false);

  // Soft validation (#54): a missing scheme is added, anything else that is
  // not an http(s) address is flagged and simply not saved. Never blocks Export.
  const handlePostingBlur = () => {
    const normalized = normalizePostingUrl(postingUrl);
    if (normalized && normalized !== postingUrl) onPostingUrlChange(normalized);
    setPostingInvalid(!normalized && postingUrl.trim().length > 0);
  };

  return (
    <div className="space-y-3">
      <div className="border-border bg-card/40 flex items-center gap-3 rounded-xl border px-3 py-2.5">
        <span className="text-primary-strong shrink-0" aria-hidden="true">
          <Folder className="h-4 w-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-muted-foreground/80 text-[9px] font-black tracking-widest uppercase">
            {t('sync.export_dialog.preview_label')}
          </span>
          <span className="text-foreground truncate font-mono text-[13px] font-bold tracking-tight">
            {preview || '—'}
          </span>
        </div>
        <Button
          variant="quiet"
          size="sm"
          disabled={disabled}
          onClick={() => setRenaming((open) => !open)}
          aria-expanded={renaming}
        >
          {t('sync.export_dialog.rename')}
        </Button>
      </div>

      {renaming && (
        <Input
          label={t('sync.export_modal_input_label')}
          value={base}
          disabled={disabled}
          onChange={(event) => onBaseChange(event.target.value)}
          placeholder={suggestedBase || t('sync.export_modal_placeholder')}
          liveUpdate={true}
          infoHint={
            <Link
              to={localizedPath(uiLanguage, `/settings#project-name`)}
              className="text-primary-strong hover:text-foreground font-bold underline-offset-4 hover:underline"
            >
              {t('sync.export_modal_input_link')}
            </Link>
          }
          infoInteractive={true}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Input
          label={t('sync.export_modal_company_label')}
          value={company}
          disabled={disabled}
          onChange={(event) => onCompanyChange(event.target.value)}
          placeholder={t('common.optional')}
          liveUpdate={true}
        />
        <Input
          label={t('sync.export_modal_position_label')}
          value={position}
          disabled={disabled}
          onChange={(event) => onPositionChange(event.target.value)}
          placeholder={t('common.optional')}
          liveUpdate={true}
        />
      </div>

      {showPostingUrl && (
        <Input
          type="url"
          inputMode="url"
          autoComplete="off"
          label={t('sync.export_modal_posting_label')}
          value={postingUrl}
          disabled={disabled}
          onChange={(event) => {
            setPostingInvalid(false);
            onPostingUrlChange(event.target.value);
          }}
          onBlur={handlePostingBlur}
          placeholder={t('sync.export_modal_posting_placeholder')}
          warning={postingInvalid ? t('sync.export_dialog.posting_invalid') : null}
          liveUpdate={true}
        />
      )}

      <p className="text-muted-foreground/60 px-1 text-[11px] leading-relaxed italic">
        {t('sync.export_dialog.filename_only')}
      </p>
    </div>
  );
}
