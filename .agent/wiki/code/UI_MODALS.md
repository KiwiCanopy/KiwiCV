# Modal & Dialog Patterns

> **Last Updated: 2026-10-26**

Split out of [UI_PATTERNS.md](UI_PATTERNS.md) on 2026-07-20 to keep both files
under the 300-line wiki limit.

## Modal System (`src/components/modals/`)

- **State Management**: Modals are controlled via `useUIStore` or specialized stores like `useConfirmStore`.
- **Responsive Height (80vh)**: On mobile devices, all modals MUST use the `ModalContainer` and full-page overlays should use `PageContainer` (with the `maxHeight` prop). Both utilize the `h-responsive` utility to enforce a `max-h-[80vh]` constraint on mobile (`90vh` on desktop) with internal scrolling. This ensures the UI doesn't consume the entire viewport and remains "overlay-like", preserving navigational context.
- **Use `DialogFrame`**: A standard dialog — title, optional description, body, optional
  action row — composes `DialogFrame` from `@/components/ui/DialogFrame`. It owns
  `Dialog.Root`, the portal, the overlay, `ModalContainer`, the title/description
  association, and the named close button, so a consumer imports nothing from
  `@radix-ui/react-dialog`. **ESLint blocks that import**; see the baseline note below.
- **Example**:
  ```tsx
  <DialogFrame
    open={isOpen}
    onOpenChange={setOpen}
    title={t('sync.gateway_title')}
    description={t('sync.gateway_desc')}
    busy={isLoading}
    maxWidth="xl"
    footer={<Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>}
  >
    {/* content */}
  </DialogFrame>
  ```
- **Do not pass `closeLabel`.** The frame defaults it to `common.close_dialog`.
  It used to be required, so all 23 consumers passed the same string and all 23
  passed the wrong one — `common.close_menu`, which told a screen-reader user the
  control closed something that was not on screen. Override it only to
  change the _resolver_, as `LanguageOnboardingModal` does with its own
  `translate` before a language has been chosen.
- **`common.close_menu` still exists, for the one control that really closes a
  menu** — the mobile navigation drawer in `layouts/sidebar/SidebarContent.tsx`.
  A toast is neither a dialog nor a menu and takes `common.dismiss_notification`.
  Three controls, three strings.
- **Centralized Dismissal Policy**:
  - **Backdrop Clicks**: ALWAYS blocked, to prevent accidental dismissal. `DialogFrame`
    hard-codes this; there is deliberately no per-dialog override.
  - **Escape Key**: Functional by default. `DialogFrame` blocks it while `busy` is true
    (an operation is in flight) or `dismissible` is false (the dialog is not closable by
    design, e.g. blocking legal consent). These are separate axes: `busy` also sets
    `aria-busy`, `dismissible` does not.
  - **Explicit Close**: Every modal must leave a visible way out — the frame's X button,
    or action buttons. While `busy`, the X stays mounted and focusable with
    `aria-disabled` rather than disappearing or going natively `disabled`, which would
    remove it from the accessibility tree.
- **Cmd/Ctrl+Enter presses the primary action from a text field.** Each dialog
  wires it itself — `DialogFrame` does not — through `isPrimaryActionChord` and
  `isTextEntry` (`src/utils/primaryActionChord.ts`), which refuse IME composition
  and key repeat. The export dialog presses its trigger button (`.click()`), so
  the button's disabled state is the only guard. From a link or a button the key
  keeps its native meaning: on a link it opens a new tab, and an export must not
  start instead. Plain Enter in a multi-field form stays inert; a single-input
  editor may commit on Enter (the tag editor's text input does).
- **Hand-rolled dialogs are gone**: `directClsxAndRawRadixDialog` in
  `eslint-legacy-baseline.js` is now `[]`. The last holdout, `src/layouts/Sidebar.tsx`,
  composes the shared `Sheet` primitive (`Sidebar.tsx:4,49`). Every Radix dialog
  now goes through `DialogFrame` or `Sheet`; nothing composes `Dialog.Content`
  directly. (`TagEditorDialog` is a `createPortal` overlay, not a Radix dialog.) If you add an exemption back, delete it in the same phase that adds it.
- **Scroll ownership**: by default the frame scrolls as a whole (`h-responsive` on
  the inner region). A dialog that pins a header over its own scrolling body passes
  `scrollable={false}` with an `innerClassName` establishing the flex column — the
  AI modal template does. Without it, the frame's region takes over and the header
  scrolls away.
- **Naming a custom header**: exactly one `DialogFrameTitle` per dialog; Radix
  allows no more. Where the visible heading is conditional or belongs to a
  component that also renders outside a dialog, attach the name sr-only instead
  (`ImportModal.tsx:126`, `AIModalTemplate`). **`GoogleAuthModal` no longer does**:
  it passes `header={<></>}` and lets `AuthView`'s own visible heading supply the
  name via `ownsDialogTitle` (`GoogleAuthModal.tsx:52-55`), because an sr-only copy
  duplicated a string `AuthView` already renders.
- **Migrate before splitting**: when a package both migrates an oversized dialog and
  modularizes it, do the legacy migration **first**, in place, and delete the baseline
  entry — then split. Baseline entries are exact paths, so extracting a child component
  out of an exempted file puts the legacy markup into a new, fully guarded path.
- **Z-Index Strategy**: Standardized hierarchy to prevent overlapping conflicts.
  Every `zIndexClassName` in `src/`, highest first — grep
  `zIndexClassName="z-\[`, plus `staysOnTop$` for the top row, to regenerate this list rather
  than editing a row by hand:
  - Blocking, must sit over everything: `LegalUpdateModal`, `LanguageOnboardingModal` —
    `staysOnTop`, which paints z-[9999] itself (no `zIndexClassName`)
  - Confirmations, raised over whatever they interrupt: `ConfirmModal` — z-[200]
  - Auth and backup pickers: `GoogleAuthModal`, `CloudBackupSelectorModal` — z-[150]
  - Sensitive / destructive: `DeleteAccountModal`, `ContactModal` — z-[120]
  - Import warnings (global): `GlobalImportWarningsModal` — z-[110]
  - Standard large: `VersionUpdateModal` — z-[100]
  - Secondary: `GitHubSyncModal`, `ImportWarningsModal`, `ProfileMissingModal` — z-[90]
  - Upsell over a flow: `InsufficientPremiumAccessModal`, `TranslationInviteModal` — z-[80]
  - In-flow: `ImportModal`, `AIModalTemplate` — z-[70]
  - Base / nested editors: `SyncGatewayModal`, `CloudSyncGatewayModal`, `PhotoEditor`, `image-cropper` — z-[60]
- **z-index is paint order, not the active layer.** Radix gives scroll lock, pointer
  events, focus and `aria-hidden` to the dialog opened _last_, whatever its z-index, so a
  dialog that opens on its own after a z-[9999] gate freezes it (measured in the browser,
  2026-10-26: `aria-hidden` on the gate, `pointer-events: none`, wheel prevented, focus
  moved). A blocking gate passes `staysOnTop` (`LegalUpdateModal`, `LanguageOnboardingModal`,
  #9), one prop for both facts — top paint layer and active layer — so they cannot disagree.
  `DialogFrame` counts every other dialog's open in `dialogStack.ts` and remounts the gate's
  Radix root on each, so it is last again; focus returns to the control the user had, but
  scroll position and any DOM state inside the content reset, so a gate keeps its state above
  the frame. A dialog in a gate's React tree (`DialogFrame` or `Sheet`) does not count, or it would
  remount its own host forever; one a gate opens through a store is not nested and would end
  up frozen under it. The later dialog gets its layer back when the gate closes. `Sheet` counts its opens
  too; a `Popover` with `modal` would not, so do not use one under a gate. No dialog needs to
  wait for consent to avoid the freeze; `VersionUpdateModal` still waits so What's New is not
  shown behind the gate.
- **Modular Modals**: Large modals (e.g., `GitHubSyncModal`) are modularized into sub-components for maintainability.
- **Unified Authentication (`AuthView`)**:
  - **Pattern**: Dual-pane "Marketing Benefits" (Left) + "Action Pane" (Right) layout.
  - **Self-Contained Logic**: Encapsulates legal checkbox states (`acceptedTerms`, `acceptedPrivacy`), submission flags, and the `googleSignin` handler.
  - **Variants**:
    - `page`: Full-page centered view (used in `/login`).
    - `modal`: Simplified view optimized for `ModalContainer` — used by
      `GoogleAuthModal.tsx:59` **and** `AccountPage/components/LoginState.tsx:19`.
    - `inline`: Frameless view for dashboard integration. **No production caller**;
      the only usage is `components/auth/__tests__/AuthView.test.tsx:14`. Treat it as
      a supported-but-unused variant, not as "the one `LoginState` uses".
  - **Rule**: Never duplicate auth checkboxes or Google button logic. Always use `AuthView`.

## `ai/template/` is a leaf

`components/modals/ai/template/` holds the presentational pieces that `edit/`,
`import/` and the composer band assemble. A piece's props contract lives in
`template/` with it — `coverLetterControlTypes.ts` for the cover-letter control,
`statusTypes.ts` for the status view — and `edit/` imports from there, never the
reverse: one back-edge closed `AIConfigView → AICoverLetterControl →
CoverLetterStyleField`.

`template/__tests__/templateIsALeaf.test.ts` checks the non-test files in
`template/` for two things, resolving both the `@/` and the relative spelling: no
direct import into `components/modals/ai/` outside `template/`, and no chain of
app imports, through any directory, that leads back into `template/` — it names
the chain when one does.

## `AIStatusView`: one shared view, one-call and two-call runs

The AI modals share one status view, which has a second shape without
giving `AIImportModal` a step counter. Three optional props carry it — `runStage`,
`coverLetterOutcome`, `onCoverLetterRetry` — and a caller that passes none of
them gets exactly the one-call behaviour.

⚠️ **One shared view, three files.** Splitting it **per modal** stays rejected —
that is the property the two-call shape was asked to preserve and the file split kept.
`AIStatusView` is the router; `AIStatusProcessing` holds the processing branch
and `AIStatusOutcomeCards` the success branch's cards, both in `template/`.
`coverLetterPresentation` in `statusTypes.ts` is the single exhaustive read of
`CoverLetterOutcome['status']` — the failure is a sentence and the success a
card, in different files, so a new member fails the build there. The
contrast and 1.4.11 rulings below are pinned as comments beside the markup they
constrain, which puts them in the leaves rather than in `AIStatusView.tsx`.

- **The heading carries the stage**, because the `h3` is the only text inside the
  `role="status"` region and is therefore what gets announced. It changes once
  per real state change; the rotating phase line below it stays `aria-hidden`
  flavour and is deliberately not part of the announcement.
- ⚠️ **The seven phase dots are dropped in the two-step run, never repurposed.**
  Measured on the live panel: `bg-primary` over `bg-border` on `bg-muted/30` is
  **1.75:1 and 1.43:1** in light. That is tolerable while they are decorative and
  `aria-hidden` — the moment they carry _which call is running_ they are
  meaningful non-text content and **1.4.11's 3:1 binds**, which they fail by a
  wide margin. A single-call run keeps them: two indicators of different things
  in one 300px column is worse than one.
- **The completed step is text in `--success`** (measured **5.97:1 / 7.91:1** on
  that panel), not a marker glyph in `bg-primary`. Text is also what keeps the
  step readable with motion disabled; `motion-reduce` already covers the spinner.
- **No percentage bar.** Call 2 sends roughly half the payload and runs 2–7 s
  against call 1's 7–39 s, so the two steps are not equal length and a bar would
  be inventing a number. The file's own older comment already refused a
  percentage for the single-call run, for the same reason.

⚠️ **A letter failure is a line in the success panel, not a third outcome card.**
The outcome cards are not announced, and `StatePanel` announces only its title
and a **string** description — so a card would leave a screen-reader user with
"Optimized! Your content has been successfully improved." on a run whose letter
failed. The failure sentence replaces the success description and the retry goes
in `StatePanel`'s `action` slot; the panel keeps `variant="success"` and its
title, because the tailoring is what the user came for and it is applied. A third
card would also have orphaned the `grid-cols-1 sm:grid-cols-2` layout, which is
why the letter's SUCCESS card takes `sm:col-span-2` and its own full-width row.

⚠️ **The two failure sentences are not one string with a clause.** A two-call run
spent one of the day's requests on the CV; a letter-only re-run tailored nothing
and spent nothing, because a failed letter is never billed — so
`cover_letter_failed`'s "only one of today's requests was used" is simply false
on the retry path, which is reachable the moment "Try the letter again" fails.
`cover_letter_failed_retry` is the second one, chosen off `runStage.twoStep`.

**The retry button names the letter.** `ai.status.cover_letter_retry`, not
`common.retry` — the error branch's own retry uses the generic word, and a screen
reader listing buttons would otherwise offer the same "Retry" for two runs, one
of which re-tailors the entire CV.

**A retry the allowance refuses must not reset `status`.** The retry is offered
from the success panel, and `AIEditModal` renders that panel only while
`status !== 'idle'` — so the paywall path's `setStatus('idle')` would unmount it,
and dismissing the paywall would drop the user on the config form with the
outcome and the retry gone. The error branch's retry is the case that reset was
written for.

**The retry is its own argument-less function.** `handleGenerate` and
`handleCoverLetterRetry` both come off `useAIRunner`, rather than one function
taking `{ coverLetterOnly }`. Both are wired to click handlers, and a handler is
called with a `MouseEvent` — an options object would be silently replaced by the
event, and "Try again" would spend a second full tailoring run instead of
re-running the letter alone.

---

## 🖼️ Modal Architecture

> These notes describe `ModalContainer`, the layer **beneath** `DialogFrame`. New
> dialogs compose `DialogFrame` and never touch `Dialog.Content` directly. Since
> the last hand-rolled dialog was migrated, this section describes only the
> frame's own internals — there is no legacy modal left for it to govern.

To maintain a premium, consistent feel across the app, follow these rules for all dialogs and popups:

### 1. The `ModalContainer` Shell

Always wrap modal content in the `@/components/ui/ModalContainer`. This enforces:

- **Responsive Sizing**: Automatically handles `max-w` and mobile width (`92vw`).
- **Standard Aesthetics**: Applies project-wide rounding
  (`rounded-[var(--radius-feature)]`, which is **1.5rem** — `tokens.css:89`) and depth
  (`shadow-2xl`). `ModalContainer.tsx:33`.
- **Vertical Balance**: Use `max-h-[80vh]` or `max-h-[90vh]` on the `innerClassName` to ensure the modal doesn't touch screen edges.

### 2. Centering & Positioning

Standard positioning for `Radix Dialog` content:

- Use `asChild` on `<Dialog.Content>` to keep the DOM flat.
- Apply centering classes directly to the `ModalContainer`:
  `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`

### 3. Sizing Standards

- **Standard Modals**: `maxWidth="3xl"` (Default).
- **Focused / AI Modals**: `maxWidth="xl"`.
- **Large Flows**: `maxWidth="4xl"` — the largest bounded value. The union is
  `sm | md | lg | xl | 2xl | 3xl | 4xl | none` on both `DialogFrame.tsx:58` and
  `ModalContainer.tsx:7`; **`5xl` does not exist** and would not type-check. Use
  `none` when the content sets its own width.

---
