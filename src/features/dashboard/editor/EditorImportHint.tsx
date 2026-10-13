import { useTranslation } from '@/hooks/useTranslation';
import { Upload } from 'lucide-react';

interface EditorImportHintProps {
  onImport: () => void;
}

/** A quiet import offer above an empty CV; the caller hides it once the CV holds data. */
export function EditorImportHint({ onImport }: EditorImportHintProps) {
  const { t } = useTranslation();

  return (
    <p className="border-border text-muted-foreground mb-4 flex items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm">
      <Upload className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        {t('editor.import_hint.question')}{' '}
        <button
          type="button"
          onClick={onImport}
          className="text-primary-strong font-semibold underline underline-offset-2"
        >
          {t('editor.import_hint.action')}
        </button>
      </span>
    </p>
  );
}
