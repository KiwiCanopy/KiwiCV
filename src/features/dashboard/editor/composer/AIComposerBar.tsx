import { useId, useLayoutEffect, useRef, useState } from 'react';

import { AICoverLetterControl } from '@/components/modals/ai/template/AICoverLetterControl';
import { AIReorganizationControl } from '@/components/modals/ai/template/AIReorganizationControl';
import { coverLetterSampleReasonId } from '@/components/modals/ai/template/coverLetterLabels';
import { Button } from '@/components/ui/Button';
import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { COMPOSER_RUN_ANCHOR_ID } from '@/constants/focusAnchors';
import { AIAccessChip } from '@/features/dashboard/editor/composer/AIAccessChip';
import { AIComposerField } from '@/features/dashboard/editor/composer/AIComposerField';
import { rowHasWrapped } from '@/features/dashboard/editor/composer/rowHasWrapped';
import {
  COMPOSER_MODES,
  COMPOSER_MODE_LABEL_KEYS,
} from '@/features/dashboard/editor/composer/types';
import { useAIComposer } from '@/features/dashboard/editor/composer/useAIComposer';
import { usePendingProposals } from '@/features/dashboard/editor/proposals/usePendingProposals';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronRight, ChevronUp, Pencil, Sparkles } from 'lucide-react';

/**
 * The last index in the resting row's drop order. The order itself is spelled
 * out where the levels are consumed; this only bounds the escalation loop so a
 * row that cannot fit at any level stops trying rather than re-rendering
 * forever.
 */
const LAST_DROP_LEVEL = 3;

/** The cover-letter control's id in this chrome, and the reason id derived from it. */
const COVER_LETTER_CONTROL_ID = 'composer-cover-letter';
const COVER_LETTER_REASON_ID = coverLetterSampleReasonId(COVER_LETTER_CONTROL_ID);

interface AIComposerBarProps {
  /** Phones get the card: three modes and a six-row textarea are not a 375px row. */
  isPhone: boolean;
  /**
   * The measured workspace width. The band spans it, so this is the band's own
   * width — no second `ResizeObserver` is needed to know what fits on one line.
   */
  workspaceWidth: number;
}

/**
 * "Improve with AI", above the editor and the preview because it acts on both.
 *
 * ⚠️ **The collapse is desktop-only.** A phone already hands off to the modal,
 * so its band is a two-row explainer rather than a working composer, and
 * shrinking it means folding the status and the action into row 1 and making the
 * whole row one tap target — a different shape, not a hidden row. It also
 * cannot reuse this toggle: `ai.suggest` is *also* "Improve with AI", so a
 * region-named disclosure button would sit beside an identically named run
 * button. That restructure is worth its own change.
 *
 * It replaces the header's `AISuggestButton target="cv"`, which said only
 * "Tailor" and hid the mode and the job ad behind a modal the user had to open
 * to find out what it was about to do.
 */
export function AIComposerBar({ isPhone, workspaceWidth }: AIComposerBarProps) {
  const { t } = useTranslation();
  const composer = useAIComposer();
  const { total: pendingCount } = usePendingProposals();
  const [fieldFocusSignal, setFieldFocusSignal] = useState(0);
  const requestFieldFocus = () => setFieldFocusSignal((n) => n + 1);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Referenced by the phone hand-off button's `aria-describedby`; see the chip.
  const phoneBlockerId = useId();
  // Read only to reset the drop cascade: switching locale re-renders the row
  // with different words at the same workspace width, so without this the
  // level measured for the previous language would stick.
  const appLanguage = useUIStore((state) => state.appLanguage);
  const isCollapsed = useUIStore((state) => state.aiComposerCollapsed);
  const setIsCollapsed = useUIStore((state) => state.setAiComposerCollapsed);

  /**
   * The exit from the cover-letter tick's "already has text" refusal: the same
   * `?section=` deep link the editor rail writes, so the letter is on screen
   * with its own Improve action beside it.
   */
  // ⚠️ The cascade below bounds the RESTING row only. Expanded is free to wrap;
  // it is already several rows tall.
  // ⚠️ The **title yields first**, and the modes are never squeezed — full or
  // gone. A toggle truncated to "Stell… / Prof… / Benu…" is present but
  // unreadable, which is worse than absent: it takes the space *and* fails to
  // inform. A narrowing step was tried and removed for that reason — at 224px
  // each of three segments gets ~50px of text and "Job tailoring" needs ~88, so
  // no narrowed toggle is readable and no tier belongs between full and gone.
  //
  // The **entry control** is never dropped: it is the only way into the text,
  // and below the last tier its label names the active mode in the toggle's
  // place.
  //
  //   >= 1150  everything
  //   < 1150   the title goes — the cheapest thing here, since the tile already
  //            identifies the band, and its 117px is what keeps the toggle at
  //            full width down to the last tier
  //   < 1000   the modes go, and the entry control's label names the mode
  const hasDraft = composer.draft.trim().length > 0;
  const canRunNow = composer.canRun;

  /**
   * What the resting row gives up, and in what order. It drops one thing at a
   * time and stops the moment the row fits, rather than comparing against magic
   * thresholds that assumed a worst case the row is often not carrying.
   *
   *   1. the **title** ("Improve with AI")
   *   2. the run button's **label**, which drops its object: "Improve my CV"
   *      becomes "Improve". German is why this step exists — "Lebenslauf
   *      verbessern" is ~205px against English's 137px, which was the only
   *      thing still pushing the toggle off the row in any language.
   *   3. the **mode toggle** — last, and in practice never.
   *
   * ⚠️ The edit button is icon-only whenever the toggle is visible, in **both**
   * states. It used to show the start of the pasted ad, which took 190px and was
   * the only thing that ever forced the toggle out — so the preview bought a
   * glimpse of text at the cost of the most consequential control on the row.
   * The toggle names the mode; the pencil says what pressing it does; the ad
   * itself is one click away. Once the toggle *is* gone the button takes the
   * label instead, so the mode is never unknowable.
   */
  // ⚠️ Unmeasured (width 0) means "assume there is room". Collapsing everything
  // on the first paint, before the workspace has reported, would flash the
  // narrowest layout on every load.
  const measured = workspaceWidth > 0;
  const relaxed = !measured || !isCollapsed;

  /**
   * How far the resting row has had to yield, as an index into `DROP_ORDER`.
   *
   * ⚠️ **This is measured from the rendered row, never predicted from
   * constants.** It used to be arithmetic over a table of pixel widths in
   * `AI_COMPOSER_ROW` — and those widths were English. German renders the mode
   * toggle at 438px against the 330 the table claimed and the whole row at
   * 953px against a predicted 786, so `fits()` reported room that did not
   * exist: at a 900px workspace the model said "fits", dropped nothing, and the
   * row wrapped to two lines — 61px of band becoming 117px, which is precisely
   * what the cascade exists to prevent.
   *
   * A table of pixel widths is a second copy of a fact the DOM already holds,
   * and nothing kept the copies together: no typecheck, test or lint run can
   * see that a number in a constants file no longer describes the thing it
   * names. Asking the row whether it wrapped cannot be wrong about a locale, a
   * font fallback, or a browser zoom level, because it does not predict
   * anything.
   */
  const rowRef = useRef<HTMLDivElement>(null);
  const [dropLevel, setDropLevel] = useState(0);

  /**
   * Everything that changes how much the row needs or how much room it has.
   * When any of it moves, the level measured for the previous arrangement is
   * meaningless and the cascade starts again from the widest layout — otherwise
   * the row would only ever shrink and never grow back.
   */
  const rowSignature = [
    workspaceWidth,
    appLanguage,
    composer.mode,
    composer.needsDraft,
    canRunNow,
    isCollapsed,
    // ⚠️ The tick swaps "Improve my CV" for the longer "Improve my documents",
    // so it changes how much the row needs — the exact thing this list is for.
    // Missing, the band that dropped to the short label for the long one kept
    // it after the letter was unticked: growth still worked (the layout effect
    // increments), only the shrink-back was stuck until some other entry moved
    // (code-reviewer, 2026-09-08).
    composer.coverLetter.enabled,
  ].join('|');
  const [measuredFor, setMeasuredFor] = useState(rowSignature);

  // ⚠️ Reset **during render**, not in an effect. React sanctions adjusting
  // state while rendering for exactly this case (a value derived from props
  // that has to reset when they change), and it is the only form that does not
  // paint one frame at the stale level first. Doing it in an effect also trips
  // `react-hooks/set-state-in-effect`, which is right to complain: it would be
  // a cascading render for something that is knowable during the render itself.
  let currentDropLevel = dropLevel;
  if (measuredFor !== rowSignature) {
    setMeasuredFor(rowSignature);
    setDropLevel(0);
    currentDropLevel = 0;
  }

  // Drop one thing at a time until the row stops wrapping: each increment
  // re-renders, this runs again on the new level, and it stops at the first one
  // that fits or at the end of the order. It is a *layout* effect, so the
  // browser never paints an intermediate level.
  useLayoutEffect(() => {
    if (relaxed || currentDropLevel >= LAST_DROP_LEVEL) return;
    const row = rowRef.current;
    if (!row || !rowHasWrapped(row)) return;
    setDropLevel(currentDropLevel + 1);
  }, [relaxed, currentDropLevel, rowSignature]);

  const showTitle = relaxed || currentDropLevel < 1;
  const showFullRunLabel = relaxed || currentDropLevel < 2;
  const showModes = relaxed || currentDropLevel < 3;

  const hideTitle = !showTitle;
  const restingRowIsTight = !showModes;

  if (pendingCount > 0) return null;

  // The phone card hands off to the modal instead of running: three modes and a
  // six-row job ad are not a 375px row, and starting a whole-CV rewrite from a
  // button whose settings are off-screen is not a choice the user made.
  //
  // ⚠️ `isFullShape` is gone with the two shapes it named. The run button no
  // longer changes parent, the field has one height, and the add-ons no longer
  // wait for a runnable draft — so there is nothing left for it to switch.
  const entryLabel =
    composer.mode === 'job_description' ? t('ai.job_description') : t('ai.custom_instructions');
  // ⚠️ Always labelled. This used to be icon-only whenever the mode toggle was
  // on screen, on the reasoning that "a pencil beside Job tailoring already says
  // what this opens". It does not: the toggle names the MODE
  // ("Stellenanpassung"), the label names what you would type into it
  // ("Stellenbeschreibung"). Different words for different things, and the
  // pencil alone never said which.
  //
  // The row still yields in the same order — title first, then the run label,
  // then the modes — so the words that go are the ones the tile beside them
  // already covers.
  const entryText = entryLabel;

  // ⚠️ The row has ONE loud thing, and which one it is follows what the user
  // still has to do. With no draft the next step is supplying it, so the entry
  // control takes the fill and this demotes; once there is a draft this takes it
  // back. A dark filled button held at `opacity-60` is simultaneously the
  // loudest object on the row and the one thing that does nothing, which is the
  // defect this replaces.
  //
  // ⚠️ `aria-disabled`, never the native `disabled` attribute: a natively
  // disabled button leaves the accessibility tree, so nothing about it is
  // announced. `Button` refuses the activation itself when `aria-disabled` is
  // set.
  //
  // ⚠️ Do NOT add `disabledReason` here without reading `Button.tsx` first: it
  // wraps the button in a `span`, so passing it *conditionally* changes the
  // element type at this index and React remounts the button on every
  // transition — the exact defect that was just fixed by giving it one parent.
  const runButton = (
    <Button
      // The AI dialog's close-focus anchor: this button is its usual opener, and
      // the one it re-creates after the run.
      id={COMPOSER_RUN_ANCHOR_ID}
      // ⚠️ `runBlocked` is NOT folded into `canRunNow`. This button is rendered
      // conditionally on `canRunNow` below — absent, not disabled — so folding
      // them would make the primary action disappear because of a cover-letter
      // dropdown. Blocked, it stays put, demotes, and names its reason.
      variant={canRunNow && !composer.runBlocked ? 'primary' : 'secondary'}
      size="md"
      // Folds the band once a run launches, so it returns collapsed after the
      // proposals are resolved; the draft stays behind the entry control.
      onClick={() => {
        if (composer.run()) setIsCollapsed(true);
      }}
      aria-disabled={canRunNow && !composer.runBlocked ? undefined : true}
      // ⚠️ Points at the reason only while SOMETHING carries it. The visible
      // one lives in the add-ons strip, which unmounts with the band — and the
      // band rests closed, so an unconditional reference names a missing
      // element for most of the session. That is an invalid ARIA reference
      // (4.1.2), the same trap `aria-controls` above documents. The collapsed
      // case is covered by the `sr-only` copy below, so exactly one element
      // holds this id at any moment.
      aria-describedby={composer.runBlocked ? COVER_LETTER_REASON_ID : undefined}
      loading={composer.isGenerating}
      loadingLabel={t('ai.optimizing')}
      className="shrink-0"
    >
      {/* ⚠️ Drops the object, not letters. "Improve my CV" -> "Improve" rather
          than a truncated "Improve my C…", because a clipped label is present
          but unreadable — the defect that got the mode toggle's narrowing step
          deleted. Shown only when the full label will not fit.

          ⚠️ The object is what the run will actually TOUCH, so it follows the
          cover-letter tick: two documents go in, so the button stops promising
          one (owner, 2026-09-08). `coverLetter.enabled` rather than the raw
          preference — that is the same state the request is built from, so a
          tick the run cannot honour (not eligible, blocked) leaves the label
          alone rather than naming a document the run will not write.

          The short label needs no sibling: it drops the object entirely, so it
          is already true of both. */}
      {/* ⚠️ Two `t()` calls, not one with the key chosen inside it. `i18n:check`
          reads literal keys out of the source and rejects a computed one —
          "unregistered dynamic call" — because a key it cannot see is a key it
          cannot check parity or deletion for. */}
      {showFullRunLabel
        ? composer.coverLetter.enabled
          ? t('ai.composer_run_documents')
          : t('ai.composer_run')
        : t('ai.composer_run_short')}
    </Button>
  );

  // ⚠️ Collapsing also puts the field back to its compact shape. Leaving it
  // expanded meant the textarea remounted on the way back — and it carries
  // `autoFocus` (`AIComposerField.tsx:155`), so re-opening the band stole focus
  // into the textarea instead of leaving it on the control the user just
  // pressed. A disclosure must not move focus.
  const toggleCollapsed = () => {
    if (isCollapsed && composer.needsDraft) requestFieldFocus();
    setIsCollapsed(!isCollapsed);
    // ⚠️ Focus has to be put back by hand. `onMouseDown` is prevented so the
    // click cannot pull focus out of the field on the way, and that also stops
    // the button taking focus itself — leaving it on `body`, i.e. nowhere. A
    // disclosure should leave focus on the control that was pressed.
    toggleRef.current?.focus();
  };

  // ⚠️ A mode that needs a draft has nowhere to type while the band is closed,
  // and `canRun` is false without one — so a collapsed band on `job_description`
  // or `custom` with an empty draft is a dead end: a disabled button and no
  // field. Choosing such a mode reopens the band rather than adding a second
  // control that means "open the thing you just asked for".
  const selectMode = (mode: Parameters<typeof composer.setMode>[0]) => {
    composer.setMode(mode);
    if (mode === 'professional') return;
    if (isCollapsed) setIsCollapsed(false);
    requestFieldFocus();
  };

  // ⚠️ Region collapse is click-only and NEVER fires on blur. That is the whole
  // difference from `AIComposerField`'s own collapse: blur fires on mousedown,
  // so collapsing there pulls everything below up before mouseup arrives and
  // eats the click that caused it. This control sits on row 1, above every row
  // that appears or disappears, so nothing under the pointer moves between
  // mousedown and mouseup — and `onMouseDown` is prevented so a click on it can
  // never pull focus out of the field on the way.
  const regionIsMounted = !isCollapsed && composer.needsDraft;

  const collapseToggle = (
    <button
      ref={toggleRef}
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => toggleCollapsed()}
      aria-expanded={!isCollapsed}
      // ⚠️ Only while the region is actually mounted. `#ai-composer-body` renders
      // under `!isCollapsed && composer.needsDraft`, and the band now rests
      // CLOSED — so an unconditional `aria-controls` named an element that does
      // not exist for most of the session, which is an invalid ARIA reference
      // (4.1.2). `aria-expanded` alone is a complete disclosure contract when
      // there is nothing yet to point at.
      aria-controls={regionIsMounted ? 'ai-composer-body' : undefined}
      // ⚠️ Named for the region it discloses; `aria-expanded` carries the state,
      // which is the standard disclosure pattern and needs no new string in
      // fifteen locales. Safe only because this control is desktop-only: on a
      // phone `ai.suggest` is *also* "Improve with AI", and two identically
      // named buttons in one row is a real defect, not just a test failure.
      // ⚠️ No `aria-label`. The button now CONTAINS the visible title, so the
      // title is its accessible name — which is what a voice-control user says
      // ("click Improve with AI"). An aria-label would override the words on
      // screen with an identical string and break that match for no gain.
      // Still safe on phones: this control is desktop-only, and the phone band
      // has its own single button.
      // ⚠️ `-ml-3.5` pulls the 44px hit area left so the CHEVRON GLYPH lands on
      // the same vertical as the section rail's icons directly below it —
      // measured, both at x=100. Without it the band's `px-6` and the rail's
      // own smaller inset put them 14px apart, which reads as a wobble down the
      // left edge of the editor.
      //
      // The margin moves the box, not the glyph inside it: the touch target
      // stays 44px, it just starts at 78 instead of 92.
      // ⚠️ The hit area runs chevron → tile → title, not just the 44px chevron.
      // A 44px target for a disclosure whose own heading sits two elements to
      // the right is a target most people aim at and miss; an accordion header
      // is conventionally clickable across its label. The chevron keeps its own
      // 44px box INSIDE this one so the glyph still lands on the rail icons
      // below it — that alignment is measured, and `-ml-3.5` still moves the
      // outer box rather than the glyph.
      className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring -ml-3.5 flex shrink-0 items-center gap-3 rounded-lg pr-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        )}
      </span>

      {/* ⚠️ `bg-secondary` with a `--primary` glyph, not a filled `bg-primary`
          block. Filled, this 40px square was the highest-salience object above
          the fold — and it is `aria-hidden` decoration. The salience belongs to
          the run button beside it, which is the thing to press. */}
      <span
        className="bg-secondary text-primary-strong flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        aria-hidden="true"
      >
        <Sparkles className="h-4 w-4" />
      </span>

      {/* ⚠️ The first thing to go when the row runs out of room — `sr-only`
          rather than removed, so it still names this button when the words are
          gone. The tile beside it already identifies the band. */}
      <span className={cn('min-w-0', hideTitle && 'sr-only')}>
        <span className="text-foreground text-sm font-semibold">{t('ai.composer_title')}</span>
      </span>
    </button>
  );

  // ⚠️ Phones get one row and one control, not a shrunken desktop band.
  //
  // The desktop band is a working composer; the phone band never was. It has
  // always handed off to the modal — three modes and a six-row job ad are not a
  // 375px row, and starting a whole-CV rewrite from a button whose settings are
  // off-screen is not a choice the user made. So its two rows were spending
  // 163px, 28% of the viewport once the header is counted, to say what it is and
  // then offer one button.
  //
  // The whole row is that button now. Same one tap to the same modal, from a
  // third of the height.
  //
  // ⚠️ It cannot borrow the desktop chevron: `ai.suggest` and `ai.composer_title`
  // are BOTH "Improve with AI", so a disclosure button named for the region
  // would sit beside an identically named run button. One control avoids the
  // collision entirely rather than needing a sixteenth locale key to dodge it.
  if (isPhone) {
    return (
      <section
        data-ai-composer=""
        aria-label={t('ai.composer_title')}
        className="border-border bg-card border-b"
      >
        <button
          type="button"
          onClick={composer.openOptions}
          aria-label={t('ai.suggest')}
          // ⚠️ The chip's own `sr-only` text is unreachable here: this button has an
          // explicit `aria-label`, so the accname algorithm never descends into it.
          // Without this reference the only thing telling a screen-reader user the
          // tap will bounce is announced by nothing at all.
          aria-describedby={composer.accessState ? phoneBlockerId : undefined}
          aria-busy={composer.isGenerating || undefined}
          className="hover:bg-muted/40 focus-visible:ring-ring flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors focus-visible:ring-2 focus-visible:-outline-offset-2"
        >
          <span
            className="bg-secondary text-primary-strong flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
            {composer.isGenerating ? t('ai.optimizing') : t('ai.composer_title')}
          </span>
          {/* Any blocker stays on the row. Hiding it behind the tap is what the
              band was built to stop — the objection to the old header button
              was that it hid the mode and the job ad alike. */}
          <AIAccessChip
            state={composer.accessState}
            id={phoneBlockerId}
            compact
            className="min-w-0 shrink"
          />
          <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
        </button>

        {composer.guardModals}
      </section>
    );
  }

  return (
    <section
      data-ai-composer=""
      aria-label={t('ai.composer_title')}
      className={cn(
        'border-border bg-card border-b px-4 md:px-6',
        // Collapsed, the row itself is the band, so the generous resting
        // padding is most of what is left to give back.
        isCollapsed ? 'py-2' : 'py-4',
      )}
    >
      {/* Row 1. ⚠️ Its height is set by the 40px tile and the 44px mode toggle,
          never by anything below it, so opening the field moves only the rows
          under it — this row does not reflow. */}
      <div ref={rowRef} className="flex flex-wrap items-center gap-3">
        {/* ⚠️ Leads the row rather than trailing it. A disclosure chevron is
            conventionally the first thing in an accordion header, and at the
            far right it sat past the run button — the last place the eye
            reaches, which is the wrong place for the control that reveals what
            the region does. */}
        {collapseToggle}

        {/* ⚠️ The action slot follows the title, not the row's end. At the end
            it sat right under the header's Export button, and the two were
            pressed for each other (#27). */}

        {/* The way into the text while the band is closed. It is a real,
            labelled control rather than only the chevron: "open the region" and
            "let me paste the ad" are the same click here, but only one of them
            is a thing the user was actually thinking about.
            ⚠️ Only for the modes that take text — `professional` needs none, so
            offering it there would promise a field that will not appear. */}
        {isCollapsed && composer.needsDraft && (
          <Button
            variant={hasDraft ? 'secondary' : 'primary'}
            size="md"
            onClick={() => {
              setIsCollapsed(false);
              requestFieldFocus();
            }}
            // ⚠️ The real `Button`, not a bespoke pill. It sits in the action
            // slot — beside the title, where the run button goes — so it has to
            // *be* an action: same height, radius, padding and type as the
            // button it stands in for. A rounded pill of its own invention read
            // as a different class of thing in the one place it must not.
            //
            // Width follows content rather than a fixed slot. The fixed slot
            // existed to stop the row shifting when the two swapped; the run
            // button is now absent entirely while it cannot run, so the row
            // already rearranges at that exact moment and a width change adds
            // no new jump. `max-w-60` only caps the filled state, where the
            // content is the user's own prose.
            className={cn(
              'shrink-0',
              // ⚠️ The done state keeps `--secondary` as its fill but NOT
              // `border-transparent`. The claim that "the pale fill has a shape
              // of its own at 1.17:1 and needs no edge" was measured only in
              // light and is wrong in both: `--secondary` on `--card` is 1.18:1
              // light and **1.12:1 dark**. With no edge and no visible fill the
              // button simply was not there in dark mode.
              //
              // `border-input` is 3.83:1 light / 3.28:1 dark. This is the same
              // rule the rest of the app follows — a fill that does not contrast
              // with its surface means the EDGE is the control.
              // ⚠️ No `max-w-60`. That cap existed when this button previewed the
              // user's pasted prose; the content is a fixed locale string now, and
              // 240px clips French — `Instructions personnalisées` needs ~196px
              // against ~184px of budget. A clipped label is "present but
              // unreadable", which is the defect that got the mode toggle's
              // narrowing step deleted; it must not come back here.
              hasDraft && 'bg-secondary hover:bg-secondary/80',
            )}
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
            {/* ⚠️ Empty is LOUD and filled is QUIET — backwards from the usual
                convention, and right here: emptiness is the state that needs
                action, so the step announces itself and then stops. Do not
                "fix" this to match other buttons.

                The label is permanent. It names the thing you would type —
                "Job Description", "Custom Instructions" — which is what an
                unlabelled pencil never told anyone, and which the mode toggle
                beside it does not say either. */}
            <span className="min-w-0 truncate">{entryText}</span>
          </Button>
        )}

        {/* ⚠️ Absent, not disabled. A button you cannot press is clutter on a
            row whose whole job is to be one line — and with it gone the entry
            control takes the action slot. `professional` needs no draft, so `canRunNow` is always
            true there and this always renders. */}
        {canRunNow && <div data-composer-run="">{runButton}</div>}

        {/* ⚠️ The slack goes HERE, on purpose. It used to sit on the title block
            as `flex-1`, which absorbed 348px when the title needs ~110 and
            wedged the empty space into the middle of the row. One flexible
            spacer between the identity-and-action group and the controls puts it in one
            place. */}
        <div className="flex-1" aria-hidden="true" />

        {!restingRowIsTight && (
          <>
            {/* The app's own segmented control, as the Edit/Design tabs use:
                it carries the sliding thumb the redesign specifies, so a
                bespoke radio group here would be a second spelling of a
                pattern that already exists. It renders plain buttons, so the
                group name the replaced `fieldset`/`legend` gave for free has to
                be supplied here. */}
            <div role="group" aria-label={t('ai.composer_mode_label')} className="min-w-0 shrink">
              <SegmentedToggle
                value={composer.mode}
                onChange={selectMode}
                options={COMPOSER_MODES.map((mode) => ({
                  value: mode,
                  label: t(COMPOSER_MODE_LABEL_KEYS[mode]),
                  hint: t(COMPOSER_MODE_LABEL_KEYS[mode]),
                }))}
              />
            </div>

            {/* ⚠️ Compact while resting. The full chip spells the blocked state
                as a whole sentence — 224px of a 1324px row, which is what tipped
                the row into wrapping at anything under 1440. Expanded there is
                room for the sentence. */}
            <AIAccessChip state={composer.accessState} compact={isCollapsed} />
          </>
        )}

        {/* The tight resting row drops the subtitle and the modes but never a
            blocker — a run button that will bounce with nothing saying so is the
            defect the band was built to fix. */}
        {restingRowIsTight && (
          <AIAccessChip state={composer.accessState} compact className="min-w-0 shrink" />
        )}

        {/* The reason, for the state where the visible one is not mounted. The
            strip renders under `!isCollapsed`, so this and it are mutually
            exclusive and the id is never duplicated nor dangling. */}
        {composer.runBlocked && isCollapsed && (
          <span id={COVER_LETTER_REASON_ID} className="sr-only">
            {t('ai.cover_letter_needs_sample')}
          </span>
        )}
      </div>

      {/* Phones get their own row for the status and the action rather than
          wrapping them into row 1. Beside the title they took the width the
          title needed — "Improve with AI" broke over three lines and the hint
          truncated to a single letter — and the blocked chip is a whole
          sentence, so there is no width at which all four fit one row at 375px.
          The button opens the modal rather than running, so it has no options
          row below to join either. */}
      {!isCollapsed && (
        <>
          <div className="border-border bg-secondary mt-3 flex items-start gap-3 rounded-lg border px-3 py-2">
            <div className="text-foreground flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
              {/* Restructure first: it is the add-on people reach for; a
                  translation is the occasional one. Both ride along with
                  whichever mode is selected, so they belong on the same row.
                  ⚠️ Same `AIReorganizationControl` the dialog renders, in its
                  compact chrome — not a second checkbox meaning the same thing.
                  Both entry points set the same `useFlowStore.prompt.allowReorg`.
                  ⚠️ Hidden until the mode actually has what it needs to run.
                  They modify the run, so showing them before one is possible is
                  noise at exactly the moment the user is deciding what to do —
                  and `professional`, which needs no input, therefore shows them
                  immediately. Keyed on `hasRunnableInput` rather than `canRun`
                  so an in-flight run does not collapse the row mid-flight. */}
              {composer.isReorgEligible && (
                <AIReorganizationControl
                  variant="inline"
                  id="composer-allow-reorg"
                  checked={composer.allowReorg}
                  onCheckedChange={composer.setAllowReorg}
                  sectionName={t('editor.sections.skills')}
                />
              )}

              {
                <label className="text-foreground flex min-h-11 cursor-pointer items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={composer.translate}
                    onChange={(event) => composer.setTranslate(event.target.checked)}
                    className="accent-primary focus:ring-primary-strong/20 h-4 w-4 rounded"
                  />
                  {t('ai.composer_translate_addon')}
                </label>
              }

              {composer.translate && (
                <LocaleSelect
                  label={t('ai.composer_translate_addon')}
                  showLabel={false}
                  value={composer.targetLang}
                  onValueChange={(language) => language && composer.setTargetLang(language)}
                  localeCodes={composer.targetLangOptions}
                  wrapperClassName="w-44 shrink-0"
                  className="py-1.5"
                />
              )}

              {/* ⚠️ A third PEER here, not a fourth mode and not a second run
                  button — `UI_PATTERNS.md` settles that add-ons are not modes.
                  Its own settings drop to a row of their own beneath the three
                  ticks; the control renders that row as a `basis-full` item of
                  this same wrap container, which is why it is a fragment rather
                  than a box. Measured: German occupies 653px of the
                  1038px strip at 1180, so three ticks fit on one line and an
                  inline reveal of both selects (1249px) does not.
                  ⚠️ It stays on the row when it cannot be used, with the reason
                  beside it — the strip hides nothing today, and a control that
                  vanishes when the mode changes teaches the user nothing. */}
              {composer.coverLetter.eligible && (
                <AICoverLetterControl
                  variant="inline"
                  id={COVER_LETTER_CONTROL_ID}
                  state={composer.coverLetter}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Row 2 — the input and the action, side by side. The button sits here
          in every state and every mode, including `professional`, which has no
          field: a primary action that changes position depending on the mode or
          on whether options are showing is the defect this arrangement avoids.
          `items-end` keeps the button on the field's last line once the field
          grows into a textarea. */}
      {regionIsMounted && (
        <div id="ai-composer-body" className="mt-4 flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <AIComposerField
              mode={composer.mode}
              value={composer.draft}
              onChange={
                composer.mode === 'job_description'
                  ? composer.setJobDescription
                  : composer.setCustomPrompt
              }
              charLimit={composer.charLimit}
              focusSignal={fieldFocusSignal}
            />
          </div>
        </div>
      )}

      {composer.guardModals}
    </section>
  );
}
