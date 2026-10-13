import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { useImportWarningsStore } from '@/store/ui/useImportWarningsStore';
import { cn } from '@/utils/cn';
import { labelKeyForWarningSection } from '@/utils/validation';
import { ChevronRight, TriangleAlert } from 'lucide-react';

export function GlobalImportWarningsModal() {
  const { t } = useTranslation();
  const { isOpen, warnings, isCritical, closeWarnings } = useImportWarningsStore();

  if (!isOpen || warnings.length === 0) return null;

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeWarnings();
      }}
      maxWidth="lg"
      zIndexClassName="z-[110]"
      closePlacement="bar"
      header={
        <div
          className={cn(
            'border-border bg-card sticky top-0 z-20 flex items-center gap-2 border-b p-3.5 pr-14 sm:p-4',
            isCritical ? 'text-destructive' : 'text-amber-600 dark:text-amber-400',
          )}
        >
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          <DialogFrameTitle className={cn('text-lg font-bold', isCritical && 'animate-pulse')}>
            {isCritical ? t('sync.import_error_title') : t('editor.import_warnings_title')}
          </DialogFrameTitle>
        </div>
      }
    >
      <div className="space-y-4 p-3.5 sm:p-4">
        <DialogFrameDescription
          className={cn(
            'text-sm leading-relaxed font-medium',
            isCritical ? 'text-destructive/90' : 'text-muted-foreground',
          )}
        >
          {isCritical ? t('sync.import_empty_error') : t('welcome.import_success_with_warnings')}
        </DialogFrameDescription>

        <div className="space-y-2">
          {warnings.map((warning, index) => {
            // ⚠️ One shared inventory. This modal special-cased
            // `basics` and its sibling did not, so the same warning rendered
            // "Personal Details" here and the literal string
            // `editor.sections.basics` there. The `||` fallback stayed dead
            // either way — `t` returns the path for a missing key, which is
            // truthy — so a section neither could label printed its own
            // translation key. A `null` label is now the case the fallback
            // actually covers.
            const labelKey = labelKeyForWarningSection(warning.section);
            const sectionKey = labelKey ? t(labelKey) : warning.section;

            return (
              <div
                key={index}
                className={cn(
                  'group flex flex-col rounded-xl border p-2.5 transition-all sm:p-3',
                  'border-border/40 bg-muted/20',
                  'hover:bg-muted/30 hover:border-border/60',
                  isCritical && 'border-destructive/20 bg-destructive/5',
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-destructive/80 flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase sm:text-xs">
                    {sectionKey}
                  </span>
                </div>
                {warning.item && (
                  <div className="mb-1 flex items-center gap-1.5">
                    <ChevronRight className="text-muted-foreground/50 h-3 w-3" />
                    <span className="text-foreground text-sm font-medium">{warning.item}</span>
                  </div>
                )}
                <div className="text-muted-foreground flex items-baseline gap-1.5 text-sm">
                  <span className="bg-muted border-border/50 rounded border px-1 font-mono text-xs">
                    {warning.field}
                  </span>
                  <span className="line-clamp-2 italic sm:line-clamp-none">
                    {t(warning.message, warning.vars)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky so the continue action stays reachable on a long warning list.
          Direct child of ModalContainer's scroll region, opaque bg — pins there. */}
      <div className="border-border bg-card sticky bottom-0 flex justify-end border-t p-3.5 sm:p-4">
        <Button
          variant={isCritical ? 'danger' : 'primary'}
          onClick={closeWarnings}
          className="w-full gap-2 rounded-xl sm:w-auto sm:px-12"
        >
          {t('common.continue')}
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </DialogFrame>
  );
}
