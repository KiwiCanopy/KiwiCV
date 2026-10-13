import { useId, useState } from 'react';

import { CoverLetterStyleDialog } from '@/components/modals/ai/template/CoverLetterStyleDialog';
import { type CoverLetterControlState } from '@/components/modals/ai/template/coverLetterControlTypes';
import {
  COVER_LETTER_STYLE_OPTION,
  LENGTH_LABEL_KEYS,
  TONE_OPTION_LABEL_KEYS,
  TONE_OPTION_VALUES,
  coverLetterSampleReasonId,
} from '@/components/modals/ai/template/coverLetterLabels';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  AI_PRO_DAILY_LIMIT,
  COVER_LETTER_LENGTH_PRESETS,
  type CoverLetterLengthPreset,
  type CoverLetterTone,
} from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

const LENGTH_PRESETS = Object.keys(COVER_LETTER_LENGTH_PRESETS) as CoverLetterLengthPreset[];

/**
 * ⚠️ The two selects and the sample button sit on ONE row, so they share one
 * height — and it is the button's, not the selects'. `Button` is `min-h-11`
 * everywhere in this app because 44px is the touch target; shrinking it to meet
 * a `py-1.5` select would break that for a cosmetic match. The selects come up
 * instead, which costs the band ~10px against the 56px this shape already gave
 * back.
 */
const ROW_CONTROL_HEIGHT = 'h-11';

interface AICoverLetterControlProps {
  id: string;
  state: CoverLetterControlState;
  /**
   * `card` is the dialog's panel, where the 5,000-character writing-sample field
   * mounts. `inline` is the same control in the composer band's add-ons strip —
   * one control, two chromes, following `AIReorganizationControl` rather than a
   * second checkbox meaning the same thing.
   *
   * `sole` is the settings ALONE: no tick, no label, no price. The run writes
   * the letter and nothing else, so there is no add-on to opt into and no
   * second request to warn about — offering the tick there would offer to
   * switch off the only thing the run does (owner, 2026-09-08).
   */
  variant?: 'card' | 'inline' | 'sole';
}

export function AICoverLetterControl({ id, state, variant = 'card' }: AICoverLetterControlProps) {
  const { t } = useTranslation();
  /**
   * ⚠️ Owned here, so BOTH chromes get it and neither has to know how to open
   * it. This replaced `onEditStyle` → `openAIModal('cv')`, which answered "let
   * me paste a sample" with the whole AI config screen.
   */
  const [sampleOpen, setSampleOpen] = useState(false);
  const reasonId = useId();
  const isInline = variant === 'inline';
  const isSole = variant === 'sole';

  const blocked = state.blockedBy;

  /**
   * The sample was chosen and there is nothing to draft from.
   *
   * ⚠️ Not a `CoverLetterBlocker`. A blocker is a condition the SYSTEM imposes
   * on a stale tick — the mode changed — so it forces the tick false. This one the user is halfway through creating, so the
   * select keeps showing their choice and the RUN waits instead.
   */
  const needsSample = state.needsSample;

  /**
   * ⚠️ The select displays the choice; `tone` underneath is left alone. Picking
   * "my writing style" and going back restores the adjective that was there,
   * which is the fair half of the objection to a fifth value.
   */
  const toneValue = state.matchStyle ? COVER_LETTER_STYLE_OPTION : state.tone;

  const tick = (
    <input
      id={id}
      type="checkbox"
      checked={state.enabled}
      aria-disabled={blocked ? true : undefined}
      aria-describedby={blocked ? reasonId : undefined}
      onChange={(event) => {
        if (blocked) return;
        state.setEnabled(event.target.checked);
      }}
      className={cn(
        'accent-primary focus:ring-primary-strong/20 h-4 w-4 shrink-0 rounded',
        blocked && 'cursor-not-allowed opacity-50',
        !isInline && 'mt-0.5 h-5 w-5',
      )}
    />
  );

  const reason = blocked && (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {/* ⚠️ The sentence alone is the description; the exit is a sibling. A
          button inside the `aria-describedby` target would be read as part of
          the reason *and* be reachable on its own, announcing itself twice. */}
      <span id={reasonId} className="text-muted-foreground text-xs">
        {t('ai.cover_letter_needs_job')}
      </span>
    </span>
  );

  const settings = (
    <div className={cn('flex w-full flex-col gap-3', isInline && 'pt-1')}>
      {/* ⚠️ The two-request cost is stated ONCE, here, in the region the tick
          reveals and directly under the tick — never at the run button and never
          on `AIAccessChip`, whose file records that decorating a working button
          is how a pass starts feeling metered. Not amber either: amber is
          warning and paid/premium, and this is neither — the user chose it.
          Ahead of the controls rather than after them, because with the
          writing-sample field open it would otherwise sit a screen away from
          the thing it is the price of. */}
      {!isSole && (
        <p className="text-muted-foreground text-xs">
          {t('ai.cover_letter_cost', { limit: AI_PRO_DAILY_LIMIT })}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Select
          label={t('ai.cover_letter_length_label')}
          value={state.length}
          onChange={(event) => state.setLength(event.target.value as CoverLetterLengthPreset)}
          options={LENGTH_PRESETS.map((preset) => ({
            value: preset,
            label: t(LENGTH_LABEL_KEYS[preset]),
          }))}
          // ⚠️ Sized to its own longest option, not to a fixed slot. Every label
          // here promises a page fraction in a full sentence, and a fixed width
          // clipped "Medium — about half a page" in English before German was
          // even tried — "present but unreadable" is the defect that got the
          // mode toggle's narrowing step deleted.
          containerClassName="w-auto max-w-full"
          className={cn('w-auto max-w-full', isInline && ROW_CONTROL_HEIGHT)}
        />

        {/* ⚠️ Five options for a decision with five answers, not a select plus a
            checkbox for a decision with one. The tone and the writing sample are
            mutually exclusive at the prompt level — `prompts.js` takes one voice
            block or the other — and two widgets could show a live adjective
            beside "no sample yet" while the run used the adjective. A select
            renders one value, so that state cannot exist (overturning an earlier
            ruling against a fifth value; the argument is on `UI_PATTERNS.md`). */}
        <Select
          label={t('ai.cover_letter_tone_label')}
          value={toneValue}
          onChange={(event) => {
            const next = event.target.value;
            if (next === COVER_LETTER_STYLE_OPTION) {
              state.setMatchStyle(true);
              // Choosing it IS the hand-off — the field never renders in the
              // band, and in the dialog it is the only thing on screen.
              setSampleOpen(true);
              return;
            }
            state.setMatchStyle(false);
            state.setTone(next as CoverLetterTone);
          }}
          options={TONE_OPTION_VALUES.map((option) => ({
            value: option,
            label: t(TONE_OPTION_LABEL_KEYS[option]),
          }))}
          containerClassName="w-auto max-w-full"
          className={cn('w-auto max-w-full', isInline && ROW_CONTROL_HEIGHT)}
        />

        {state.matchStyle && (
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setSampleOpen(true)}
            className="border-input shrink-0"
          >
            {state.styleSample.trim() ? t('ai.style_sample_edit') : t('ai.style_sample_add')}
          </Button>
        )}
      </div>

      {/* The refusal the run waits on, in the region the choice reveals. */}
      {needsSample && (
        <p id={coverLetterSampleReasonId(id)} className="text-muted-foreground text-xs">
          {t('ai.cover_letter_needs_sample')}
        </p>
      )}
    </div>
  );

  const sampleDialog = (
    <CoverLetterStyleDialog
      open={sampleOpen}
      onClose={() => setSampleOpen(false)}
      value={state.styleSample}
      onChange={state.setStyleSample}
      onClear={state.clearStyleSample}
    />
  );

  /**
   * ⚠️ The settings unconditionally — never behind `state.enabled`. The tick is
   * implied by the control that opened this dialog, and gating on it here would
   * render an empty panel if the preset ever failed to land.
   */
  if (isSole) {
    return (
      <>
        {settings}
        {sampleDialog}
      </>
    );
  }

  if (isInline) {
    return (
      <>
        <label
          htmlFor={id}
          className={cn(
            'text-foreground flex min-h-11 min-w-0 items-center gap-2 text-xs font-medium',
            blocked ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          {tick}
          {t('ai.cover_letter_addon')}
        </label>

        {/* ⚠️ `basis-full` inside the strip's own `flex-wrap` is what drops the
            settings to their own row. The strip is 1298px inner at 1440 and
            1038 at 1180, against 653px of German checkboxes — three ticks fit
            on one line, an inline reveal of both selects needs 1249 and does
            not. Measured; do not fold these back onto the strip. */}
        {blocked && <div className="w-full basis-full">{reason}</div>}
        {state.enabled && <div className="w-full basis-full">{settings}</div>}
        {sampleDialog}
      </>
    );
  }

  return (
    <div className="bg-muted/30 border-border/50 flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        {tick}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label
            htmlFor={id}
            className={cn(
              'text-foreground text-sm font-semibold',
              blocked ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            {t('ai.cover_letter_addon')}
          </label>
          {reason}
        </div>
      </div>

      {state.enabled && settings}
      {sampleDialog}
    </div>
  );
}
