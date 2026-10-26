import { useId } from 'react';
import { FiFileText } from 'react-icons/fi';

import { Switch } from '@/components/ui/Switch';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { cn } from '@/utils/cn';
import { hasCoverLetterText, isPrintedLetterOutdated } from '@/utils/coverLetter';
import { TriangleAlert } from 'lucide-react';

/**
 * Whether the letter rides along as the PDF's first page. Writes the same
 * `coverLetter.enabled` the editor's On/Off does, so there is one setting.
 * Renders nothing while there is no letter to include.
 */
export function CoverLetterRow({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation();
  const warningId = useId();
  const letter = useResumeStore((state) => state.resume.coverLetter);
  const updateCoverLetter = useResumeStore((state) => state.updateCoverLetter);
  if (!hasCoverLetterText(letter)) return null;

  const included = letter.enabled;
  const warn = isPrintedLetterOutdated(letter);

  return (
    <div
      className={cn(
        'border-border bg-card/40 rounded-xl border px-3 py-2',
        warn && 'border-warning/40',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
          <FiFileText className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">
            {included
              ? t('sync.export_dialog.letter_included')
              : t('sync.export_dialog.letter_excluded')}
          </span>
        </span>
        <Switch
          checked={included}
          label={t('sync.export_dialog.letter_toggle')}
          disabled={disabled}
          aria-describedby={warn ? warningId : undefined}
          onCheckedChange={(next) => updateCoverLetter({ enabled: next })}
        />
      </div>
      {warn && (
        <p
          id={warningId}
          className="text-warning mt-1.5 flex items-center gap-1.5 text-[11px] font-bold"
        >
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t('sync.export_dialog.letter_outdated')}
        </p>
      )}
    </div>
  );
}
