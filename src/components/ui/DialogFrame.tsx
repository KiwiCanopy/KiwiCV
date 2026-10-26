import {
  type FocusEvent,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { ModalContainer } from '@/components/ui/ModalContainer';
import {
  getDialogOpens,
  noteDialogOpened,
  subscribeToDialogOpens,
} from '@/components/ui/dialogStack';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { type FocusAnchor, focusIfPossible } from '@/utils/focus';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface DialogFrameBaseProps {
  /**
   * Open state. DialogFrame owns `Dialog.Root`, so consumers never import
   * `@radix-ui/react-dialog` — a footer cancel action calls `onOpenChange(false)`
   * rather than composing `Dialog.Close`.
   */
  open: boolean;
  /**
   * `reason` distinguishes the close button from Escape. Dialogs that report a
   * dismissal to analytics need to tell the two apart; everyone else ignores
   * the second argument.
   */
  onOpenChange: (open: boolean, reason?: 'close-button' | 'escape') => void;
  /**
   * ARIA role of the surface. `'alertdialog'` swaps the internal Radix
   * primitives for `@radix-ui/react-alert-dialog` — same visual output, but the
   * surface interrupts and demands a response, and outside-click dismissal is
   * hardcoded off by the primitive. Use it for confirm/response gates. The frame
   * still owns both Radix namespaces, so consumers never import either.
   */
  role?: 'dialog' | 'alertdialog';
  /**
   * Overrides Radix's initial focus. `event.preventDefault()` then focus the
   * chosen element. Role-agnostic — an `alertdialog` needs it to honour a
   * preferred-focus target, since alert-dialog's built-in default only finds a
   * `Cancel` wrapper this frame does not render.
   */
  onOpenAutoFocus?: (event: Event) => void;
  /**
   * Where focus goes on close when the opener cannot take it back — it has
   * unmounted, or it is now disabled. A getter, because the answer only exists
   * once whatever the dialog did has been applied.
   *
   * ⚠️ Nothing below this rung, deliberately: a document-level default across
   * 23 unrelated surfaces would be the nearest survivor the focus ruling rejected
   * (`code/UI_PATTERNS.md` § Focus Handoff…).
   */
  restoreFocusTo?: FocusAnchor;
  /**
   * Accessible name for the close button. Defaults to `common.close_dialog`,
   * which is right for every dialog — pass one only to override the resolver,
   * as `LanguageOnboardingModal` does before a language has been chosen.
   *
   * ⚠️ Optional on purpose. It was required, so all 23 consumers passed the
   * same string and all 23 passed the WRONG one (`common.close_menu`) for as
   * long as the frame existed; a default is what makes the 24th correct without
   * anyone reading a wiki page.
   */
  closeLabel?: string;
  /**
   * Body content. Padded by the frame in the default shape; rendered flush in
   * `header` mode, where the caller owns all padding.
   */
  children: ReactNode;
  /** Undecorated action row under the body; the caller owns its internal layout. */
  footer?: ReactNode;
  /**
   * True while an operation is in flight. Blocks Escape and marks both the
   * surface and the close button busy. The close button stays mounted and
   * focusable, per the convention that unavailable controls stay visible.
   */
  busy?: boolean;
  /**
   * False for dialogs that must never be user-dismissed by design. Omits the
   * close button and blocks Escape, without implying `aria-busy`.
   */
  dismissible?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'none';
  className?: string;
  /**
   * False when the dialog owns its own scroll region instead of scrolling as a
   * whole — a pinned header over a `flex-1 overflow-y-auto` body, say. Pair it
   * with `innerClassName` to establish that column; the frame's own height cap
   * comes from `h-responsive`, which this turns off.
   */
  scrollable?: boolean;
  /** Classes for the scroll region wrapping header, body and footer. */
  innerClassName?: string;
}

/** The layer: a gate owns the top one, so it takes no z-index of its own. */
type DialogFrameLayerProps =
  | {
      /**
       * A blocking gate that must stay usable over anything (#9): painted on the
       * top layer, and kept the dialog Radix treats as active — scroll lock,
       * focus, pointer events — when another dialog opens after it, by remounting
       * on each such open. Focus returns to the control that had it, by position
       * among the tabbables; scroll position and DOM state inside the content do
       * not survive, so keep state above the frame.
       */
      staysOnTop: true;
      zIndexClassName?: never;
    }
  | { staysOnTop?: false; zIndexClassName?: string };

type DialogFrameProps = DialogFrameBaseProps &
  DialogFrameLayerProps &
  (
    | {
        /** Default flush shape: the frame renders the title/icon/description row. */
        header?: undefined;
        /** Visible and accessible name of the dialog. */
        title: ReactNode;
        /** Supporting copy rendered under the title. */
        description?: string;
        /** Icon rendered before the title text. */
        icon?: ReactNode;
        /** Header-mode only: the default shape lays the close button out in flow. */
        closePlacement?: never;
      }
    | {
        /**
         * Full-bleed replacement for the default title row, for dialogs whose
         * header is part of the composition rather than a label above it. It is
         * rendered flush and unpadded at the top of the scroll region.
         *
         * The frame does not pin it. A sub-block that should survive scrolling
         * carries its own `sticky top-0`, and must be opaque and sit above
         * `z-20` — body content routinely stacks that high. Pinning the whole
         * slot instead would cost every consumer the header's full height.
         *
         * The consumer marks its own heading with `DialogFrameTitle`, which is
         * the dialog's one accessible name. `title`, `description`, and `icon`
         * are uninhabitable here so a custom header cannot end up with a second
         * name competing with its visible heading.
         */
        header: ReactNode;
        /**
         * Where the close button sits over a custom header. `'corner'` (the
         * default) floats it at the surface's top-right, which is what a tall
         * header — or one that renders nothing visible, so the button lands over
         * the body — wants. `'bar'` is for the compact `p-3.5`/`p-4` header row:
         * the corner offsets are calibrated for a `p-6`-scale header, and a 44px
         * target placed at them hangs past the rule under a ~56–65px bar and
         * overlaps the section below it. `'bar'` drops the vertical offset so
         * the button reads as centred in the row; the horizontal inset stays at
         * the corner value, which is what keeps it off the scroll gutter.
         */
        closePlacement?: 'corner' | 'bar';
        title?: never;
        description?: never;
        icon?: never;
      }
  );

// Radix scopes its Dialog and AlertDialog contexts separately: a `Dialog.Title`
// throws inside an `AlertDialog.Content` and vice versa. The frame publishes its
// role so the title/description helpers reach for the matching primitive.
const DialogFrameRoleContext = createContext<'dialog' | 'alertdialog'>('dialog');
/** Inside a `staysOnTop` frame: a nested dialog's open must not remount its own host. */
const InsideStaysOnTopContext = createContext(false);
/** For a dialog primitive other than this frame (`Sheet`) deciding whether to count its open. */
export const useInsideStaysOnTop = (): boolean => useContext(InsideStaysOnTopContext);
const noSubscription = () => () => {};
const noOpens = () => 0;
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The dialog's accessible name, for use inside a `header`. This element is both
 * the visible heading and the title Radix points `aria-labelledby` at — there is
 * deliberately no second, hidden copy of the string. It renders the primitive
 * matching the enclosing `DialogFrame`'s role.
 */
export function DialogFrameTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const Title =
    useContext(DialogFrameRoleContext) === 'alertdialog' ? AlertDialog.Title : Dialog.Title;
  return <Title className={className}>{children}</Title>;
}

/** The dialog's accessible description, for use inside a `header`. */
export function DialogFrameDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const Description =
    useContext(DialogFrameRoleContext) === 'alertdialog'
      ? AlertDialog.Description
      : Dialog.Description;
  return <Description className={className}>{children}</Description>;
}

export function DialogFrame({
  open,
  onOpenChange,
  role = 'dialog',
  onOpenAutoFocus,
  restoreFocusTo,
  closeLabel,
  children,
  footer,
  busy = false,
  dismissible = true,
  staysOnTop = false,
  maxWidth = '3xl',
  zIndexClassName: zIndexClassNameProp = 'z-[100]',
  className,
  scrollable,
  innerClassName,
  ...rest
}: DialogFrameProps) {
  const { t } = useTranslation();
  const zIndexClassName = staysOnTop ? 'z-[9999]' : zIndexClassNameProp;
  const insideStaysOnTop = useContext(InsideStaysOnTopContext);
  const stackKey = useSyncExternalStore(
    staysOnTop ? subscribeToDialogOpens : noSubscription,
    staysOnTop ? getDialogOpens : noOpens,
  );
  /** The tabbable the user last focused inside a `staysOnTop` frame, by position. */
  const lastFocusIndexRef = useRef<number | null>(null);
  const {
    header,
    title,
    description,
    icon,
    closePlacement = 'corner',
  } = rest as {
    header?: ReactNode;
    title?: ReactNode;
    description?: string;
    icon?: ReactNode;
    closePlacement?: 'corner' | 'bar';
  };
  // `!= null`, not `!== undefined`: `header={cond ? <X/> : null}` type-checks,
  // and taking the header branch on `null` would leave the dialog unnamed.
  const hasCustomHeader = header != null;

  const closeButton = dismissible && (
    <IconButton
      label={closeLabel ?? t('common.close_dialog')}
      variant="quiet"
      className={cn(
        // z-40 clears the z-20 that scrolling body content reaches.
        hasCustomHeader && 'absolute z-40',
        hasCustomHeader &&
          (closePlacement === 'bar'
            ? // Centred on a compact header row: a 44px target in a 56-65px bar
              // leaves ~8px above and below. Only the vertical inset moves —
              // the button is positioned against the surface, so the scroll
              // gutter of the region beneath it lies between the button and the
              // edge, and pulling it further out parks it on the scrollbar
              // (16px still clears a classic Firefox one).
              'top-2 right-4'
            : 'top-4 right-4 md:top-6 md:right-6'),
        !hasCustomHeader && '-mt-1 -mr-1',
      )}
      aria-disabled={busy || undefined}
      aria-busy={busy || undefined}
      onClick={() => {
        if (!busy) onOpenChange(false, 'close-button');
      }}
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </IconButton>
  );

  const overlayClassName = cn(
    'bg-background/60 data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 backdrop-blur-sm duration-200',
    zIndexClassName,
  );

  // Escape is always handled here rather than through the Root, so the dismissal
  // carries a reason instead of arriving anonymously. Radix registers this
  // handler once, so a plain closure would capture the mount-time
  // `busy`/`dismissible` and let Escape dismiss a dialog that has since become
  // busy (e.g. a delete in flight). Read the latest values off a ref so a
  // post-mount lock actually takes effect.
  // Open and still mounted: a consumer that unmounts the frame while open is closing it.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
    if (!open) lastFocusIndexRef.current = null;
  });
  useEffect(
    () => () => {
      openRef.current = false;
    },
    [],
  );
  const escapeStateRef = useRef({ busy, dismissible, onOpenChange });
  useEffect(() => {
    escapeStateRef.current = { busy, dismissible, onOpenChange };
  });
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    const state = escapeStateRef.current;
    if (state.dismissible && !state.busy) state.onOpenChange(false, 'escape');
  };

  /**
   * The control that had focus when this dialog opened. Radix restores through
   * a `Dialog.Trigger` this app never renders, so without this every dismissal
   * leaves focus on `<body>` — WCAG 2.4.3.
   * `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes Itself.
   */
  const openerRef = useRef<HTMLElement | null>(null);

  /**
   * The anchor, snapshotted when the dialog opens.
   *
   * ⚠️ The GETTER is snapshotted; it is still CALLED at close, so it still
   * answers only once the dialog's work has landed. What this defends against is
   * the prop vanishing: a caller that clears the state carrying its anchor as
   * part of closing — `MainLayoutOverlays` calls `resetAuth()` in `onClose` —
   * re-renders this frame with `restoreFocusTo` already `undefined` before the
   * close handler runs, so a live read finds nothing.
   * `layouts/main/__tests__/authModalFocusAnchor.test.tsx` reds without this.
   */
  const restoreFocusToRef = useRef(restoreFocusTo);

  /**
   * ⚠️ Captured from the EVENT: Radix dispatches it before moving focus, so the
   * opener is still active here — an ordering no effect can promise.
   * ⚠️ `<body>` is not an opener. `body.focus()` succeeds, which would satisfy
   * the restore with the outcome it exists to prevent.
   */
  const handleOpenAutoFocus = (event: Event) => {
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
    restoreFocusToRef.current = restoreFocusTo;
    // Counted once the content has mounted (Radix's Portal renders it a pass after
    // `open` flips) and, via the microtask, after this dialog takes focus. A frame
    // that stays on top does not count itself, or each remount would trigger the next.
    if (!staysOnTop && !insideStaysOnTop) queueMicrotask(noteDialogOpened);
    // A remount, not an open: put focus back where the user had it.
    const container = event.currentTarget;
    if (staysOnTop && lastFocusIndexRef.current !== null && container instanceof HTMLElement) {
      const previous = container.querySelectorAll<HTMLElement>(TABBABLE)[lastFocusIndexRef.current];
      if (focusIfPossible(previous)) {
        event.preventDefault();
        return;
      }
    }
    onOpenAutoFocus?.(event);
  };

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    if (!staysOnTop) return;
    const index = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(TABBABLE)).indexOf(
      event.target as HTMLElement,
    );
    if (index >= 0) lastFocusIndexRef.current = index;
  };

  /**
   * ⚠️ `preventDefault()` does not carry the restore — with no trigger Radix's
   * substitute is a no-op — and **no test can bind it**, since this frame owns
   * `Dialog.Root`. It is here so Radix cannot override the choice below.
   * ⚠️ Unconditional, unlike `useProposalFocusHandoff`'s keyboard-only handoff:
   * this returns focus where the user already was rather than moving it.
   */
  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    // A `staysOnTop` remount unmounts the old content while the dialog stays open;
    // Radix runs this a tick later, after the new content took focus (#9).
    if (openRef.current) return;
    const opener = openerRef.current;
    // ⚠️ No fallback to the live prop, and no clearing. Radix dispatches
    // open-autofocus on every mount — including a mount while already open — so
    // the snapshot is always written by the preceding open, and both were
    // measured unreachable: an instrumented throw on the fallback branch never
    // fired across 3,499 tests, and deleting either changed nothing.
    const anchor = restoreFocusToRef.current;
    openerRef.current = null;
    // The opener first whenever it can still act: a cancelled delete returns
    // the user to the button they pressed. `restoreFocusTo` is the fallback for
    // when it cannot, never an override.
    if (focusIfPossible(opener)) return;
    focusIfPossible(anchor?.());
  };

  const body = (
    <ModalContainer
      maxWidth={maxWidth}
      scrollable={scrollable}
      innerClassName={innerClassName}
      aria-busy={busy || undefined}
      className={cn(
        'data-[state=open]:animate-in data-[state=open]:fade-in fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 duration-200',
        zIndexClassName,
        className,
      )}
    >
      {hasCustomHeader ? (
        <>
          {/* First in the DOM so it keeps Radix's initial focus, as in the
              default shape; `absolute` keeps it visually over the header. */}
          {closeButton}
          {header}
          {children}
          {footer}
        </>
      ) : (
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogFrameTitle className="text-foreground flex items-center gap-2 text-lg font-bold sm:text-xl">
                {icon && (
                  <span className="text-primary-strong shrink-0" aria-hidden="true">
                    {icon}
                  </span>
                )}
                <span className="min-w-0">{title}</span>
              </DialogFrameTitle>
            </div>
            {closeButton}
          </div>

          {description && (
            <DialogFrameDescription className="text-muted-foreground -mt-2 mb-6 text-sm leading-relaxed">
              {description}
            </DialogFrameDescription>
          )}

          {children}

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      )}
    </ModalContainer>
  );

  // The alert-dialog primitive hardcodes outside-click dismissal off and does not
  // accept `onInteractOutside` — so that prop is omitted here, not passed with a
  // preventDefault. Everything else matches, focus capture and restore included:
  // alert-dialog forwards its content props to the same modal `Dialog.Content`.
  const tree =
    role === 'alertdialog' ? (
      <AlertDialog.Root key={stackKey} open={open} onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={overlayClassName} />
          <AlertDialog.Content
            asChild
            onOpenAutoFocus={handleOpenAutoFocus}
            onCloseAutoFocus={handleCloseAutoFocus}
            onFocusCapture={handleFocusCapture}
            onEscapeKeyDown={handleEscapeKeyDown}
          >
            {body}
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    ) : (
      <Dialog.Root key={stackKey} open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className={overlayClassName} />
          <Dialog.Content
            asChild
            onOpenAutoFocus={handleOpenAutoFocus}
            onCloseAutoFocus={handleCloseAutoFocus}
            onFocusCapture={handleFocusCapture}
            onEscapeKeyDown={handleEscapeKeyDown}
            onInteractOutside={(event) => event.preventDefault()}
          >
            {body}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );

  return (
    <DialogFrameRoleContext.Provider value={role}>
      <InsideStaysOnTopContext.Provider value={staysOnTop || insideStaysOnTop}>
        {tree}
      </InsideStaysOnTopContext.Provider>
    </DialogFrameRoleContext.Provider>
  );
}
