import React from 'react';

import { DialogFrame, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { type FocusAnchor } from '@/utils/focus';

interface AIModalTemplateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  preventClose?: boolean;
  /**
   * Accessible name of the dialog. Used directly only when `header` is absent
   * or renders no heading of its own, where it is attached sr-only so the
   * surface is never nameless.
   */
  title: string;
  /**
   * Full-bleed header. A header that carries its own `DialogFrameTitle` — the
   * AI edit header does — becomes the dialog's visible name, and `title` then
   * only backs the states where the header is not rendered.
   */
  header?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'none';
  /** Marks the header slot as carrying the name, so no sr-only copy is added. */
  headerOwnsTitle?: boolean;
  /** `DialogFrame`'s fallback for an opener that cannot take focus back. */
  restoreFocusTo?: FocusAnchor;
}

export const AIModalTemplate: React.FC<AIModalTemplateProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  preventClose = false,
  title,
  header,
  headerOwnsTitle = false,
  children,
  maxWidth = 'xl',
  restoreFocusTo,
}) => {
  // Radix allows exactly one Title per dialog: the sr-only copy is added only
  // where the rendered header does not already provide one.
  //
  // This fragment is never null, so `DialogFrame` always takes its custom-header
  // branch and positions the close button `absolute top-4 right-4`. That is
  // correct while a header renders. States that hide the header — AI processing
  // and success — would otherwise leave the button floating over the content,
  // which reserves no space for it, so a spacer stands in for the missing
  // header's height.
  const namedHeader = headerOwnsTitle ? (
    header
  ) : (
    <>
      {header}
      <DialogFrameTitle className="sr-only">{title}</DialogFrameTitle>
      {header == null && <div className="h-14 shrink-0" aria-hidden="true" />}
    </>
  );

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open, reason) => {
        if (open) return;
        // The close button used to be this template's own, wired straight to
        // `onClose`; the frame now owns it, so the reason routes it back.
        if (reason === 'close-button') onClose();
        else onOpenChange(false);
      }}
      // `preventClose` covers loading/processing: it blocks Escape and marks the
      // close button busy rather than unmounting it, as the frame prescribes.
      busy={preventClose}
      maxWidth={maxWidth}
      zIndexClassName="z-[70]"
      scrollable={false}
      innerClassName="relative flex max-h-[80vh] flex-col"
      header={namedHeader}
      restoreFocusTo={restoreFocusTo}
    >
      {children}
    </DialogFrame>
  );
};
