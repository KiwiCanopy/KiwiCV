import { useEffect, useId, useRef } from 'react';

import { CharCounter } from '@/components/ui/CharCounter';
import { TextArea } from '@/components/ui/TextArea';
import { useCharCapNotice } from '@/components/ui/useCharCapNotice';
import { type ComposerMode } from '@/features/dashboard/editor/composer/types';
import { useTranslation } from '@/hooks/useTranslation';

interface AIComposerFieldProps {
  mode: ComposerMode;
  value: string;
  onChange: (value: string) => void;
  charLimit: number;
  /**
   * Bumped by the bar each time the user *asks* for this field — opening the
   * band, or choosing a mode that needs one. Focus follows the request rather
   * than the mount, so arriving on a page with the band already open does not
   * pull the caret out of whatever the user was doing.
   */
  focusSignal: number;
}

/**
 * The job-ad / instructions field. **One state: a real six-row textarea.**
 *
 * ⚠️ It used to have two heights, and the resting one was a `button` showing the
 * value truncated — which made the most field-like thing in the bar the one
 * thing you could not put a caret into. A click could only ever open it, never
 * position; fixing one word meant opening the big editor first.
 *
 * ⚠️ **The two-state field is gone, and so is everything that propped it up**:
 * a deferred `requestCollapse` timer, a blur handler that had to skip when focus
 * merely moved to another control in the same bar, an `autoFocus` racing the
 * unmount of the button that had focus, and an explicit Collapse control to give
 * keyboard users a route back. All of it existed to keep the *band* short at
 * rest — and the band now collapses on its own, so the field was doing a job
 * that had already been taken over.
 *
 * The value lives in `useAIComposer`, so hiding the band never loses a paste.
 */
export function AIComposerField({
  mode,
  value,
  onChange,
  charLimit,
  focusSignal,
}: AIComposerFieldProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cap = useCharCapNotice(value.length, charLimit);
  const handleChange = cap.track(onChange);

  // ⚠️ Keyed on the signal, not on mount. The caret goes to the *end* of what is
  // already there: opening a field that already holds a pasted ad is someone
  // continuing, not restarting.
  useEffect(() => {
    if (focusSignal === 0) return;
    const node = textAreaRef.current;
    if (!node) return;
    node.focus();
    const end = node.value.length;
    node.setSelectionRange(end, end);
  }, [focusSignal]);

  const isJob = mode === 'job_description';
  const hasValue = value.trim().length > 0;
  const label = isJob ? t('ai.job_description') : t('ai.custom_instructions');
  /**
   * ⚠️ The caution is the *placeholder* while the field is empty, and only moves
   * below once there is text. A link pasted into an empty field is the mistake,
   * and a note that sits under the box arrives after the user has already made
   * it — so it has to be in the box they are about to paste into. Once they
   * have, it has done its job and steps out of the way of what they wrote.
   *
   * The label above the field already says "Job Description", so the caution
   * does not cost the prompt it replaces.
   */
  const caution = isJob ? t('ai.composer_paste_not_link') : t('ai.composer_custom_empty');

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="text-muted-foreground mb-1 block text-[0.7rem] font-semibold tracking-wide uppercase"
      >
        {label}
      </label>
      <TextArea
        ref={textAreaRef}
        id={fieldId}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        aria-describedby={cap.counter.id}
        placeholder={caution}
        rows={6}
        maxLength={charLimit}
        immediate
      />
      <div className="mt-1 flex items-center justify-between gap-3">
        {/* Empty, this line is not drawn at all: the same sentence is already
            in the box above. `min-w-0` keeps the counter on the right either
            way. */}
        <p className="text-muted-foreground min-w-0 text-xs">{hasValue ? caution : ''}</p>
        <CharCounter {...cap.counter} className="shrink-0 text-xs tabular-nums" />
      </div>
    </div>
  );
}
