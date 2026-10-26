# UI Patterns & Components

> **Last Updated: 2026-10-13** (a custom section heading proposal is reviewed at its title; one rule for all four AI character counters; a pending AI proposal locks the fields it covers)

## Contents

- [Overview](#overview)
- [Landing Page Design System (`src/pages/LandingPage/components/`)](#landing-page-design-system-srcpageslandingpagecomponents)
- [Product-Chrome Lint Guards](#product-chrome-lint-guards)
- [Reusable Primitives (`src/components/ui/`)](#reusable-primitives-srccomponentsui)
- [Modular Editor Pattern](#modular-editor-pattern)
  - [Locked fields while an AI proposal is pending](#locked-fields-while-an-ai-proposal-is-pending)
- [Editor Section Rail (2026-08-09)](#editor-section-rail-2026-08-09)
- [Pane-Relative Breakpoint System](#pane-relative-breakpoint-system)
- [New Form Checklist](#new-form-checklist)
- [Modal System](#modal-system)
- [Styling & Animations](#styling-animations)
- [Layout Components (`src/layouts/`)](#layout-components-srclayouts)
- [AI Reorganization Pattern](#ai-reorganization-pattern)
- [One AI Control Per Section, Branching in the Handler](#one-ai-control-per-section-branching-in-the-handler)
- [Focus Handoff When a Control Removes Itself](#focus-handoff-when-a-control-removes-itself)
- [Installing the App](#installing-the-app)
- [Mobile Adaptation Patterns](#mobile-adaptation-patterns)
- [Scrollbar Utilities](#scrollbar-utilities)
- [Overflow & Dropdowns](#overflow-dropdowns)
- [Performance-Optimized Drag & Drop](#performance-optimized-drag-drop)
- [Dashboard Layout Architecture](#dashboard-layout-architecture)
- [Form Field Alignment](#form-field-alignment)
- [📐 Layout Safety Zones](#layout-safety-zones)
- [Mobile-Specific Form UX](#mobile-specific-form-ux)
- [Field Layout Indicators](#field-layout-indicators)

## Overview

KiwiCV follows a modular UI architecture using **TailwindCSS v4**, **Lucide React**, and custom reusable primitives. The project is split into two main visual domains: the **Marketing Landing Page** and the **Modular Editor Dashboard**.

## Landing Page Design System (`src/pages/LandingPage/components/`)

To ensure a premium, consistent marketing experience, all landing page sections must follow these patterns:

### 1. The `LandingSection` Wrapper

Every major section (Hero, Features, Problems, etc.) MUST be wrapped in the `LandingSection` component.

- **Vertical Rhythm**: Enforces uniform padding (`px-5 py-16 sm:px-8 sm:py-24` — `LandingSection.tsx:28`).
- **Dividers**: Automatically applies a bottom border (`border-b`) to create clear separation between modules.
- **Container**: Defaults to `max-w-6xl` (`LandingSection.tsx:33`); override with `containerClassName` (e.g. `max-w-7xl`) for wide graphics.

### 2. CTAs and Analytics Sources

`LandingCTA` was **deleted on 2026-07-21** along with nineteen other unreachable
landing files; the live Hero and FAQ CTAs are plain `Button`s. `CTASource` in
`useLandingActions.ts` is now just `'hero' | 'closing_cta'` — the two sections
that can send a visitor into the editor. Add a member only when a section
actually calls `goToEditor`.

The live page is `Hero → Workflow → Proof → Privacy → Pricing → FAQ`. A
`ui-designer` review on 2026-07-21 confirmed that order and found no gap worth
adding a section for.

### 3. Testimonials: a pull quote beside its claim, never a section

`testimonials/TestimonialQuote.tsx` places one attributed quote **next to the
claim it supports** — `pricing` after the Pass plans, `privacy` in the privacy
card. A "Testimonials" section holding one entry reads worse than none. Every
published entry for a claim is in play: the placement opens on a random one per
visit and shows previous/next buttons with a "2 / 3" counter only once a claim
has more than one (owner, 2026-10-12). No auto-advance — it would move beside the
Buy buttons and need a pause control. Adding an entry is a Sanity edit, not a
layout change; revisit a dedicated customers' voice section once there are many.

- **Content lives only in Sanity** (`testimonial` documents), so withdrawing
  consent never needs a commit: no name, quote or photo is ever committed, not
  even in a test (tests use invented people). ⚠️ Deleting the document alone does
  **not** remove the person. The photo is a separate `sanity.imageAsset`, and its
  full-size original stays public at its bare CDN URL. On withdrawal: delete the
  document, delete the image asset in Studio's media, then confirm the bare asset
  URL returns 404 once the CDN cache expires.
- ⚠️ **`published: false` hides nothing.** The dataset is public, so any non-draft
  document is readable through the API whatever the flag says. Stage a future
  testimonial as a draft, not as an unpublished document.
- **The quote is never altered**: not translated, not trimmed, no punctuation
  added. The only quotation mark is a decorative oversized `“` behind the first
  words; the stored text is never edited to carry one. `lang="en"` marks the text
  for screen readers in every locale, and only the chrome around it is localized.
- **Below the plans, never above.** The quote arrives late, and above the cards
  its arrival would push every price and Buy button down — the same reason the
  promise strip sits after the plans.
- **Fetched on approach, not on load.** `useNearViewport` (`src/hooks/`) roots
  the observer on the nearest scrolling ancestor, because the app shell scrolls
  `<main>`, not the window, and a viewport-rooted margin cannot reach past that
  clip. ⚠️ Any "N px ahead" observer under `MainLayout` goes through that hook —
  a bare `IntersectionObserver` with a `rootMargin` silently fires only on sight
  (the blog's `OptimizedMedia` did). A component whose state belongs to
  one input is keyed on it **at the call site** (`<OptimizedMedia key={src}>`),
  so its hooks and state remount together; a key on its own root remounts only
  the DOM. The hook does follow its ref to a new node as a backstop, but a
  passive effect still sees the old node's value for one commit. The
  Sanity client is
  imported dynamically for the same reason: a visitor who never scrolls there
  downloads neither the client nor any data. Deferred, not consent-gated: a tall
  viewport or a `#pricing` deep link fires it on the first frame.
- **Fails silent.** Unreachable, unconfigured (a fork with no
  `VITE_SANITY_PROJECT_ID`), slow (8 s), empty or incomplete renders nothing: no
  placeholder, no spinner, no console error.
- Local development needs `netlify dev` — see the Sanity CORS note in
  [ops/DEPLOYMENT.md](../ops/DEPLOYMENT.md).

### 4. Import Aliasing

**Mandatory**: Use the `@/` module alias for all imports within the landing page directory.

- **Correct**: `import { LandingSection } from '@/pages/LandingPage/components/LandingSection';`
- **Incorrect**: `import { LandingSection } from '../components/LandingSection';`

> [!IMPORTANT]
> The banned imports, the `--input` vs `--border` split and the eight required
> states are in `.claude/rules/ui.md`, which loads on any edit under
> `src/components/`. The table below stays because it is the full list with its
> replacements; the rule carries the part you must not get wrong.

## Product-Chrome Lint Guards

`eslint.config.js` fails the build on five legacy paths, because Phases 7.2–7.5
repeatedly drifted back onto them when nothing enforced the new one:

| Banned                                                                                           | Use instead                                                                                    |
| :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `btn-3d-*` / `badge-primary-3d` class strings                                                    | `Button`, `IconButton`, or token surfaces                                                      |
| `@radix-ui/react-dialog`                                                                         | `DialogFrame`                                                                                  |
| `@radix-ui/react-alert-dialog`                                                                   | `ConfirmModal`                                                                                 |
| `AlertCircle`, `AlertTriangle`, `CheckCircle2`, `CircleHelp`, `HelpCircle`, `Loader2`, `XCircle` | `CircleAlert`, `TriangleAlert`, `CircleCheck`, `CircleQuestionMark`, `LoaderCircle`, `CircleX` |
| `clsx`                                                                                           | `cn` from `@/utils/cn`                                                                         |
| `Wand2`, `WandSparkles`                                                                          | `Sparkles` for AI; `Gift` for a bonus badge                                                    |

The wand ban is semantic, not a deprecated alias: the app used `Wand2` and
`FilePenLine` interchangeably for "AI", so changelog copy reading "look for the
{wardsymbol} in the app" rendered a wand while the editor showed a pencil. **AI
is `Sparkles` in `primary`** — triggers and states alike: the composer, section
and entry Improve, the rail's proposal pill, the pending bar, the diff headers,
`AISuggestButton`, the AI modal headers, and `renderWithIcons`'s `{wardsymbol}`.
`FilePenLine` keeps its non-AI uses (the editor's "create a CV" action).

⚠️ `WandSparkles` is banned **by name** alongside `Wand2` because it _is_ `Wand2`,
renamed upstream: `importNames` matches a spelling, not an export identity, so
banning only the old name lets the same glyph back in under the new one.

Amber is reserved for warning and paid/premium — the AI trigger must not borrow
it, because the paywall a visitor hits right after pressing that trigger is
amber.

⚠️ **Lime belongs to the AI run, not to Export** (owner, 2026-10-24, #27). The
header's Export button is ink (`bg-foreground text-background`), because a lime
Export stacked one row above the lime Improve button was pressed for it. A new
primary action placed near the composer must not take lime either.

Files that predate the guards are frozen in `eslint-legacy-baseline.js`. **Those
lists only shrink** — delete a file's entry in the same commit that migrates it.
`tests/lint/legacy-baseline.test.mjs` fails if an entry is stale, so a migrated
file cannot silently keep its exemption. `legacyControlClasses` reached `[]` and
`src/styles/legacy-controls.css` **has been deleted** — `src/styles/` now holds only
`animations.css`, `tokens.css`, and `utilities.css`.

`tests/lint/primitive-consumers.test.mjs` fails when a `src/components/ui/`
primitive has no production consumer and is not on its known-unused list. Phase
7.5b prioritised work from consumer counts that were wrong by a factor of fifty;
this makes the count checkable rather than asserted.

## Reusable Primitives (`src/components/ui/`)

- **Button / IconButton**: Named, 44 px actions (36 px only in a narrow stacked Design section row). **Two disablement modes:**
  plain `disabled` uses the native attribute; `disabledReason` or `loading` switch to
  `aria-disabled`, because a natively disabled button leaves the accessibility tree and
  takes its `aria-describedby`, `aria-busy`, and loading label with it. Activation is
  refused either way. `DialogFrame` follows the same rule for its busy close button.
  `disabledReasonDisplay` picks where the reason shows: `inline` (default) prints it
  under the button; `tooltip` puts it in the shared refusal tooltip and takes no room,
  for a control inside a one-line row.
  **`secondary` hovers one step away from rest and never fades toward the surface** (2026-10-26): it
  rests on `--secondary`, hovers to `--mist`, presses to `--border`. The old
  `hover:bg-secondary/80` alpha-blended into the surface and measured 1.02:1 against
  rest in light, 1.01:1 in dark — no visible hover. A disabled or `aria-disabled` button
  pins hover and press to its rest fill (`inertFillClasses`), since a now-visible hover on
  a refused control reads as live. `CloudSaveButton` hand-copies the variant and follows
  it. Colour only: no shadow, glow or ring on hover, since rings mean focus.
- **List rows and pinned rows share one surface.** Rest `bg-card` (a `VersionRow` takes it
  from `VersionTable`), hover `bg-secondary/50` — My CVs' rows and the pinned `resume.json` card
  (`LatestBackupSection`) alike. A resting fill on the pinned card read as permanently
  hovered; its label, border and position carry the pin. Do not step the row hover up to
  full `--secondary`: a `secondary` button on it would sit at 1.00:1 and vanish.
- **Input / TextArea**: Associated form controls sharing error and help semantics.
  `Input`'s `warning` is announced through a polite `role="status"` region, opt-in like a
  lock: pass `warning={null}` on a field that can warn so the region exists before its text
  (#62). ⚠️ `warning={bad ? msg : undefined}` compiles, shows the warning and silently opts
  out of the announcement; write `: null`. A warning shown on blur has lost focus, so
  `aria-describedby` alone never reads it. `aria-invalid` stays error-only — a warning does
  not block. `Field`'s `warning` has the same gap and no consumer yet (#77); the error half
  is #76.
- **Field**: Label plus `description`/`warning`/`error`/`required` around a control supplied
  through a render prop. It composes `FieldLabel`, so it carries help affordances too. It has
  **no production consumer yet** — 7.6 adopts it. It renders its own `<label>`, so a consumer
  must **not** also pass `label` to the `Input`/`Select`/`TextArea` inside it; that produces two
  labels and a concatenated name. Nothing enforces this yet.
- **FieldLabel**: The label row for a form control. **Never put a button inside `<label>`** —
  `InfoBox` and `MainColumnBadge` both render one, a click on it activates the labelled
  control, and the trigger's accessible name leaks into the control's own. `FieldLabel` renders
  the label and those triggers as siblings. `Input`, `TextArea`, `Select`, `TagField`, and
  `Field` compose it; `ExportOption` follows the same rule with its own shape. `className`
  styles the row and the label inherits from it, so **only inheritable properties reach the
  label** — `truncate`, `block`, and `max-w-*` need `labelClassName`.
- **Accordion**: Editor item shell with named drag and non-drag order controls.
- **CharCounter**: The `n / limit` counter under every AI free-text field — the job ad and
  custom instructions in the AI modal, the composer field, and the cover-letter writing sample.
  **One rule at all four** (owner, 2026-10-12): it owns the zones (`charCapZone` in
  `src/utils/charCapZone.ts`: `near` from 90% of the cap, `full` at it), their three colours —
  `--warning` at `near`, red only at `full`, where typing is actually dropped (weight alone at
  10px was tried for `near` and rejected: bold `--muted-foreground` does not read as a change of
  state) — the `sr-only` sentence (`ai.chars_used`; the visual count is hidden from AT), and a
  polite live region. ⚠️ Every number it shows or speaks is formatted for the **UI language**
  (`Intl.NumberFormat(language)` from `useTranslation`), never with a bare `toLocaleString()`:
  that takes the browser's locale, and a German UI on an en-US browser then says "5,000", a
  decimal in German.
  **Wiring:** `const cap = useCharCapNotice(value.length, limit)` (`src/components/ui/useCharCapNotice.ts`);
  the counter takes `{...cap.counter}` plus `className` for size and placement; the field takes
  `onChange` through `cap.track(onChange)` and `aria-describedby={cap.counter.id}`.
  ⚠️ **What the types enforce, and what they do not.** `CharCounter` requires `id`, `length`,
  `limit` and `notice`, so its props come from one hook call and cannot carry a limit the
  announcer did not use. Skipping `track` or `aria-describedby` still compiles: the counter
  then never speaks, or is not in the field's description. `CharCounter.test.tsx` catches both
  at the four sites in its `SITES` table, so a fifth site needs a row there.
  ⚠️ **The notice speaks only when an edit through `track` moves the zone** — never per
  keystroke, never at mount (arriving with a stored 4,900-character sample is not an event),
  and never when the value changes from outside: the composer is one field whose value swaps
  with its mode, and Clear writes through `onClear`. The hook follows such a change silently.
  A region re-read on every character is worse than silence, which is why it is not simply the
  counter's own text. It is needed at all because `maxLength` drops further keystrokes with no
  feedback (WCAG 4.1.3).
  ⚠️ The live region is the counter's **sibling, never inside it**: every field lists the
  counter in its `aria-describedby`, and a status inside would replay on every focus. The
  notice copy (`ai.char_limit_near`, `ai.char_limit_reached`) says "this field" and names none,
  since all four share it. Never hand-write a counter beside it. The test also fails on the old
  `x.toLocaleString() / y.toLocaleString()` spelling — not on every spelling
  (`{value.length}/{max}` passes), so review is the guard there.
- **Section**: A ~90-line variant dispatcher over `src/components/ui/section/`. It resolves
  the disclosure wiring, the icon fallback and AI eligibility once, then renders
  `SectionDefault`, `SectionNested` or `SectionPage`; all three share
  `SectionHeaderActions`, so the Improve button and the entry-count badge cannot exist in
  one look and be missing from another. `page` is the editor rail's variant — no card
  chrome, no disclosure (it is the only section on screen, so collapsing it would strand
  the user), and it supplies the pane's heading. `default`/`nested` still serve Extras and
  the legal pages. ⚠️ The subdirectory is invisible to
  `tests/lint/primitive-consumers.test.mjs`, which lists only top-level files.
- **SectionGroup**: **Deleted 2026-08-09.** The editor's five collapsible groups
  became the persistent section rail (`features/dashboard/editor/rail/`); the group
  _headings_ survive as `editor.supersections.*`, which the rail reuses and
  `labelKeyForWarningSection` still returns. `SectionGroupContext` went with it — its four
  hook consumers (`useArrayForm`, `useSkillsForm`, `useBasicsForm`, `useLanguageForm`) each
  carried a "the group collapsed, so collapse me too" render-phase sync that had no
  provider left to hear from.
- **Disclosure**: Shared progressive-disclosure seam.
- **StatePanel**: Loading/empty/error/warning/success/disabled states. Announces through
  an `sr-only` live region filled after mount — a region mounted already populated is not
  announced. `announce` defaults per variant: loading, error, warning, and success speak;
  `empty` and `disabled` are resting states and stay silent. The description is announced
  with the title, so put the specific information there.
- **InfoBox**: Contextual help trigger. **Pass `label`** whenever the children carry a
  visible or `sr-only` name — the default generic name would override it and break WCAG
  2.5.3. The trigger no longer suppresses its own click: `preventDefault`/`stopPropagation`
  were removed on 2026-07-20 once every consumer rendered it as a sibling. **Never nest it
  in a `<label>`, an `<a>`, or a `<button>`** — put it beside one, as `FieldLabel` does.
  Nesting now _fires_ the ancestor's action rather than swallowing it, which in a clickable
  card (`OptionCard`, `InfoCard`, the `PricingDialog` purchase cards) means a stray click
  starts the ancestor's workflow. A dev-only check in `InfoBox` logs the offending ancestor.
  An `interactive` InfoBox renders a `group`, named by its trigger (`aria-labelledby`).
  Escape hands focus back to the trigger only when it was inside the tooltip, and that
  hand-back does not reopen it; a hover-opened tooltip just closes, leaving focus alone.
  ⚠️ **The surface is portalled to the end of `body`, so native Tab order skips it**.
  `InfoBox` bridges it by hand while an interactive tooltip is open: Tab or ArrowDown on the
  trigger enters the first control inside, Shift+Tab from that control (or from the surface
  itself, focused by a click on its text) returns to the trigger, and Tab past the last one
  closes the tooltip and focuses the control after the trigger (`nextTabbableAfter` in
  `utils/focus.ts`, scoped to the trigger's dialog and blind to `aria-hidden`). It is not a
  focus trap — every exit leads back into page order.
  ⚠️ **Inside a modal it portals into the dialog, not `body`** — measured 2026-10-13 in the
  export dialog: Radix's focus scope bounced focus that entered a `body`-portalled surface
  straight back to the trigger. The handled Tab is also `stopPropagation`'d, or the scope
  reads the moved focus as its last stop and wraps to the close button.
  Both variants are hoverable and persistent (WCAG 1.4.13): leaving the trigger or the
  surface starts the 150 ms grace in `useHoverGrace`, which the Improve refusal tooltip
  shares, entering the surface cancels it, and the grace never hides a tooltip while focus
  is on the trigger or inside it. A non-interactive surface stays mounted (`invisible`)
  while closed so `aria-describedby` resolves on first focus; a `group` mounts only while open.
- **FloatingTooltip**: The floating half of every portalled tooltip — `InfoBox`, and
  every refusal tooltip through `useRefusalTooltip`. Takes an `anchorRef` and an `open` flag rather than
  owning a trigger, so any control can point `aria-describedby` at it. Escape closes it
  without closing an enclosing dialog (window capture, before Radix's handler). An optional
  `container` replaces `body`; placement then subtracts that container's origin (a
  transformed dialog is a `fixed` element's containing block) and clamps inside it.
- **DialogFrame**: The dialog seam. Owns `Dialog.Root`, the overlay, `ModalContainer`, the
  named close button, and the `busy` / `dismissible` dismissal contract. See Modal System.
- **OptionCard**: Flat bordered choice card (AI actions, import choice, sync gateway). One
  look, no variants — it was taken off `legacy-controls.css` on 2026-07-20.
- **SegmentedToggle**: High-end toggle component for layout switching.
- **ModalContainer**: Standardized responsive container for modals (75vh mobile height).
- **PageContainer**: Main layout container with optional responsive height constraints.
- **AISuggestButton**: Specialized button for triggering Vertex AI improvements.
- **InfoCard**: Premium 3D card used for trust badges and feature highlights with interactive tooltips.
- **DatePicker**: Progressive date picker (Year -> Month -> Day) supporting variable precision and custom sizing via `className`. ⚠️ **The day grid shows only the displayed month** — see below.
- **ResizableDivider**: Draggable vertical divider for dashboard layout with 480px min-width constraints (self-healing), custom dragging overlays, and direct DOM manipulation for performance.

### The date grid shows one month, and why it is not "shown but disabled"

⚠️ **`showOutsideDays={false}`, and do not "improve" it to a `disabled` matcher.**

Neighbouring-month cells used to be rendered and **clickable**. With January 2019
displayed, one click on the faint `31` wrote `2018-12-31` — it moved the month
_and_ the year at once, out of the view the user had navigated to, in a picker
that asked for the month one step earlier. They were also the least visible cells
in the grid doing it: measured **3.03:1** against the popover in dark, against
**12.38:1** for a real day.

⚠️ **Disabling them instead was tried and reverted.** `react-day-picker`'s
`getNextFocus` re-evaluates the `disabled` matcher on each candidate date and
recurses past it, so "every day outside the shown month is disabled" dead-ends
arrow keys, `Home` and `PageUp`/`PageDown` at **every** boundary — it walks 365
candidates, finds them all disabled, and never moves focus. Any week spanning a
boundary is affected, not only month ends. That is **WCAG 2.1.1, Level A**, and it
lands on precisely the keyboard users the click fix was written for. Pinned by
`outsideDaysNotSelectable.test.tsx`, whose second case fails if the matcher comes
back.

The orientation those cells carried is the real cost of hiding them, and it is
the cheaper loss: the month chevrons remain, and arrow keys still cross the
boundary on their own.

**A disabled day must not light up on hover.** `day_button` carries
`hover:bg-accent` and needs `disabled:pointer-events-none` beside it, or a cell
that cannot be clicked still fills under the cursor. ⚠️ With outside days hidden
and no call site passing bounds (see below), **nothing in the app renders a
disabled day today** — the guard is defensive, and goes live the moment one does.
⚠️ It compiles to the
CSS `:disabled` pseudo-class, which does **not** match `aria-disabled` — moving
the grid to `aria-disabled` would silently reopen it.

### Start and end dates are deliberately unconstrained

⚠️ **No field config passes `min`/`max`, and nothing validates that an end date
follows its start** (owner, 2026-09-06). That is a decision, not a gap — it reads
as an oversight, which is why it is written down.

Enforcing it is not a prop. `ArrayForm` renders from a `FieldConfig` list where
each field is described independently, so an ordering rule needs a config that can
read **another field's live value** — a new capability, repeated across work,
education, projects, publications, awards, certificates and volunteering. It also
needs an ordering over **mixed precisions** (is `2019` before `2019-03`?), a
carve-out for the `''` that means "present", and a position on imported JSON that
violates it.

Against that: both dates sit in the same panel, only the user knows which is
right, and a wrong-but-plausible year passes an ordering check anyway — so the
rule would catch only the errors that are already obvious.

## Modular Editor Pattern

Complex editor sections are decomposed into a standardized set of files:

- `useX.ts`: Custom hook managing state, DnD logic, and store synchronization.
- `types.ts`: Interface definitions for the specific section.
- `XItem.tsx`: Focused sub-component for the item "shell" (Accordion, Delete, Visibility).
- `XField.tsx`: Focused sub-component for the item "guts" (Actual inputs).
- **AI Behavior**: fields render **plain controls**. An AI proposal is shown by
  `EntryDiffPanel` in the entry's `belowHeader` slot, not inside the field — the
  per-field comparison (`useAISuggestion`, `aiSuggestion` props on
  `Input`/`TextArea`/`TagField`/`Select`, `AISuggestionActions`) was **deleted on
  2026-08-09**. It could only ever show one field at a time, and only while the
  entry was expanded, so a collapsed entry with four rewritten fields looked
  untouched. The panel reads `ai.suggestions[target]` and needs a `fieldLabels`
  map from the item shell; each field the AI can propose also takes
  `lock` from `useLockedFields(target)` — see below.
- **Collection Sync**: Array-based forms must use the `useLocalCollectionSync(items, activeId)` hook to manage local state and store synchronization safely.
- **Ordering**: Keep drag-and-drop as an enhancement and provide visible, named Move up/Move down controls. Disable boundary actions without removing them, and preserve `_id`/`_vId` while reordering.
- **Examples**: `ArrayForm`, `ProfileList`, `SkillsForm`, `LanguageForm`.

### Locked fields while an AI proposal is pending

The proposal is applied on arrival, so a field it covers holds the AI's text in
two places: the panel and the form. **Exactly the fields the proposal names are
locked** until the user picks a version in the panel; the rest of the entry stays
editable, and a decision unlocks in place (no remount, focus stays put).

- **Where the lock lives.** A `FieldLock` (`components/ui/fieldLock.ts`) passed as
  `lock` to `Input`, `TextArea`, `Select`, `DatePicker` and `TagField` (and
  `CoverLetterParagraphs`). Call `useLockedFields<Entry>(target)` **once per entry**
  and pass the returned function down — `const lockFor = useLockedFields<Skill>(aiTarget)`,
  then `lock={lockFor('level')}`; the field argument is typed `keyof Entry`. It returns a
  `FieldLock` for a pending field, `null` for an editable field of an AI-editable entry,
  and `undefined` for an entry AI cannot touch. It reads `pendingFields(suggestion)`,
  the same list `useEntryDiff` turns into rows. Give `EntryDiffPanel` the same entry
  type — `EntryDiffPanel<Entry>`, or `satisfies DiffFieldLabels<Entry>` on a memoised
  map — so a misspelled label key fails `tsc -b`. An object-shaped target (`item:basics`, a
  custom section's heading `item:custom:<uuid>`) has no accordion header, so its panel sits
  directly above the fields it locks. Inside the
  primitive, because `Input`/`TextArea` buffer keystrokes locally: a call site that
  refuses `onChange` still shows the typing and commits it on blur.
- **What it does.** Native `readOnly` plus `aria-disabled`, never `disabled` — the
  field stays focusable and keeps its description. `trimOnBlur` is not attached, since
  a trim would make "Keep mine" read the proposal as a later edit. A `<select>` has no
  `readOnly`, so it refuses the change, the press, and the keys that open or step it
  (Enter, Space, arrows, Home/End, PageUp/PageDown, type-ahead); Tab, Escape and any
  Ctrl/Meta chord pass through.
- **Text typed before the lock arrived.** It neither lands on the proposal nor
  vanishes: on blur (or Enter in a list's add field, or Save in an edit dialog that was
  open when the proposal landed) the primitive hands it to `lock.keepTyped`, which
  calls `keepTypedAsMine` and makes it `originalValue[field]`. "Keep mine" then
  restores what the user typed. The field stays locked and the live value stays the
  proposal. A buffer counts as typed only when it matches neither the proposal nor
  `lock.mine` (`isTypedBeforeLock`): a field that merely had focus when the proposal
  landed still holds the user's side and must not overwrite it. By the same test,
  typing that happens to equal the proposal is not kept. Basics wraps the lock
  in `trimOnKeep`, so kept text is trimmed as a blur would have.
- **The edit dialog belongs to `TagField`,** not the entry, so it survives the list
  being replaced. Any outside write regenerates entry ids while it is open, so Save
  finds its entry by id, then by the text it opened on (the match nearest its old
  position, for duplicates), else appends. A Save with unchanged text writes nothing,
  so it cannot bring back an entry an outside write removed.
- **What it says.** "Choose a version above to edit this field." (`ai.diff_field_locked`)
  between the label and the control, `text-xs` muted, linked by `aria-describedby`
  (`LockedReason`). With two of six fields locked only those two carry it, so the line
  itself shows what the proposal covers. A lock that arrives on the focused field is
  also announced through a polite live region, since a description that appears under
  the caret is never read. The region is opt-in: it mounts for `lock={null}` (lockable,
  so it exists before it fills — a region mounted already populated is not announced)
  and not for `undefined`, so controls outside the AI editor carry no empty status
  region.
- **How it looks.** `LOCKED_CONTROL_CLASS`: `bg-muted` fill with normal text,
  `border-input` and the normal focus ring; `cursor-default`. Never opacity or an
  alpha text colour: dimmed text measured 4.38:1, and `text-muted-foreground/60` on an
  empty locked select 2.47:1 (the token without alpha: 5.45:1). Inert buttons beside a
  locked field take `LOCKED_BUTTON_CLASS`, which swaps `Button`'s disabled opacity for
  `text-muted-foreground` (6.50:1 light, 7.46:1 dark).
- **Lists.** The add field carries the reason; Add is `aria-disabled`; drag is off
  (`useSortable({ disabled })`); each entry's grip, up/down, edit and delete are
  `aria-disabled` **and `tabIndex={-1}`** (owner-approved) — six bullets would
  otherwise add ~30 dead tab stops after the reason was already announced. Every one
  of them, the cover letter's toolbar included, is `aria-describedby` the reason;
  `lockedButtonProps` is spread last so it also replaces dnd-kit's "press space to
  pick up" on the grip. `useTagField` routes every write through one guarded commit.
  A lock arriving under the cover letter's link popover closes it and puts focus back
  in the body textarea rather than on `<body>`.
- **The store guard stays.** `isStillTheProposal` in `lifecycle.ts` still decides
  whether "Keep mine" writes back. The lock covers the field, not the store: a
  whole-section `setResume` without `clearAI` (the list forms re-sanitize every entry
  on any edit) and a whole-CV run still write to a locked field's value. A sync
  pull is not one of them; it always passes `clearAI`.
- **A second run merges, it never replaces**. `recordProposal` in
  `applyHandlers.ts` folds a run into a proposal still pending under the same key: each
  field keeps the user's side it already had, and a field only the earlier run moved
  stays pending (and locked). Replacing wholesale made the first proposal "mine" and
  unlocked fields still holding AI text. The entry's Improve is refused meanwhile (see
  § An empty section refuses Improve), so this is reached by a whole-CV run.

The empty editor uses `EditorStartPanel` to keep Create and Import distinct.
Create deep-links to Basics; Import retains the existing import workflow and
tour target. The landing page's Create CTA skips the panel — the visitor already
chose — and lands on Basics with the name field focused (router state
`EditorNavState`, consumed once so a reload does not re-steal focus). Until the CV
holds data, `EditorImportHint` keeps Import one click away above the section. Editor groups use neutral product chrome so content and the live
CV preview lead the experience.

## Editor Section Rail (2026-08-09)

`EditorTab` is an `sr-only` `h1`, a rail and **one mounted section** — not five accordion
groups, and since the owner's 2026-08-09 review not a visible page header either: the tab
bar and the section heading already say where you are. The heading stays in the accessibility
tree because it is the pane's only top-level one. `features/dashboard/editor/rail/` holds the
pieces:

- `railSections.ts` — `RAIL_GROUPS` (the five `editor.supersections.*` headings plus a
  trailing unheaded Cover Letter row), `RAIL_SECTION_ORDER` **flattened from it** so
  reading order and step order cannot disagree, and `RAIL_LABEL_KEYS` /`RAIL_ICONS` as
  `Record<RailSectionKey, …>`. `RailSectionKey = SectionMetadataKey | 'coverLetter'`.
- ⚠️ **A keyed `Record` pins the inventory, not the labels.** `t()` returns the path for a
  key it cannot find, so `railInventory.test.ts` resolves all fifteen row labels and every
  group heading against the real `en` bundle — the same split
  `importWarningLabels.test.ts` exists for. Such a test resolves through
  `lookupTranslation` (`src/utils/translationLookup.ts`), the resolution `t()` itself
  runs, never a hand-rolled path walk: a walk misses `t()`'s plural rewrite and its
  English fallback, and stays green when either changes.
- `useSectionRail.ts` distinguishes `selectedSection` (is there a `?section=` at all) from
  `activeSection` (`selectedSection ?? 'basics'`). They are not the same question: the
  phone list keys off the former, and defaulting it would mean a phone never sees the list.

**State lives where it already lived.** The active section is `?section=`, which was
already the deep-link contract from three Design-tab call sites, so those keep working
untouched and a rail click stays shareable. `?section=privateProjects` no longer needs
`EditorTab`'s `normalizedTargetSection` fudge: `ProjectsForm` split into `ProjectsForm` and
`PrivateProjectsForm`, and `ProfileList` moved out of `BasicsForm` into
`BasicsProfilesForm`, so each rail row owns exactly one mount.

**Placement.** The rail is a flex sibling of the section panel and sits **outside**
`EditorLayoutProvider`, so the width the forms are told they have is the column's, not the
pane's — see "Pane-Relative Breakpoint System" below for why that distinction cost a
day. `ResizableDivider` and `--editor-width` are untouched. The measured column is net of
the rail and so cannot answer "is there room for a rail" without reasoning in a circle; the
collapse **default** comes from the dashboard workspace width
(`EDITOR_RAIL_EXPANDED_MIN_WIDTH = 1300`), threaded `DashboardLayout → LeftPane → EditorTab`
as props. `useUIStore.editorRailCollapsed` is `boolean | null`; `null` follows that default
and any toggle pins it.

**Phones** get `phone/PhoneSectionList.tsx` instead — the list and the section take turns,
with `editor.rail.back_to_sections` to come back. Keyed off the measured workspace layout,
never a `lg:` breakpoint.

### The AI composer bar (owner review, 2026-08-09)

Three short rows when open: chevron, tile, run button, mode `SegmentedToggle` and cost chip;
the one-line job-ad field; then the add-ons. `professional` has no field and so has two rows.

- ⚠️ **Row 1's action slot follows the tile**: chevron, tile, then the run button (or the
  job-ad entry button standing in for it), then the spacer, mode toggle and chip (owner,
  2026-10-24, #27). At the row's end it sat directly under the header's Export button. Tab
  order follows: the action comes before the mode toggle.
- ⚠️ **Closed, a mode that takes text shows the entry button only — never the run** (owner,
  2026-10-24, #27). A run from the closed band used a job ad and add-ons nobody could see. The
  entry button is `primary` whether or not a draft exists, since it is the one way to a run
  there; `professional` keeps its one-click run.
- ⚠️ **Closed in Professional, the row names the active add-ons** (owner, 2026-10-24, #31) — a
  quiet button after the run ("Restructure Skills · Translate → Français") that opens the band.
  It is the one mode that runs from the closed band, so nothing it carries may be invisible
  (#25). First to yield on a tight row, to a count ("+2 options"), never to nothing.
- ⚠️ **The "Improve with AI" title is `sr-only`** — beside "Improve my CV" it read as the
  same words twice (owner, 2026-10-24). It still names the disclosure button.
- ⚠️ **Row 1's height comes from the 40px tile and the 44px mode toggle**, never from anything
  below, so opening the field moves only the rows under it.
- ⚠️ **While shown, the run button keeps the same DOM node, parent and index.** The language
  select and the second checkbox wrap inside the options group below it. A primary action that
  moves because of an unrelated checkbox is the same defect class as a drag handle that does
  not stay put.
- ⚠️ **A field that collapses on blur will eat the click that caused the blur.** Blur fires on
  mousedown; collapsing there pulls everything below up before mouseup arrives. The Collapse
  control therefore sits **above** the textarea (only the rows below move) with its
  `onMouseDown` prevented, and the blur collapse is deferred one task and skipped while
  `document.activeElement` is still inside `[data-ai-composer]`.
- **Translation and Restructure Skills are add-ons to the selected mode, not modes.** Both
  write to the same state the dialog writes (`useFlowStore.prompt.allowReorg`, and
  `openAIModal`'s `translateTo`). `ai.isTranslationMode` means the translate-**only** invite —
  it locks the language picker and relabels the header — and a combined run must leave it
  false.

### An add-on with settings of its own (2026-09-05)

Translate and Restructure are one checkbox each. The cover letter is a checkbox **plus** a
length preset, a tone and a writing-sample choice, and that does not fit beside them.

- **The settings drop to their own row inside the strip's existing `flex-wrap`**, as a
  `basis-full` child. Measured against the running app: the strip is 1298px inner at a 1440
  workspace and **1038 at 1180**, German occupies 653, and an inline reveal of both selects
  needs 1249. So three ticks fit on one line at every width the band supports and the selects
  never do. Reaching for a second container or a conditional inline reveal re-opens that.
- ⚠️ **The one-line guarantee has a translation budget, and 800px is where it binds.** The
  strip is 726px inner there against 625 occupied and 32 of gaps — **69px of slack, about 12
  characters** at the row's own font. Two of five plausible German phrasings of "Also draft a
  cover letter" exceed it. The constraint is on that key's `handoff-catalog.cjs` row, because
  whoever fills that packet row is the only person who can honour it — you, since
  2026-09-07; **re-measure this row after a packet import**, not before. At 1180 the slack is 381px and nothing binds.
- **Every select sizes to its own longest option**, never to a fixed slot. Each length label
  promises a page fraction as a sentence ("Medium — about half a page"), and a fixed width
  clipped it in English before German was tried. A clipped label is present and unreadable,
  which is what got the mode toggle's narrowing step deleted.
- ⚠️ **A mutually exclusive pair is ONE control, not a select plus a checkbox** (owner,
  2026-09-06 — this overturns an earlier ruling, which said the opposite). The letter's tone
  and the user's writing sample are exclusive at the prompt level: `prompts.js` takes one
  voice block or the other. Modelled as a tone select beside a "match my writing style"
  checkbox, the screen could show a live adjective next to "no sample yet" **while the run
  used that adjective** — asserting one voice and delivering another, for two billed
  requests. A select renders one value, so the fused shape cannot produce that state; the
  argument is structural, not aesthetic. That earlier ruling's objection — "a five-value select where
  one value grows a 5,000-character field is a contract the user cannot predict" — turned out
  to argue against the checkbox instead, which grew no field but **replaced the whole screen
  with the AI modal**. The other half, that a select "silently discards the adjective they
  picked", is answered by leaving `tone` in the store and rendering
  `matchStyle ? STYLE : tone`, so coming back restores it.
  ⚠️ The fifth option is a **UI-only sentinel**. Never add it to `COVER_LETTER_TONES`: that
  array is pinned against the backend table, and an unknown tone is `LETTER_BAD_REQUEST`, one
  of the two failures no retry clears. On the wire it stays four tones XOR a sample.
- **A saved writing sample is the default voice** (owner, 2026-10-26, #56).
  `coverLetterMatchStyle` is `null` until the user picks in the tone select, and `useAIRunner`
  reads `null` as "a sample is readable" — on when one appears, off when it is cleared. A pick
  stores `true` or `false`, which no sample change overrides in that tab. ⚠️ Derived at the read
  site, never seeded into the store: a sample stamped for an account reads `''` until auth binds
  the owner, long after the store is created. Opening the sample editor is not a pick, so on the
  default, emptying the field mid-edit shows the tone behind the open dialog until the user
  types again. That is accepted: it is what a cleared sample means, and the run reads the same
  value the select shows.
- ⚠️ **A control the band cannot afford hands off to the dialog rather than shrinking.** The
  writing sample is a 5,000-character textarea; the expanded band is already 376px against a
  460px workspace at 1440×900 and at 800×860 it is taller than the thing it acts on. Ticking
  "Match my writing style" in the band therefore opens the AI modal — the move the phone band
  already makes, for the same stated reason — and the band keeps only a one-line summary and an
  Edit affordance. Every row an add-on reveals comes out of the workspace below it: this one
  costs 102px at 800×860, and 158 once a sample is chosen.
- **Surface: `--secondary` or `--card`, never `--mist`.** `--input` on `--mist` is 3.22:1 light
  and **2.66:1 dark**, so a `Select` there fails 1.4.11 in dark; on `--secondary` it is
  3.50:1 / 3.08:1.
- **The three add-on labels are one tier.** All `text-foreground`. Two peer options at two
  levels of emphasis says a hierarchy exists that nobody can name.

### A refusal the client can make before the run (2026-09-05)

An add-on whose precondition the client already knows refuses **pre-flight**, not after a
background job the user waited through. Two shapes, and the difference is the chrome:

- **In the strip, disable with the reason; never hide.** The strip hides nothing, and a control
  that vanishes when the mode changes teaches nobody where it went.
- **In a dialog, do not render it at all.** The mode is the whole screen there, so a control for
  a different mode is noise rather than a lesson.

⚠️ **`aria-disabled` plus a refused change handler, never the native attribute** — for the
select as much as for the checkbox. A natively disabled control leaves the accessibility tree
and takes its `aria-describedby` with it, so the one thing the user needs is the thing that
disappears. `Button.tsx` already makes this argument for buttons; it is not a button rule.

⚠️ **The refused control must not render as chosen — for a blocker the SYSTEM imposes.** A
blocker can appear under a box already ticked — the mode changes, or the run just produced the
thing the refusal protects — and a tick still reading "checked" beside its own refusal promises
work that will not happen. The control reads an _effective_ value that a blocker forces false;
the stored preference is untouched.

⚠️ **The opposite holds for a choice the user is halfway through making**, and the two are easy
to confuse. "You picked your own writing style and have not pasted one yet" is not a stale
tick: the selection stands, the control keeps showing it, and the RUN waits instead. Forcing it
back to a default would delete an intent the user is in the middle of expressing. Say which
kind a new refusal is before choosing where it bites.

⚠️ **Blocking a run is not the same as making it impossible**, and the composer bar punishes
the confusion. It renders its primary action as `{runIsShown && …}` — **absent**, not disabled —
so folding an add-on's precondition into `canRun` makes the Improve button _vanish because of a
cover-letter dropdown_. Keep `canRun` for "is a run possible at all" and carry the refusal
separately, demoting the button to `secondary` with `aria-disabled` and an `aria-describedby`
pointing at the reason. ⚠️ Not `Button`'s inline `disabledReason`: it wraps the button in a
`span`, so passing it conditionally changes the element type at that index and remounts on every
transition. `disabledReasonDisplay="tooltip"` always returns the same fragment and does not.

**A per-run cost is stated once, at the control that causes it, inside the region that control
reveals.** Not at the run button, and not on `AIAccessChip`, whose file records why: decorating
a working button is how a pass starts feeling metered. Not amber either — amber is warning and
paid/premium, and a cost the user just opted into is neither.

## Pane-Relative Breakpoint System

To support resizable layouts, components within the dashboard should not rely solely on viewport-based Tailwind breakpoints (`sm:`, `lg:`). Instead, they should respond to the actual width of their container:

- **`EditorLayoutProvider`**: `ResizeObserver` on its own div, publishing `contentRect.width`.
- **`useEditorBreakpoints()`**: Hook providing:
  - `width`: Current pixel width.
  - `isStandard`: True if `width > 560px` (Typical row-based layout threshold).
  - `isSocial`: True if `width > 650px` (Expanded layout threshold for high-density components).
- **Rule**: If a component's layout needs to switch from column to row based on available space in the editor, use these local breakpoints instead of browser-level ones.

⚠️ **A component inset differently at two mount sites measures itself, with `@container`**
(2026-09-05). The pane's width is the right input while a component fills the pane. It is the
wrong one as soon as the same component mounts at two depths: `EntryDiffPanel` heads a section
in `BasicsForm` and sits inside an accordion in `ArrayFormItem`, and its own box differs by
~100px between them. Measured, a **704px pane holds that panel at 517px** — so
`isSocial` (>650) split its two-column comparison into 214px text columns, about **28
characters per line** against a ~45 floor for prose.

The original spelling there was `sm:grid-cols-2`, a _viewport_ breakpoint, which was worse in
the same direction: it split however narrow the pane was, so the layout was worst where there
was most room and correct only on a phone. Swapping it for `useEditorBreakpoints` measured
identically, which is what makes this an exception rather than a misuse.

So: `@container` on the box that varies, and `@min-[…]:` on the child. `EntryDiffRow` splits
at `@min-[48rem]`, where two columns first clear ~45 characters — measured 61 characters
stacked at a 517px panel and 55 in two columns at 911px.

⚠️ **`@container` does not fall back to "no query" when removed.** Every `Section` variant
declares it too, so deleting it from a nested panel re-points the query at the enclosing
Section and silently restores the pane-relative sizing. Assert both halves together;
`proseDiffRow.test.tsx` does.

⚠️ **A reading ceiling is half of this rule.** The same panel's prose body renders at whatever
width it is given — 109 characters per line at a 1045px panel until it was capped. Protecting
the floor and not the ceiling protects nothing. Use `rem`, not `ch`: `ch` is the width of the
digit zero, 10.1px against 7.5px for average lowercase prose here, so `max-w-[72ch]` measured
**97** characters.

⚠️ **It must wrap the box the children actually get, never the pane that contains it**
(2026-08-09). It used to wrap the whole `LeftPane`, and once the rail landed inside that
pane a 900px pane was reporting 900 to a ~600px entry column. All ~17 consumers were
mis-informed at once; `TagField` put highlights two per line with the remove button outside
the card, and `ProfileItem` crammed network, username and URL onto one twelve-column row.
There is now **one provider per measured box**: the editor's scrolling entry column mounts
one beside the rail (so padding and the scrollbar gutter come off too), and the Design tab —
no rail, nothing mis-measured — mounts one around its pane-wide column and keeps its
original numbers.

⚠️ **A hidden layer measures 0, and the provider must not believe it.** `LeftPane` hides the
inactive tab layer rather than unmounting it, so a `display:none` provider div reports width 0. The provider drops any zero-width report and holds the last real one; the observer still
fires with the true width when the layer is shown, because it compares against the 0 it
recorded internally. `layout/__tests__/editorLayoutMeasurement.test.tsx` pins all three
cases at the **flag** level, not at the class names the components derive from them.

## New Form Checklist

When creating a new editor section:

1. [ ] **Directory Setup**: Create a new directory in `src/components/editor/FormName/`.
2. [ ] **Types**: Define `LocalItem` (with `_id` and `_vId`) and props in `types.ts`.
3. [ ] **Logic**: Extract logic into `useFormName.ts`. Use `useLocalCollectionSync` for arrays.
4. [ ] **Shell**: Create `FormNameItem.tsx` using `Accordion` and `DeleteButton`.
5. [ ] **Fields**: Create `FormNameField.tsx` for input components.
6. [ ] **AI Integration**: pass `belowHeader={<EntryDiffPanel target={aiTarget} fieldLabels={…} />}` from the item shell, and call `const lockFor = useLockedFields<Entry>(aiTarget)` **once** in the item shell, passing `lock={lockFor('field')}` to every field the AI can propose ([Locked fields](#locked-fields-while-an-ai-proposal-is-pending)). Pass `entryName` to the panel so two panels in one list have distinct accessible names. A field holding long PROSE rather than short entries takes `proseFields={['…']}` as well, which swaps the entry-by-entry marks for a two-version toggle — named at the call site, never inferred, because only the call site knows how much room the field gets. A non-text value (a level number) takes `valueFormatters` so the panel names it as the picker does.
7. [ ] **Modularization**: Ensure the main component (`FormName.tsx`) is a clean entry point (ideally just a wrapper if using `ArrayForm`).
8. [ ] **I18N**: Register approved English copy in the handoff catalog, generate the temporary translation packet, and import all locales atomically after filling the packet.
9. [ ] **Sync**: Verify that changes in the form correctly persist to the `useResumeStore`.

## Modal System

Moved to [UI_MODALS.md](UI_MODALS.md) — dialog composition, the `DialogFrame`
contract, the dismissal policy, and the z-index hierarchy.

## Styling & Animations

- **TailwindCSS v4**: Used for all web-based styling.
- **Product Restraint**: Simplicity and intuitiveness lead. Use neutral surfaces, restrained KiwiCanopy cues, and motion only when it communicates state.
- **Responsive Design**: The dashboard uses a flexible grid/flexbox layout that adapts to various screen sizes, prioritizing the editor on small screens.

## Layout Components (`src/layouts/`)

- `MainLayout`: The primary shell containing the Header, Sidebar, and Page content.
- `Header`: Contains global actions (Save, Export, Sync). Automatically hidden on desktop for non-dashboard pages to optimize vertical space.
  Below `lg` its drawer trigger is a `Menu` glyph in `text-foreground`, not the logo:
  the logo read as brand, not as a menu (ui-designer, 2026-10-08). Off the dashboard the logo and name sit
  beside it (`showBrand`), and the hero's own KiwiCV eyebrow is desktop-only so the
  name is not shown twice (owner, 2026-10-08). The dashboard bar has no room for it.
- `Sidebar`: Manages navigation between dashboard features (Editor, Design, Settings).

## AI Reorganization Pattern

When the AI proposes a structural change (e.g., merging skills or reordering items), the UI enters **Comparison Mode** to ensure focus and clarity:

1. **Live Preview**: The proposed structural changes are **immediately applied** to the `resume` store (with new `_vId`s generated). This ensures that the PDF/HTML preview reflects the AI's proposal instantly, matching the behavior of field-level improvements.
2. **Header Fusion**: Standard section controls (Add, Toggle Visibility) are temporarily hidden. They are replaced by "Accept" (Check) and "Decline" (X) actions directly in the `Section` header.
3. **Badge & Count**:
   - **Section Level**: The badge shows a detailed breakdown: `contentCount | 🔄 reorgTotal (+A/-R)` to provide granular feedback on structural changes.
   - **High Level (CV/Group)**: The badge shows a simplified aggregate count: `contentCount + reorgTotal`. Icons and breakdown suffixes are hidden at these levels to reduce visual clutter in summary views.
4. **Diff View Toggle**: Instead of a long vertical scroll, the `ReorgDiffPanel` uses a `SegmentedToggle` to switch between the "Original" and "Proposed" views, maintaining a compact editor layout.
5. **Revert (Decline)**: If the user declines the reorg, the store is restored to its `originalItems` state, and the preview reverts accordingly.

## One AI Control Per Section, Branching in the Handler

A section header carries **one** AI control. Where that control has more than one
thing it could do — the cover letter can be written from scratch or improved
— the choice belongs in a small `Popover` anchored to it,
not in a second button and not in a dialog.

⚠️ **Not a dialog.** A chooser dialog sits _below_ the AI modal it launches and
is covered by it — a stack, not a step. The tiers are in
[UI_MODALS.md](UI_MODALS.md)'s table, which regenerates itself; do not restate
them here. A popover sits above, which is why it must be closed _before_ the
modal opens or it floats over it.

⚠️ **`PopoverAnchor`, never `PopoverTrigger`, and not for the obvious reason.**
`AISuggestButton.handleClick` opens with `e.stopPropagation()`, so a trigger
wrapped around it never receives the click at all and the menu simply does not
open. The anchor positions; an `onIdleActivate` prop opens.

⚠️ **The branch sits below the accept-all check**, whose press applies proposals
irreversibly — hoisted above it, "Accept all changes" becomes "open a menu".
Bound by `coverLetterAIMenu.test.tsx`.

⚠️ **A menu anchored rather than triggered owes its own disclosure state.**
Radix wires `aria-expanded`/`aria-haspopup` onto a `PopoverTrigger`; an anchor
gets neither, and neither does the button beside it (WCAG 4.1.2). It also owes
its own `onCloseAutoFocus`: Radix restores through `triggerRef`, which an anchor
never sets, so closing drops focus to `<body>` — the same 2.4.3 defect already fixed
for dialogs, reached through a different primitive.

**Rows are peers when neither destroys anything.** The cover-letter rewrite lands
on the `item:coverLetter` proposal path, where "Keep mine" restores the previous
letter — so the two rows take no salience split, no `--primary` fill, no amber
and no `danger`. A fill inside a 256px popover is the loudest object on screen,
and KiwiCV does not know which the user wants.

⚠️ **And a run that lands on the proposal path needs no refusal in front of it.**
`coverLetterBlocker` used to answer `'has_text'` whenever a letter existed,
because a draft would have overwritten it. Once `applyCvSuggestion` began
routing the letter through `item:coverLetter` with the previous one kept as
`originalValue`, that refusal was guarding against something that could no longer
happen — and its cost was a dead end: a second
application had no route to a fresh letter that did not begin with emptying the
old one by hand. It was removed, along with the two strings that explained it.
**A guard whose harm has been designed out is not free; it is a feature nobody
can reach.**

**An unavailable row is disabled, never absent**, so the menu does not change
shape between visits. ⚠️ The reason goes in `Button`'s `disabledReason`, which
renders it **outside** the dimmed button: inside the row it would inherit the
0.6 disabled opacity and measure 2.68:1.

⚠️ **Every entry point shares one guard.** All five — the section controls, the
cover-letter empty state, the composer's run and its phone hand-off, and the
translation invite — route through `useAIEntryGuard` (signed in, then holding a
pass) rather than each keeping a copy. A duplicated chain is how one of them ends
up unguarded.

⚠️ **One wall, and the hook owns its wording** (owner, 2026-09-07). Pressing an
AI control raises `auth.ai_login_required`. Four of the five raised
`auth.welcome_subtitle` — two explicitly through the guard, two by falling back
to it twice on the way to the screen — which talks about syncing résumés to
Google Drive, not what the user asked for by pressing an AI button. So `allowRun`
takes no `description`: a caller wanting different copy is a caller that should
argue it here first.

⚠️ **`source` belongs to the surface, so it is the hook's argument** and
`allowRun()` stays zero-arg everywhere. It is not cosmetic — it reaches analytics
as an `AuthTriggerSource` and gates `MainLayoutOverlays`' `googleModalSources`,
so folding the translation invite in under the default would have relabelled its
funnel to `ai_suggest` silently.

⚠️ **A suite that mocks `useAuth` as premium reaches neither guarded branch**,
which is precisely why none of them noticed three copies of the chain drifting
apart. Cover both: signed out routes to the wall, and signed in **without a
pass** opens the paywall — and that second half is only reachable if the consumer
actually mounted `modals`, so testing the first alone leaves "forgot the mount"
green. Drive the real surface, too: asking the hook directly pins the hook and
nothing about whether a given entry point still calls it.

⚠️ **Mount a paywall modal only once it is needed.**
`InsufficientPremiumAccessModal` renders `PricingDialog`, which calls
`useNavigate()` — rendering it unconditionally makes a Router a hard requirement
of every surface carrying the button, and of every test that touches one.

### An empty section refuses Improve, it does not hide it

On a section with no entries, or an entry whose fields are all blank, Improve stays
where it is, dimmed, and says why in a tooltip on hover, keyboard focus and tap
(owner, 2026-10-12). It used to vanish until there was data, which taught nobody where
the AI lives. `AISuggestButton`'s `disabledReason` carries it: `aria-disabled` plus
`aria-describedby`, never the native attribute, and a refused press.

**One mechanism for every refusal tooltip: `useRefusalTooltip`.** `AISuggestButton` calls
it directly, since it is a raw `<button>` with its own sizing; anything built on `Button`
or `IconButton` passes `disabledReasonDisplay="tooltip"` (the Design editor's page-break
toggle). Do not wire `useReasonTooltip` and `FloatingTooltip` by hand at a call site.

⚠️ **Not `Button`'s inline `disabledReason`, and not `InfoBox`.** The first renders the
reason as a line under the button, which would make a header row grow the moment a section
empties. `InfoBox` owns its own trigger button, so it cannot describe this one. The
refusal and `InfoBox` share `FloatingTooltip` instead: portalled to `body` (or, for `InfoBox` in a modal, the
dialog) — it takes no space and escapes
the sortable entry's `transform`, which would otherwise re-anchor a `fixed` element —
flipped and clamped into the viewport, and kept on its anchor through scroll. It stays
rendered (`invisible`) while closed, so the refusal keeps it mounted while refused and
the description resolves before the first hover; `InfoBox` does the same for a
non-interactive hint.

⚠️ **Pending proposals win over the refusal.** A reorganisation can propose entries
for a section that is still empty, and accepting them needs no content.

**An entry with a pending proposal refuses Improve too** (owner, 2026-10-13),
through the same tooltip: `ai.improve_blocked_pending_entry`. One proposal per entry at
a time — the user reviews it in the diff panel, and Improve comes back once it is
accepted or rejected. The section header needs no such rule: an entry's pending
proposal already turns it into Accept all, so it cannot start a section run.

The cover letter is the exception by construction: its control opens a chooser
whose "write from the job ad" row works on an empty letter, so the button stays
live and the refusal sits on the Improve row inside the menu.

"Empty" is what persists: blank drafts are never written to the store, so a section
holding only an unfilled new entry still refuses, and an entry is judged by
`isItemEmpty`, the same predicate that drops it on save.

## Focus Handoff When a Control Removes Itself

A control that deletes the thing it lives in takes keyboard focus down with it,
and focus falls to `<body>` — WCAG 2.4.3. Two of these have shipped here:
reaching a boundary disables the arrow button that was just pressed
(`ItemOrderControls`), and deciding the last AI proposal unmounts the whole
panel the button sits in (`EntryDiffPanel`). A mouse user never notices,
which is why both survived review: `fireEvent.click` gives a button no focus, so
there is none to lose and the test passes on the broken code. **Assert
`document.activeElement` after an interaction that actually held focus.**

**The anchor is the next thing the user would do, not the nearest survivor.**
Nearest-survivor lands people on whatever markup happens to be adjacent;
next-thing lands them where the flow continues. For the proposal panel
(`useProposalFocusHandoff`) that is a cascade, and each rung is a real, named
control:

1. the same button — accept or decline, the side the user chose — on the row
   that took the cleared row's place;
2. the next entry's panel in the same section. ⚠️ **The rung that is easiest to
   leave out, and it was.** A section-level run leaves one `EntryDiffPanel` per
   entry, all of them on screen at once, and `usePendingProposals` starts its
   search _after_ the open section — so without this the entry directly below
   the one just cleared is stepped over while fully visible;
3. the pending bar's **Next section**, the control that walks the review;
4. the section heading, always on screen because the rail mounts exactly one
   `page` section at a time.

Rung 1 reads `data-diff-row` and `data-diff-action`. They are hyphenated JSX
attributes TypeScript never checks, so both names, the `DiffAction` union and the
selectors live in `proposals/diffContract.ts`: `DiffDecisionRow` spreads its props
onto the shell `EntryDiffRow` and `ProseDiffRow` wrap their bodies in, and
`useProposalFocusHandoff` queries its selectors. Give a new row kind a body,
never its own `<li>` or decision pair; `diffDecisionRow.test.tsx` fails on an app
file outside the contract that spells either name.

⚠️ **A cascade can re-enter the defect it fixes.** Landing on **Next section**
is only safe because `usePendingProposals` moves focus off it: pressing it to
reach the last section with work makes `next` null, which disables the button
the user is standing on, and a disabled control drops focus to `<body>`. The
navigation carries focus to the arriving section's heading, which also names
where the user now is.

⚠️ **The handoff is for the user who had focus to lose.** It is armed only on
`event.detail === 0` — the click a key produces, and the one a voice or switch
tool synthesizes. A pointer user gains nothing from the move and pays a scroll
to wherever focus went.

That test is `isKeyboardActivation` in `src/utils/focus.ts`, and this paragraph
is the argument for it — the predicate carries a clause and a pointer here, not
another copy of the reasoning. One place, because the failure is silent:
if the right question turns out to be `PointerEvent.pointerType === ''`, or an
assistive technology is measured setting `detail` to something else, every site
but the forgotten one gets fixed and that one ships the old behaviour.

⚠️ **`tests/lint/keyboard-activation.test.mjs` scans for `.detail`, not for one
spelling of the comparison.** Its first cut matched `detail === 0` / `!== 0`,
and `InfoBox`'s trigger — asking the same question as `event.detail > 0` — was
invisible to it. A read of `CustomEvent.detail` that is genuinely unrelated is
enrolled in that suite with its reason, rather than loosened out of the scan.

⚠️ **Whether `detail === 0` is the right test is a measurement question**, and
therefore a measurement lane (AGENTS.md §3) — not settled here. What is settled is
that there is one place to change when the answer moves.

⚠️ **The anchors are ids, and the singleton is a convention, not a type.**
`src/constants/focusAnchors.ts`, rendered by `PendingProposalsBar` and
`SectionPage`; the bar sits above the editor pane in `DashboardLayout` and the
heading above the form, so neither is reachable by a ref from inside the panel.
`variant="page"` is a public prop, so a second page Section would mount a second
`#editor-section-heading` and `getElementById` would pick one arbitrarily —
`tests/lint/section-page-anchor.test.mjs` is what fails instead.

⚠️ **Take focus only from `<body>` or from inside the panel.** Rows also change
when a fresh run lands or another tab writes the store; without the armed intent
the effect would yank focus out of whatever the user was typing in.

⚠️ **`tabIndex={-1}` on the heading is what makes it focusable, and it takes a
lighter mark than a control does.** `tokens.css` matches `[tabindex]:focus-visible`,
so the landing would inherit the app-wide 3px ring plus its 2px separator — and
around a left-aligned title that reads as a **text input**, which is what the
owner saw when it was first shown running (2026-09-07). A box of any weight has
that character; softening it does not help. The heading takes a 2px `--foreground`
rule on its leading edge instead, held open by a transparent border so nothing
shifts when it appears.

The exception is scoped and argued: 2.4.7 and 2.4.11 govern _user interface
components_, and this is a landing target — nothing here can be operated. ⚠️ Do
not extend it to a control, and ⚠️ do not re-point the focus **colour** locally:
that is what broke the sidebar's ghost buttons (`tokens.css` `.bg-nav`).

**The move is paired with an announcement**, as `ItemOrderControls` pairs its own:
two of the four landings carry no news (the next row's button has the same name
as the one just pressed; the heading says nothing about the decision), so
`useProposalDecisionAnnouncement` fills one `sr-only role="status"` per panel with
the outcome and the CV-wide count the pending bar shows. ⚠️ **The region is
rendered outside the panel's `<section>`, and first**, so it is the same node
before and after the last row clears — inside the section it unmounts with the
decision, and a region remounted already populated is not announced. A run
landing clears it rather than speaking.

### The dialog case: `DialogFrame` restores the opener

Same criterion, third instance, different cause. **Every modal here opens
from store state, never from a Radix `Dialog.Trigger`** — `openAIModal()`,
`openGoogleLogin()`, an `isOpen` prop — and the store-driven pattern is
deliberate: several dialogs open from routes, effects and other dialogs, where
no single trigger element exists.

⚠️ **Radix cancels a restore that would otherwise have worked.** This is worth
stating precisely, because the obvious reading is wrong and a defect was filed on
it. `FocusScope` captures `document.activeElement` on mount and puts it back on
unmount, with no trigger involved. `DialogContentModal` then composes a handler
that `preventDefault()`s exactly that and focuses `context.triggerRef.current`
instead — `null` here, so the substitute is a no-op and focus lands on `<body>`.
The failure is a suppression, not an absence.

So `DialogFrame` captures and restores for all 23 consumers, and two details are
load-bearing:

- **Capture in `onOpenAutoFocus`, never in an effect.** `FocusScope` reads the
  active element and dispatches that event _before_ it moves focus anywhere, so
  the opener is still active inside the handler — an ordering no `useEffect` or
  `useLayoutEffect` ordering can promise.
- **⚠️ `<body>` is not an opener.** A dialog raised by a route, an effect or a
  timeout has no control behind it, and `body.focus()` _succeeds_ — so storing it
  satisfies the restore with the very outcome the restore exists to prevent, and
  the fallback is never consulted. Caught by a test, not by review.

⚠️ **Unconditional, unlike the proposal handoff above.** That one is armed only
on `event.detail === 0` because it sends focus somewhere **new**, which costs a
pointer user a scroll. This returns focus to where the user already was, which is
what the WAI-ARIA dialog pattern specifies and what Radix itself does whenever a
trigger exists. The two rules look contradictory side by side; they are not, and
neither should be "fixed" to match the other.

⚠️ **The fallback rung is unconditional too, and that was argued rather than
overlooked.** `a11y-auditor` pushed back during review: when the opener is
dead, `entryDeleteAnchor` sends focus to a control the user never touched, which
is the shape `event.detail === 0` gates upstairs. It stands, for two reasons.
The **distance** is different — the anchor is the successor entry's own Delete
control, spatially where the user was already acting, not a bar or a heading in
another subtree, so there is no scroll to pay. And `DialogFrame` has no honest
way to ask: it never sees the press, only Radix's autofocus events, so a
modality gate here would have to be plumbed through `confirm()` from every call
site to buy a distinction worth nothing at this distance. Revisit if a consumer
ever names an anchor that is genuinely elsewhere on the page.

**The cascade is two rungs, and stops.** The captured opener whenever it can
still take focus — a cancelled delete has to return the user to the button they
pressed, so a caller's `restoreFocusTo` is the fallback for a dead opener, never
an override of a live one — then `restoreFocusTo`, then nothing.

⚠️ **There is deliberately no document-level third rung.** The 23 consumers span
the editor, the account page, the legal page and the landing flow; a global
anchor would be the nearest survivor under another name, and wrong on most of
those surfaces. A consumer that knows the next thing names it. That is why
`ConfirmModal` — a store singleton with no opener prop at all, raised from ~18
call sites — takes `restoreFocusTo` beside its existing `preferredFocus`: one
answers the open side, the other the close side.

**`isConnected` is not enough on its own.** `Button` renders `aria-disabled`
rather than `disabled` whenever it has something to announce and refuses the
activation itself, so an opener that is still mounted can be a control that does
nothing — the pending bar's own trap. `focusIfPossible` (now shared, in
`src/utils/focus.ts`) refuses both spellings and confirms the focus actually took
rather than trusting `.focus()`.

**Which callers need a fallback**, and why each is the same shape as the rungs
above: the four editor delete flows (`useArrayForm`, `useSkillsForm`,
`useLanguageForm`, `useProfileList`) pass `entryDeleteAnchor(index)` — the same
Delete control on the entry that took the deleted one's place, then the section
heading, which is rungs 1 and 4 reached through a dialog. `PendingProposalsBar`
passes `sectionHeadingAnchor` for both of its confirms, since either answer
empties the bar and the bar then returns `null`. The CV library's row delete
passes `cvLibraryDeleteAnchor(index)`, which is the same cascade with a different
last rung — see below. `AIEditModal` passes `aiDialogCloseAnchor`: its usual
opener, the composer's run button, is absent while the run is in flight and the
whole band is replaced by the pending bar once proposals land, so a run's close
finds the opener dead on **every** path, cancelled or not. The cascade is the
run button (re-created after a failed run), then the entry button standing in for it on a
closed band in a text mode, then **Next section**, then the
section heading — rungs 3 and 4 above, with the composer on top.

⚠️ **A menu row is never an opener.** The cover letter's AI chooser launches the
dialog from a popover row that unmounts with the popover in the same commit, so
the dialog captured `<body>` and had nothing to restore. `CoverLetterAIMenu`
moves focus back to its anchor button _before_ opening the dialog, which makes
the button the opener the first rung returns to. A fallback anchor would have
guessed at the same control from the wrong end.

⚠️ **An anchor behind a disclosure is the disclosure, not the item.** The
library's Delete lives inside a `Popover`, and Radix unmounts popover content
while it is closed — so enrolling the Delete item would have registered a control
`entryDeleteAnchor` can never find, and the query would return nothing with
nothing failing. The row's **menu trigger** carries `data-entry-delete` instead:
it outlives the row's removal, and it is the next thing the user would do anyway.
`ENTRY_DELETE_ATTR` therefore marks the control through which a delete is
_reached_, not the one that performs it.

⚠️ **A missing anchor is sometimes a missing opener. Before naming one, check
that the opener is a control at all.** The photo delete was filed as needing
`restoreFocusTo` and needed none: the preview's opener survives the delete, so
the first rung answers it, and what was actually broken was that the opener was a
`div` with an `onClick` — unreachable without a pointer, 2.1.1. A fallback would
have papered over the operability defect underneath (`PhotoEditor.tsx`).

⚠️ **A cascade's last rung is per-surface, and a shared helper cannot supply
it.** `entryDeleteAnchor` ends at `#editor-section-heading`, which the editor
rail mounts and `/cvs` does not — so on an empty library the shared cascade runs
out exactly when there is no row left to offer, and focus falls to `<body>`. The
library has its own `cvLibraryDeleteAnchor`: same positional read, its own rungs.

⚠️ **"And when the list is empty?" is rarely one question.** The first cut of the
library's cascade answered it with the empty-state call to action and shipped a
hole, because `CvLibraryPage` gates that panel on the **unfiltered** version
count: delete the last row matching an active filter and `VersionTable` swaps to
its own no-results panel instead, where that anchor does not exist. Two empties,
one answered. **The terminal rung has to be the thing that outlives every branch,
which in practice means the page shell** — `#cv-library-heading`, the analogue of
the rail's section heading — with the friendlier anchor as a rung above it. Ask
what replaces the list, then ask what else can.

⚠️ **The entry anchor is valued with its list, and that value is what makes it
safe.** `entryDeleteAnchor(listId, index)` queries
`[data-entry-delete="<list>"]`; enrollment is opt-in, through `AccordionItem`'s
`entryListId`. An earlier cut left the attribute unvalued and queried it
document-wide, resting on the same "one list is mounted at a time" convention
the heading anchor uses — and that was measured failing during review: with two
lists on screen, focus landed on a row of the **wrong list**, silently. A
convention that can be deleted instead of pinned should be.

⚠️ **And that value is an inventory, not a `string`.** `EntryListId` in
`src/constants/focusAnchors.ts` — derived from `ALL_ENTRY_LIST_IDS` (`EmptyItemKey`
plus the CV library), plus the custom-section token family — types
`entryDeleteAnchor`'s first parameter and `AccordionItemProps.entryListId`, **at
the definitions**, so a misspelling or a rename at either end is a build error.
`_EntryListIdIsNotWidened` pins the union against being widened back to
`string`, because that failure is a deletion and no source scan can see one.

⚠️ **The type reaches the `entryListId` prop, not the raw attribute.**
`ProfileItem` and `VersionRow` spell `data-entry-delete=` themselves, and a
`data-*` JSX attribute is not typechecked. What holds those two is that each
reads a shared constant — `PROFILES_LIST_ID`, `CV_LIBRARY_LIST_ID` — at both
ends. That is the rule for when a list needs a named constant, and why `skills`
and `languages` do not have one: their render end goes through the typed prop.

⚠️ **Four guards, none of which subsumes another.** The type binds the
inventory. `src/components/editor/__tests__/entryListInventory.test.tsx` binds
that every member is **rendered**: it walks `ALL_ENTRY_LIST_IDS`, mounts each
member's real surface with three entries, and wants one marked control per entry.
It renders rather than scans because ten `ArrayForm` sections and every custom
section are valued from one forwarded `sectionKey`, which only the composed
surface resolves (skills, languages and profiles name their own id) — so a
thirteenth section whose editor marks nothing fails there by name.
`tests/lint/entry-delete-anchor.test.mjs` binds which member each
file is entitled to — `'work'` is a valid `EntryListId` and the wrong one for
twelve of the thirteen array sections, and pointing them all at Work's list was
measured passing 2,526 vitest tests. Its census binds which controls carry the
attribute at all. A list that names itself at both ends needs a row on **both**
sides of that test: `entryListId="languages"` on the skills list compiles and
passes every suite otherwise.

⚠️ **Survival is checked at runtime, per list, because the census cannot see
it.** The census keys on the file, so additionally marking the library's
Delete item inside its `Popover` — or moving the attribute there — passed it.
`entryListInventory.test.tsx` asks the property instead, for every
`ALL_ENTRY_LIST_IDS` member plus a custom section: opening every
`aria-expanded="false"` disclosure on the surface — including ones that appear
only once another is open, such as a popover inside an expanded entry — must
leave the marked-control count unchanged (a marked control behind a disclosure is unmounted while
closed), and deleting the first entry from the keyboard must land focus on the
next entry's marked control. It does not see a disclosure that omits
`aria-expanded`, nor a raw `data-entry-delete` valued outside the inventory —
the census is what stops a new file from doing that.

⚠️ **What the guards do and do not cover.**
`tests/lint/entry-delete-anchor.test.mjs` pins the census (which controls carry
the attribute) and pins that the four known flows still pass an anchor — the
second of those is a **regression pin, not a forward guard**. No type can ask
"does this confirmed action unmount its own opener", and most of the 13
destructive `confirm()` calls do not, so binding it in the type would force
`restoreFocusTo: () => null` on nine innocent sites. What catches a real
regression is `src/components/ui/__tests__/confirmDeleteFocus.test.tsx`, which
drives the **real `useConfirmStore` promise** from the keyboard.

⚠️ **That test exists for an ordering, not for a behaviour.** A confirmed delete
is four steps in three queues: the store sets `isOpen=false`; `FocusScope`
schedules its restore in a `setTimeout(…, 0)`; the `await confirm(…)`
continuation runs as a microtask and removes the row; the timer then resolves
`restoreFocusTo`. If the timer ever won that race, `focusIfPossible` would
succeed on the still-mounted Delete button, the frame would return early, React
would unmount it, and focus would fall to `<body>` — the defect, restored, with
every unit test green. The unit tests cannot see it: they remove the opener
inside the closing commit, or mock the store.

### A dialog opened as the side effect of another closing

`ExportModalBody.handleSetup` closes the Export dialog **and** opens the sign-in
modal in one state update — `useUIStore.activeSyncModal` is a single enum. So the
control `DialogFrame` captured is inside the dialog that just closed, and it is
unmounted before the restore can reach it. Measured in the running app: after
`Set up`, the pressed control reports `isConnected: false` while the header's
Export button reports `true`.

**The anchor is the OUTER flow's starting control, not the inner one's.** The
user pressed Export to begin this; `Set up` was a step inside it, and the step's
surface is gone. Same criterion as everywhere else — the next thing the user
would do — applied one level further out than it first looks.

⚠️ **An anchor that crosses a serializing boundary is an id, not a getter.** The
auth slice outlives the OAuth redirect, so it is rebuilt from text; the reasoning
and the type that binds it live beside `_AuthIsSerializable` in `useFlowStore`. `FlowFocusAnchorId` is a union rather than `string`, for the
reason recorded one layer down.

⚠️ **An address fails silently in BOTH directions, so both are pinned.**
`tests/lint/flow-focus-anchor.test.mjs` counts occurrences — a missing renderer
makes the anchor `null`, a second makes `getElementById` arbitrary. What no source
scan can check is that the id lands on a **focusable** element: moving `id={id}`
from `ExportButton`'s `<button>` to its wrapping `<div>` is a plausible refactor
that breaks the flow with every check green. That is the behavioural test's job,
and the behavioural test must therefore render the **real** control, not a
stand-in for it.

⚠️ **"Am I closing my own surface" is typeable; "by calling back" is the part
that is not.** `ensureConnected` pairs `onInterrupt` with the anchor in a
discriminated union, so omitting it there is a build error — the obligation
`ConfirmOptions.restoreFocusTo` could not carry, because "does this confirmed
action unmount its own opener" is not expressible while "I am interrupting you"
is. ⚠️ **But that union binds one exit of two.** The same function's
`onSetupRequired` also destroys `ExportModalBody`'s surface — not by calling back,
but because that caller closes itself through the `activeSyncModal` enum, which
the hook cannot see. **A dialog swapped for another through a shared enum is the
same defect with no callback to hang the obligation on**, and it is anchored where
the swap happens instead. Look for that shape before trusting a callback-shaped
guard.

⚠️ **The anchor is snapshotted when the dialog opens, not read when it closes.**
The getter is still _called_ at close, so it still answers after the dialog's work
has landed — what is captured is the prop. **State that a dialog reads on close
must not be cleared by the act of closing it**; where a caller does clear it
(`MainLayoutOverlays` calls `resetAuth()` in `onClose`), the frame holds its own
copy. ⚠️ Only this one prop is defended — a dialog reading any other store field
at close meets the identical problem with nothing in the way.

### The second route out of the same function

⚠️ **A delete flow is not one path.** `useArrayForm` gates its confirm on
`if (!isEmpty)`, so a blank entry is dropped immediately: no dialog opens,
`DialogFrame` never runs, and the `restoreFocusTo` the same function passes three
lines above is never consulted. That route is the **proposal shape, not the
dialog shape** — armed before the removal (`useEntryFocusHandoff`) — and it
lands on the same `entryDeleteAnchor`, so both ways out of `deleteItem` agree
about where the user ends up. It affects `useArrayForm` alone, which is thirteen
of the fifteen editor sections; `useSkillsForm`, `useLanguageForm` and
`useProfileList` confirm unconditionally.

⚠️ **Armed, therefore gated on `event.detail === 0`** — unlike the dialog
fallback above, which is unconditional. The distinction already argued there
survives intact: this sends focus somewhere new with no dialog having
interrupted the user, so a pointer press must leave focus where it fell.
`AccordionItem.onDelete` carries the bit, which is why its signature is
`(fromKeyboard: boolean) => void` rather than `() => void` — the confirm-gated
callers simply ignore it.

⚠️ **A test whose harness rebuilds the call site pins the harness.** Both routes
out of `deleteItem` are exercised by `ArrayForm/__tests__/arrayFormDeleteWiring.test.tsx`,
which renders a real `EducationForm`, rather than by the hook-level suite
(`src/hooks/__tests__/entryFocusHandoff.test.tsx`) — that one calls the hook itself, so neither file the fix changed is imported by
it, and moving the arm call into the confirmed branch left the whole gate green.
`ops/TESTING.md` § "A guard's name can assert coverage it does not have" owns the
naming half of this.

### The add that removes its own control

The empty section's "add first entry" card (`EmptySectionState`) is replaced by
the entry it adds, so it is the same defect from the other direction. It uses
the same hook: the four list editors (`useArrayForm`, `useSkillsForm`,
`useLanguageForm`, `useProfileList`) arm it with `firstEntryFieldAnchor` before
adding. That anchor names the **first control in tab order** of the first open
entry's fields (`ENTRY_FIELDS_ATTR`). New entries are added open at the top, so
that entry is the new one. In Work and Education the first control is the Start
Date picker, not Position: skipping it would hide controls a keyboard user would
otherwise reach. `onAction` carries `fromKeyboard` for the same pointer gate as
`onDelete`. The four call sites are pinned by
`editor/__tests__/addFirstEntryFocus.test.tsx`.

## Installing the App

The one install control is a row in **Settings → App Interface**
(`InstallAppRow.tsx`), after language and appearance. `ui-designer` graded the
alternatives on 2026-10-08:

- **Not the landing hero.** A third CTA competes with "Create your CV" on a page
  whose job is the first CV, and a visitor with no CV has no reason to install.
- **Not the sidebar or header.** That chrome is on every route; install is a
  once-only action.
- **Not a post-export nudge — yet.** It interrupts the moment the task is done,
  needs dismissal state, and cannot act on iOS. Revisit here first if mobile
  reach becomes the goal.

The row is always rendered; only its right-hand side follows the browser:
an install button (prompt captured), "installed" text, an iOS Share-sheet hint
(iOS has no install API), or the button disabled with its reason. That is the
"unavailable stays visible with a reason" rule, not an exception to it.

⚠️ **`beforeinstallprompt` is captured in `main.tsx`, not in a component.**
Chromium fires it early; `bootstrap.tsx` is a dynamic import and on a slow
connection loads too late. `services/pwaInstall.ts` stays React-free so it can
sit in the entry chunk.

`preventDefault()` on that event suppresses Android Chrome's automatic install
mini-infobar. Accepted: the row is the install surface; desktop keeps the
address-bar icon either way.

The manifest `start_url` is `/dashboard`, not `/` (owner, 2026-10-08): someone
who installed the app wants the tool, not the sales page. `RootLanguageGate`
still sends a visitor with a saved UI language to `/xx/dashboard`.

## Mobile Adaptation Patterns

For complex or space-constrained UI elements on small screens or narrow editor
panes:

1. **Pane-relative layout**: Use `useEditorBreakpoints()` for editor content; viewport breakpoints alone do not describe a resized pane.
2. **Neutral groups**: Keep the section list and item cards visually distinct without permanent category colors or negative-margin full bleed.
3. **Wrapping action rows**: Let item actions wrap below the title when space is constrained. Do not shrink 44 px targets, with one exception: a stacked Design section row drops its buttons to 36 px rather than wrapping to a third line (owner, 2026-10-18; DESIGN_LANGUAGE § Design Editor Implementation).
4. **Named icon actions**: Compact icons may replace visible labels only when their accessible names remain explicit and include the affected item. Name the item inside one translated sentence — a `{{name}}` key such as `common.delete_named` — never as `${t('verb')}: ${name}`, which fixes English word order and a colon in every locale; `src/utils/__tests__/namedLabels.test.ts` fails on the glued form.
5. **Reflow-safe dialogs**: Use `ModalContainer` scrolling and stack form groups instead of forcing horizontal grids at 320 px or 400% zoom.

## Scrollbar Utilities

KiwiCV uses custom scrollbar styles to maintain a premium feel across browsers (especially Webkit-based ones).

- **`clean-scrollbar`**: The primary utility for custom scrollbars.
- **`custom-scrollbar`**: An alias for `clean-scrollbar`, used for legacy compatibility and general-purpose custom scrollbars.
- **Dimensions**:
- - **Horizontal**: `10px` height (optimized for "grabbability" in horizontal carousels).
- - **Vertical**: `6px` width (`utilities.css:15`).
- **Styling**: Thumbs use `background-clip: padding-box` with a transparent border to create a "floating" effect within the track.
- **Dark Mode**: Automatically adjusts colors for optimal contrast.

## Overflow & Dropdowns

To ensure that custom dropdowns (like social network suggestions or language level pickers) are not clipped by parent containers:

1. **Card Root**: Root containers for cards (e.g., `AccordionItem`, `ProfileItem`) must NOT have `overflow-hidden`.
2. **Inner Containers**: Use `overflow-hidden` only on inner containers that specifically require it for text truncation or clipping.
3. **Truncation Pattern**: For text truncation within a flexbox, use the `min-w-0 flex-1` pattern on the container and apply `overflow-hidden` and `truncate` to the element itself or an intermediate wrapper. This allows truncation to work while letting absolute-positioned elements escape the root container.

## Performance-Optimized Drag & Drop

To ensure "buttery smooth" reordering in the editor (especially for dense lists like tags or profile links), components MUST follow these performance rules:

1. **DragOverlay**: ALWAYS use a `DragOverlay` to render the item currently being dragged. This lifts the element to a portal, ensuring 60fps movement.
   - **Visuals**: The original item in the list MUST be hidden (`opacity: 0`) to provide a clean "Lift-and-move" effect.
   - **ID Conflicts**: The component rendered inside `DragOverlay` must accept an `isOverlay` prop to disable its internal `useSortable` hook, preventing `dnd-kit` ID conflicts.
2. **Unified Sensors**: To prevent accidental drags during mobile scrolling while keeping the UI responsive, use these exact constraints:
   - `TouchSensor`: `{ delay: 250, tolerance: 5 }`
   - `PointerSensor`: `{ distance: 5 }`
3. **Stable Unique IDs**: Items in a sortable list MUST have stable, unique IDs (e.g., UUIDs generated via `generateId()`). Never use the index or unstable content (like tag text) as the key/id, as this causes `dnd-kit` to lose track of items during rapid movement.
4. **Memoization**: Sortable item components (the ones using `useSortable`) MUST be wrapped in `React.memo`. This prevents the entire list from re-rendering on every small movement tick, which is the primary cause of stuttering.
5. **Local State Sync**: Manage the list order in **local state** during the drag operation. Only push the final order to the global store (`useResumeStore`) on `onDragEnd`. This decouples the fluid UI interaction from potentially heavy store-wide side effects (like PDF generation or sync triggers).
6. **Drop Animation**: Use `dropAnimation={null}` on the `DragOverlay` for immediate, snappy feedback if the standard spring animation feels sluggish for small items.
7. **Mobile Touch Support**: Always include a `TouchSensor` with a `delay: 250` and `tolerance: 5` in the `useSensors` array. This allows users to scroll the page naturally but triggers a drag-and-drop operation after a short long-press.
8. **Explicit Handles & touchAction**: Use a dedicated drag handle (e.g., `GripVertical`) with `style={{ touchAction: 'none' }}`. This is critical on mobile to prevent the browser from intercepting the touch event for page scrolling when the user intended to drag.
9. **Non-drag fallback**: Every user-orderable collection also exposes visible Move up and Move down buttons. Drag behavior, sensors, overlays, and callbacks remain intact as the fast path.

## Dashboard Layout Architecture

The dashboard implements a performant, resizable side-by-side view for the editor and preview.

- **Direct DOM Manipulation**: To ensure 60fps performance during dragging, the divider updates a CSS variable (`--editor-width`) directly on the container's style object, bypassing React's render cycle for layout ticks.
- **Self-Healing Width**: The layout uses a `useEffect` hook to validate the stored `editorPaneWidth` against the current window width. If the stored value would cause a pane to be smaller than **480px**, it is automatically corrected.
- **Dragging Overlay**: An absolute overlay is injected during drags to prevent the cursor from being "lost" inside iframes (like the PDF preview) and to maintain consistent cursor styling.
- **Standardized Breakpoint**: **Not a Tailwind viewport breakpoint.** The dashboard
  measures its own container with a `ResizeObserver` and resolves one of three layouts
  in `getDashboardWorkspaceLayout` (`layout/useDashboardWorkspace.ts:10-15`):
  `split` at `width >= 1180`, `workspace` above `767`, `phone` at or below it
  (`layout/constants.ts:1-2`). Because it measures the container, not the window, a
  collapsed sidebar or a narrow embed changes the layout at the same viewport width —
  never reason about it with `lg:` classes.

## Form Field Alignment

To ensure a professional and balanced look, form fields within grids MUST follow these alignment rules:

1. **Lower Border Alignment (`items-end`)**: Grid containers for form fields must use the `items-end` class. This ensures that the **input boxes** remain perfectly level with each other even if their labels wrap to multiple lines (e.g., "Company Name" vs "End Date").
2. **Date Hint Integration**: Date-specific hints (like "Leave empty for present") should be integrated into the **placeholder** of the field instead of being rendered as separate text lines below. This prevents vertical height shifts that would break the alignment with neighboring fields.
3. **Text Truncation**: Inputs and DatePickers must use `truncate` and `whitespace-nowrap` on their internal text elements to prevent long values or placeholders from expanding the container height.

## 📐 Layout Safety Zones

To prevent content from being clipped by device home indicators, mobile browser bars, or floating action buttons (FABs):

- **Editor Tabs**: Always apply `pb-12` to the `PageContainer` in `EditorTab.tsx` and `DesignTab.tsx`.
- **Scroll Containers**: Ensure the last item in a scrollable list has sufficient bottom margin to clear the screen edge.

## Mobile-Specific Form UX

To maintain an "App-like" feel on small screens, form components must adapt their behavior:

1. **Enter Key Handling**: For list-based inputs (e.g., `TagField`), inputs MUST use `enterKeyHint="done"`. This signals the smartphone keyboard to show a "Done" or "Enter" action instead of "Next".
2. **Submission Prevention**: Use `e.preventDefault()` on 'Enter' keydowns to stop the browser from automatically focusing the next input field, allowing the component to handle item addition (e.g., adding a tag) without losing focus.
3. **Responsive Height (80vh)**: Follow the `ModalContainer` rules in the "Modal System" section to ensure overlays don't consume the entire viewport on mobile.

## Field Layout Indicators

For fields that are restricted to specific columns in 2-column layouts (e.g. main-column-only fields like summaries, highlights), the editor displays a layout indicator badge.

### Main Column Badge Pattern

- **Component**: Global reusable component defined in [MainColumnBadge.tsx](../../../src/components/ui/MainColumnBadge.tsx).
- **UI Element**: A small badge reading `main`, on token surfaces. It takes one prop,
  `layoutHint`. (It used to carry `badge-primary-3d` and sit on `legacyControlClasses`;
  that list is now `[]` and no `btn-3d`/`badge-primary-3d` string survives in `src/`.)
- **Interactive Tooltip**: Wrapped in an `<InfoBox>` with `interactive` and `position="top"`, so
  the pointer can move from the badge into the tooltip without closing it. It passes
  `label="main"` because the badge shows that literal text and WCAG 2.5.3 requires the
  accessible name to contain it.
- **Placement**: It renders a button, so it is **never** a child of `<label>`. `FieldLabel`
  places it beside the label.
- **Design Tab Navigation**: The tooltip contains a button (`t('editor.hints.change_in_design_tab')`) that sets the `?tab=design` search parameter and scrolls to `#section-order`.
- **Corrected 2026-07-20**: this page previously documented a hardcoded shadow class string and an
  `isLegend` prop for a static legend in the Editor Tab banner. Neither exists in the component.
