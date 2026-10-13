import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { FilePenLine, Upload } from 'lucide-react';

interface EditorStartPanelProps {
  onCreate: () => void;
  onImport: () => void;
}

export function EditorStartPanel({ onCreate, onImport }: EditorStartPanelProps) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="editor-start-title"
      className="border-border bg-card rounded-2xl border p-5 shadow-[var(--elevation-1)] sm:p-6"
    >
      <div className="max-w-xl">
        <h2 id="editor-start-title" className="text-foreground text-xl font-extrabold">
          {t('landing.workflow.create.title')}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {t('landing.workflow.create.description')}
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onCreate} variant="primary" size="lg">
          <FilePenLine className="h-4 w-4" aria-hidden="true" />
          {t('landing.hero.primary_action')}
        </Button>
        <Button onClick={onImport} variant="secondary" size="lg">
          <Upload className="h-4 w-4" aria-hidden="true" />
          {t('landing.hero.secondary_action')}
        </Button>
      </div>
    </section>
  );
}
