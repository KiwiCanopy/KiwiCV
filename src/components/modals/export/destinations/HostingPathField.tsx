import { type ChangeEvent } from 'react';

import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';

interface HostingPathFieldProps {
  disabled: boolean;
}

/**
 * Where in the repository the published HTML lands.
 *
 * Stored on the resume rather than in the dialog's own preferences: it is a
 * property of the project's repository layout, it already lives at
 * `meta.export.hostingPath`, and the value must survive an export.
 * `normalizeHostingPath` is what turns whatever is typed here into a file path
 * Pages can serve, so a bare `/docs` is a valid thing to leave in the field.
 */
export function HostingPathField({ disabled }: HostingPathFieldProps) {
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);

  return (
    <Input
      label={t('sync.export_dialog.dest_github_pages_path_label')}
      value={resume.meta.export.hostingPath || ''}
      disabled={disabled}
      placeholder="/docs"
      className="h-10"
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        updateMeta({ export: { ...resume.meta.export, hostingPath: event.target.value } })
      }
    />
  );
}
