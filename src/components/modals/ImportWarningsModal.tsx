import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { type ImportWarning, labelKeyForWarningSection } from '@/utils/validation';
import { ChevronRight, TriangleAlert } from 'lucide-react';

interface ImportWarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  warnings: ImportWarning[];
}

export function ImportWarningsModal({ isOpen, onClose, warnings }: ImportWarningsModalProps) {
  const { t } = useTranslation();

  return (
    <DialogFrame
      open={isOpen && warnings.length > 0}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="lg"
      zIndexClassName="z-[90]"
      closePlacement="bar"
      header={
        <div className="border-border bg-card sticky top-0 z-20 flex items-center gap-2 border-b p-3.5 pr-14 text-amber-600 sm:p-4 dark:text-amber-400">
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          <DialogFrameTitle className="text-lg font-semibold">
            {t('editor.import_warnings_title')}
          </DialogFrameTitle>
        </div>
      }
    >
      <div className="space-y-4 p-3.5 sm:p-4">
        <DialogFrameDescription className="text-muted-foreground text-sm leading-relaxed">
          {t('welcome.import_success_with_warnings')}
        </DialogFrameDescription>

        <div className="space-y-2">
          {warnings.map((warning, index) => {
            // One shared inventory — this once read
            // `editor.sections.<section>` while `GlobalImportWarningsModal` read
            // the same with a `basics` special case, so a `basics` warning was
            // labelled in one modal and printed its raw translation key in the
            // other.
            const labelKey = labelKeyForWarningSection(warning.section);

            return (
              <div
                key={index}
                className="bg-muted/30 border-border/50 hover:border-border group flex flex-col rounded-lg border p-2.5 transition-colors sm:p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-primary-strong text-xs font-bold tracking-wider uppercase">
                    {labelKey ? t(labelKey) : warning.section}
                  </span>
                  {warning.item && (
                    <>
                      <ChevronRight className="text-muted-foreground/50 h-3 w-3" />
                      <span className="text-foreground text-sm font-medium">{warning.item}</span>
                    </>
                  )}
                </div>
                <div className="text-muted-foreground flex items-baseline gap-1.5 text-sm">
                  <span className="bg-muted border-border/50 rounded border px-1 font-mono text-xs">
                    {warning.field}
                  </span>
                  <span className="line-clamp-2 text-amber-600/90 italic sm:line-clamp-none dark:text-amber-400/90">
                    {t(warning.message, warning.vars)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky so the acknowledge action stays reachable on a long warning list.
          Direct child of ModalContainer's scroll region, opaque bg — pins there. */}
      <div className="border-border bg-card sticky bottom-0 flex justify-end border-t p-3.5 sm:p-4">
        <Button variant="primary" onClick={onClose} className="rounded-xl px-8 sm:text-base">
          {t('common.success')}
        </Button>
      </div>
    </DialogFrame>
  );
}
