import { CircleCheck, CloudSync, Globe } from 'lucide-react';

interface SyncSectionProps {
  t: (key: string) => string;
}

export const SyncSection = ({ t }: SyncSectionProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 text-primary-strong flex h-12 w-12 items-center justify-center rounded-2xl">
          <CloudSync className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight">
            {t('extras.howto.sync_guide.title')}
          </h2>
        </div>
      </div>

      <div className="bg-muted/30 border-border/50 rounded-xl border p-8">
        <p className="text-foreground/80 text-lg leading-relaxed">
          {t('extras.howto.sync_guide.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
            <Globe className="h-4 w-4" />
            {t('extras.howto.sync_guide.language_specific_title')}
          </h4>
          <p className="text-sm text-blue-800/80 dark:text-blue-200/80">
            {t('extras.howto.sync_guide.language_specific_desc')}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-green-900 dark:text-green-100">
            <CircleCheck className="h-4 w-4" />
            {t('extras.howto.sync_guide.auto_recognition_title')}
          </h4>
          <p className="text-sm text-green-800/80 dark:text-green-200/80">
            {t('extras.howto.sync_guide.auto_recognition_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};
