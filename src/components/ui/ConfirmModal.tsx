import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { cn } from '@/utils/cn';
import { Info, TriangleAlert } from 'lucide-react';

export const ConfirmModal = () => {
  const { isOpen, options, onConfirm, onCancel, onDismiss } = useConfirmStore();
  const { t } = useTranslation();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const isDestructive = options.variant === 'destructive';
  // A confirm/response gate keeps the alertdialog role: it interrupts and demands
  // a response, and outside-click dismissal is hardcoded off by the primitive.
  // `showCloseButton` is the caller's per-call opt-in to an X escape hatch.
  const dismissible = Boolean(options.showCloseButton);
  const hasCancel = options.cancelText !== '';

  return (
    <DialogFrame
      role="alertdialog"
      open={isOpen}
      onOpenChange={(open) => {
        // Only a genuine dismissal reaches here: outside-click is off, Escape is
        // gated by `dismissible`/`busy`, and the close button by `busy`. The
        // store also refuses a dismiss while loading.
        if (!open) onDismiss();
      }}
      onOpenAutoFocus={(event) => {
        const preferredButton =
          options.preferredFocus === 'confirm' ? confirmButtonRef.current : cancelButtonRef.current;

        if (!preferredButton) return;

        event.preventDefault();
        preferredButton.focus();
      }}
      restoreFocusTo={options.restoreFocusTo}
      busy={options.isLoading}
      dismissible={dismissible}
      maxWidth="md"
      zIndexClassName="z-[200]"
      header={
        <div className="px-6 pt-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'shrink-0 rounded-full p-2',
                isDestructive
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary-strong',
              )}
            >
              {isDestructive ? (
                <TriangleAlert className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Info className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {/* Only the title shares the close button's vertical band; the
                  message sits below it, so reserve the right gutter on the
                  title alone and keep the message column full width. */}
              <DialogFrameTitle
                className={cn('text-foreground text-xl font-bold', dismissible && 'pr-8')}
              >
                {options.title}
              </DialogFrameTitle>
              <DialogFrameDescription className="text-muted-foreground mt-2 leading-relaxed">
                {options.message}
              </DialogFrameDescription>
            </div>
          </div>
        </div>
      }
    >
      <div
        className={cn(
          'flex items-center gap-3 px-6 pt-8 pb-6',
          hasCancel ? 'justify-end' : 'w-full',
        )}
      >
        {hasCancel && (
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            aria-disabled={options.isLoading || undefined}
            onClick={onCancel}
          >
            {options.cancelText || t('common.cancel')}
          </Button>
        )}
        <Button
          ref={confirmButtonRef}
          variant={isDestructive ? 'danger' : 'primary'}
          loading={options.isLoading}
          onClick={onConfirm}
          className={hasCancel ? undefined : 'flex-1'}
        >
          {options.confirmText || t('common.confirm')}
        </Button>
      </div>
    </DialogFrame>
  );
};
