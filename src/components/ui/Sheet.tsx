import { type ReactNode } from 'react';

import { useInsideStaysOnTop } from '@/components/ui/DialogFrame';
import { noteDialogOpened } from '@/components/ui/dialogStack';
import { cn } from '@/utils/cn';
import * as Dialog from '@radix-ui/react-dialog';

interface SheetProps {
  /** Open state. Sheet owns `Dialog.Root`, so consumers never import Radix. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Accessible name. Always rendered, always visually hidden — a sheet's own
   * content supplies the visible heading, and a second visible copy would
   * duplicate it.
   */
  title: string;
  /** Accessible description. Radix warns when a dialog has none. */
  description: string;
  /** Edge the panel is anchored to. */
  side?: 'left' | 'right';
  /** Classes for the panel. */
  className?: string;
  /** Classes for the scrim. */
  overlayClassName?: string;
  children: ReactNode;
}

const SIDE_CLASSES = {
  left: 'left-0 border-r data-[state=open]:slide-in-from-left',
  right: 'right-0 border-l data-[state=open]:slide-in-from-right',
};

/**
 * An edge-anchored panel: portal, focus trap, scroll lock, Escape, and
 * dismissal by tapping the scrim.
 *
 * Deliberately not `DialogFrame`. That frame is a centred modal — it pins its
 * `ModalContainer` to the viewport centre, rounds and shadows it, caps its
 * width, and hardcodes outside-click dismissal *off* because a modal wants a
 * deliberate answer. A navigation drawer wants the opposite on every one of
 * those points, and tapping the scrim is the main way it gets closed on a
 * phone. Both surfaces sit on `@radix-ui/react-dialog`; only the shell differs.
 *
 * `inset-y-0` rather than `h-screen`: for a fixed element that tracks the
 * visible viewport, where `100vh` on mobile browsers can run under the address
 * bar and clip whatever the panel puts at its bottom edge.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  side = 'left',
  className,
  overlayClassName,
  children,
}: SheetProps) {
  const insideStaysOnTop = useInsideStaysOnTop();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 z-50 bg-black/50 duration-200',
            overlayClassName,
          )}
        />
        <Dialog.Content
          // Lets a dialog that stays on top take its layer back (#9).
          onOpenAutoFocus={() => {
            if (!insideStaysOnTop) queueMicrotask(noteDialogOpened);
          }}
          className={cn(
            'border-border data-[state=open]:animate-in fixed inset-y-0 z-50 shadow-[var(--elevation-2)] duration-200 focus:outline-none',
            SIDE_CLASSES[side],
            className,
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
