import { useRef, useState } from 'react';

import { startCoverLetterDraft } from '@/components/editor/CoverLetterForm/coverLetterDraft';
import { AISuggestButton } from '@/components/ui/AISuggestButton';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/Popover';
import { COVER_LETTER_ICON } from '@/data/sections';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { sectionTarget } from '@/utils/aiTarget';
import { focusIfPossible } from '@/utils/focus';
import { Briefcase } from 'lucide-react';

/**
 * The Cover Letter section's one AI control, and the choice behind it.
 *
 * ⚠️ `PopoverAnchor`, never `PopoverTrigger`: `AISuggestButton.handleClick`
 * opens with `stopPropagation()`, so a trigger never sees the click. The anchor
 * then owes the disclosure state and the close-focus restore Radix would have
 * wired itself — `code/UI_PATTERNS.md` § One AI Control Per Section.
 */
export function CoverLetterAIMenu({
  letterHasText,
  sectionLabel,
}: {
  letterHasText: boolean;
  /** The rail's own name for this section, so the button is named as the header is. */
  sectionLabel: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const openAIModal = useResumeStore((state) => state.openAIModal);

  // ⚠️ Close before opening the modal. `PopoverContent` is `z-[250]` and
  // `AIModalTemplate` is `z-[70]`, so a menu left open floats over the dialog
  // it just launched.
  // ⚠️ Focus goes back to the section's button BEFORE the action: the dialog
  // takes whatever is focused as the opener to return to, and the menu row
  // pressed here unmounts with the menu.
  const run = (action: () => void) => {
    setOpen(false);
    focusIfPossible(anchorRef.current?.querySelector('button'));
    action();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <span className="inline-flex" ref={anchorRef}>
          <AISuggestButton
            target={sectionTarget('coverLetter')}
            size="sm"
            ariaLabel={t('ai.optimize_section', { section: sectionLabel })}
            targetName={sectionLabel}
            onIdleActivate={() => setOpen(true)}
            expanded={open}
          />
        </span>
      </PopoverAnchor>
      {/* `w-64`, not `SectionItemMenu`'s `w-56`: the labels wrap at 224px.
          `text-left` because `justify-start` aligns the flex items, not a
          wrapped second line. */}
      <PopoverContent
        align="end"
        className="w-64 p-1.5"
        aria-label={t('ai.cover_letter_choose')}
        /* ⚠️ Radix restores through `triggerRef`, which an ANCHOR never sets —
           so closing would leave focus on `<body>`, the WCAG 2.4.3 defect
           already fixed for dialogs. `code/UI_PATTERNS.md` § Focus Handoff When a
           Control Removes Itself. */
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          focusIfPossible(anchorRef.current?.querySelector('button'));
        }}
      >
        <div className="flex flex-col">
          <Button
            variant="quiet"
            size="sm"
            className="w-full justify-start text-left"
            onClick={() => run(startCoverLetterDraft)}
          >
            <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('ai.cover_letter_write_from_ad')}
          </Button>
          <Button
            variant="quiet"
            size="sm"
            className="w-full justify-start text-left"
            disabled={!letterHasText}
            /* ⚠️ `disabledReason`, never a sub-line: `Button` renders it outside
               the dimmed button (6.51:1 vs 2.68:1 inside) and it is what keeps
               the row `aria-disabled` rather than out of the tree. */
            disabledReason={letterHasText ? undefined : t('ai.cover_letter_improve_blocked')}
            onClick={() => run(() => openAIModal(sectionTarget('coverLetter')))}
          >
            <COVER_LETTER_ICON className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('ai.cover_letter_improve_this')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
