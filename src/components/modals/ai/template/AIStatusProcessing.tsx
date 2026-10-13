import React, { useEffect, useState } from 'react';

import { type AIRunStage } from '@/components/modals/ai/template/statusTypes';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { CircleCheck, Sparkles } from 'lucide-react';

/** Milliseconds a phase line stays up before the crossfade starts. */
const PHASE_INTERVAL_MS = 3000;
/** Length of the opacity crossfade between phase lines. */
const PHASE_FADE_MS = 500;

interface AIStatusProcessingProps {
  /** Which call is in flight. Absent for every single-call run. */
  runStage?: AIRunStage | null;
  /** Extra line under the processing copy, for flows that block closing. */
  processingNote?: string;
}

/** The `processing` branch of `AIStatusView`, which stays the router. */
export const AIStatusProcessing: React.FC<AIStatusProcessingProps> = ({
  runStage,
  processingNote,
}) => {
  const { t } = useTranslation();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setIsFading(true);
      swap = setTimeout(() => {
        setPhaseIndex((prev) => prev + 1);
        setIsFading(false);
      }, PHASE_FADE_MS);
    }, PHASE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, []);

  // Literal keys, not a lookup table: the i18n checker verifies every `t()`
  // argument statically and cannot follow `t(keys[index])`.
  const phases = [
    t('ai.status.analyzing'),
    t('ai.status.optimizing'),
    t('ai.status.polishing'),
    t('ai.status.enhancing'),
    t('ai.status.aligning'),
    t('ai.status.storytelling'),
    t('ai.status.working_magic'),
  ];

  // ⚠️ Wrapped at the read: a constant restating the list's length is a copy
  // that can silently fall out of step with it.
  const activePhase = phaseIndex % phases.length;

  /**
   * The heading carries the stage, because it is the text the live region
   * announces. A run with no `runStage` is every single-call flow, including
   * the import modal — unchanged copy, unchanged behaviour.
   *
   * Literal keys for the same reason the phase list is literal: `i18n:check`
   * verifies each `t()` argument statically.
   */
  const isLetterStep = Boolean(runStage?.twoStep) && runStage?.stage === 'cover_letter';
  let stageHeading = t('ai.optimizing');
  if (runStage && !runStage.twoStep) stageHeading = t('ai.status.stage_letter_only');
  else if (runStage?.twoStep) {
    stageHeading = isLetterStep ? t('ai.status.stage_cover_letter') : t('ai.status.stage_cv');
  }

  return (
    /* ⚠️ No `aria-busy` on the live region. Its contract needs a node
       that outlives its own busy period — set true, mutate, set false — and
       this one is replaced wholesale by the success or error view, so there is
       no moment where it could clear. "Working" is carried by the heading copy,
       which is present-progressive in every locale; the spinner is
       `aria-hidden` and says nothing. ⚠️ `StatePanel`, `Button` and
       `DialogFrame` keep theirs: containers and controls that toggle it. */
    <div
      role="status"
      aria-live="polite"
      className="border-border bg-muted/30 rounded-xl border p-6"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div
          className="relative flex h-16 w-16 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <span className="border-border border-t-primary-strong absolute inset-0 animate-spin rounded-full border-4 motion-reduce:animate-none" />
          <span className="bg-background text-primary-strong relative flex h-11 w-11 items-center justify-center rounded-full">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {/* ⚠️ The completed step, above the active one. It is the
              visual half of "the CV lands and a letter failure is a warning":
              a step-2 failure then arrives on a screen that has already said
              the CV is safe. `--success` as TEXT, at 5.96:1 / 7.91:1 on this
              panel — no marker glyph in `bg-primary`, which measures 1.75:1. */}
          {isLetterStep && (
            <p className="text-success flex items-center justify-center gap-1.5 text-sm font-semibold">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('ai.status.stage_cv_done')}
            </p>
          )}

          {/* The only text inside the live region, together with the line
              above: announced once per REAL state change, rather than
              re-announcing every three seconds as the phase line cycles. */}
          <h3 className="text-foreground font-extrabold">{stageHeading}</h3>

          {/* min-h-12 reserves two lines at leading-6, so a long German or
              Japanese phase does not shift the layout as lines swap. */}
          <p
            aria-hidden="true"
            className={cn(
              'text-muted-foreground min-h-12 text-sm leading-6 transition-opacity duration-500 motion-reduce:transition-none',
              isFading ? 'opacity-0' : 'opacity-100',
            )}
          >
            {phases[activePhase]}
          </p>

          {/* Discrete stage markers. Deliberately not a percentage: the job
              takes 10-60s and the real progress is not knowable up front.
              ⚠️ Dropped entirely in the two-step run rather than repurposed.
              At 1.75:1 over 1.43:1 these are tolerable while
              decorative and `aria-hidden`; the moment they carry WHICH call is
              running they are meaningful non-text content and 1.4.11's 3:1
              binds, which they fail in light by a wide margin. Two indicators
              of different things in one 300px column is worse than one. */}
          {!runStage?.twoStep && (
            <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
              {phases.map((phase, index) => (
                <span
                  key={phase}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-colors duration-300',
                    index === activePhase ? 'bg-primary' : 'bg-border',
                  )}
                />
              ))}
            </div>
          )}

          {processingNote && (
            <p className="text-muted-foreground text-xs leading-5">{processingNote}</p>
          )}
        </div>
      </div>
    </div>
  );
};
