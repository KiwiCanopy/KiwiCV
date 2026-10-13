import React, { useId, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { CharCounter } from '@/components/ui/CharCounter';
import { TextArea } from '@/components/ui/TextArea';
import { useCharCapNotice } from '@/components/ui/useCharCapNotice';
import { COVER_LETTER_STYLE_MAX } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

interface CoverLetterStyleFieldProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  /**
   * The field sits on a tint rather than plain `--card`.
   *
   * ⚠️ Then Clear needs an edge. `quiet` is borderless by a decision measured on
   * `--card`, where the fill and the surface are 1.00:1 and the label carries
   * the control; on a tinted panel there is neither fill nor edge, so the button
   * is not there at all. `.claude/rules/ui.md`, owner 2026-09-03 — cite it
   * rather than re-arguing it, and do not widen it to the plain card.
   */
  onTintedSurface?: boolean;
  /**
   * The surface already names this field, so it must not name itself again.
   *
   * ⚠️ In the sample dialog the heading IS the field's name. Left on, the
   * visible label sat 30px under a title that said something DIFFERENT —
   * "Match my writing style" beneath "Your writing sample" — which is the
   * two-names-for-one-thing defect that dialog was built to remove. The
   * accessible name comes from the same key as the heading, so Label in Name
   * (2.5.3) holds by construction.
   */
  labelledByHeading?: string;
}

/**
 * "Match my writing style": a sample of the user's own prose, or an instruction
 * describing a voice, which the cover-letter call takes manner from.
 *
 * ⚠️ Controlled, like every sibling in this family. The request reads what is on
 * screen; a field owning its own copy would hand the run a value up to one
 * debounce window old.
 */
export const CoverLetterStyleField: React.FC<CoverLetterStyleFieldProps> = ({
  value,
  onChange,
  onClear,
  onTintedSurface = false,
  labelledByHeading,
}) => {
  const { t } = useTranslation();
  const textArea = useRef<HTMLTextAreaElement>(null);
  const noteId = useId();

  // The cap is otherwise silent to a screen reader (WCAG 4.1.3): `maxLength`
  // drops further keystrokes with no feedback at all.
  const cap = useCharCapNotice(value.length, COVER_LETTER_STYLE_MAX);
  const handleChange = cap.track(onChange);

  /**
   * ⚠️ Focus moves back to the field. Clear removes itself from the DOM — the
   * branch it lives in is gated on `value` — so without this the browser has no
   * successor and drops focus to `<body>`, losing a keyboard user's place
   * silently.
   */
  const handleClear = () => {
    onClear();
    textArea.current?.focus();
  };

  return (
    <div className="space-y-1">
      <TextArea
        ref={textArea}
        label={labelledByHeading ? undefined : t('ai.style_sample_label')}
        aria-label={labelledByHeading}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t('ai.style_sample_placeholder')}
        rows={6}
        maxLength={COVER_LETTER_STYLE_MAX}
        immediate
        // The counter and the remembered-note are the field's own description:
        // reachable on demand rather than only by reading past the control.
        //
        // ⚠️ Two ids, not the row that holds them. The row also carries the
        // Clear button, and a button inside a description is flattened into it
        // — the field announced "Saved on this device Clear 4,750 / 5,000" and
        // the button was then reachable again on its own (found in the
        // same audit). The same trap `AICoverLetterControl` avoids for its own exit.
        // ⚠️ A plain join, never `cn()`. `cn` is tailwind-merge: it is entitled
        // to drop or reorder tokens it reads as conflicting utilities, and this
        // is an id list. Inert with today's `useId` output, which is exactly the
        // kind of "works by luck" the description of the app's only
        // 5,000-character field should not rest on.
        aria-describedby={[value && noteId, cap.counter.id].filter(Boolean).join(' ')}
      />

      <div className="flex items-center gap-3">
        {/* Only when populated: an empty field is ambiguous between *cleared*
            and *never set*, and only one of those needs explaining. */}
        {value && (
          <>
            {/* Borrowed from the CV library's subtree, which carries this
                sentence in all 15 locales. `i18n:check` catches its deletion. */}
            <span id={noteId} className="text-muted-foreground text-[10px] font-medium">
              {t('cvs.saved_on_device')}
            </span>
            <Button
              variant="quiet"
              size="sm"
              onClick={handleClear}
              className={cn(onTintedSurface && 'border-input')}
            >
              {t('common.clear')}
            </Button>
          </>
        )}

        <CharCounter {...cap.counter} className="ml-auto text-[10px]" />
      </div>
    </div>
  );
};
