import { useId } from 'react';

import { Button } from '@/components/ui/Button';
import { EntryDiffRow } from '@/features/dashboard/editor/proposals/EntryDiffRow';
import {
  type DiffFieldLabels,
  type DiffValueFormatters,
  useEntryDiff,
} from '@/features/dashboard/editor/proposals/useEntryDiff';
import { useProposalDecisionAnnouncement } from '@/features/dashboard/editor/proposals/useProposalDecisionAnnouncement';
import { useProposalFocusHandoff } from '@/features/dashboard/editor/proposals/useProposalFocusHandoff';
import { useTranslation } from '@/hooks/useTranslation';
import { type AITargetKey } from '@/utils/aiTarget';
import { cn } from '@/utils/cn';
import { isKeyboardActivation } from '@/utils/focus';
import { Sparkles } from 'lucide-react';

interface EntryDiffPanelProps<T> {
  /** `undefined` for an entry AI cannot touch; the panel then renders nothing. */
  target: AITargetKey | undefined;
  /** Field name to visible label. A field with no entry falls back to its key. */
  fieldLabels: DiffFieldLabels<T>;
  /** Overrides the accordion-card insets for the section-level use in Basics. */
  className?: string;
  /**
   * Fields to compare by toggling between the two versions instead of by
   * marking entries — a cover letter's body. Named explicitly rather than
   * inferred from length: an invisible threshold cannot be checked by eye.
   */
  proseFields?: readonly (keyof T & string)[];
  /** How a non-text value reads in the panel — a level number as its name. */
  valueFormatters?: DiffValueFormatters<T>;
  /**
   * The entry's visible name, added to the panel's accessible name so two
   * panels in one list are told apart in a landmark list.
   */
  entryName?: string;
}

/**
 * What the AI proposed for one entry, as a panel under that entry's header,
 * visible whether or not the entry is expanded.
 *
 * ⚠️ The proposal is already applied — the preview is showing it right now. So
 * "Use the proposal" only drops the pending marker, and "Keep mine" is the one
 * that writes: it puts the user's wording back. Until one is chosen, each field
 * a row names is locked in the form below (`useLockedFields`), so this panel is
 * the only place that field changes.
 */
export function EntryDiffPanel<T extends object>({
  target,
  fieldLabels,
  className,
  proseFields,
  valueFormatters,
  entryName,
}: EntryDiffPanelProps<T>) {
  const { t } = useTranslation();
  const headingId = useId();
  const nameId = useId();
  const { rows, hasDiff, acceptField, declineField, acceptAll, declineAll } = useEntryDiff(
    target,
    fieldLabels,
    proseFields,
    valueFormatters,
  );
  // ⚠️ Called before the early return: deciding the last row makes `hasDiff`
  // false, and this component is the only part of the panel still mounted when
  // that happens — which is exactly when focus needs somewhere to go.
  const { panelRef, armHandoff } = useProposalFocusHandoff(rows.length);
  const { announcement, armAnnouncement } = useProposalDecisionAnnouncement(rows.length);

  // ⚠️ Outside the section and rendered first, so it is the same node before and
  // after the last row clears: a live region mounted already populated is not
  // announced, and one inside the section unmounts with it.
  const liveRegion = (
    <span className="sr-only" role="status" aria-live="polite">
      {announcement}
    </span>
  );

  if (!target) return null;
  if (!hasDiff) return liveRegion;

  return (
    <>
      {liveRegion}
      <section
        ref={panelRef}
        data-ai-pending="entry"
        aria-labelledby={entryName ? `${headingId} ${nameId}` : headingId}
        /* ⚠️ `@container`, so the row below can size itself against THIS box rather
         than the viewport or the pane. The panel is inset differently at its two
         mount sites — section-level in Basics, accordion-nested in a list — so
         neither outer width predicts how much room a column actually gets.

         ⚠️ Removing this does NOT fall back to one column. Every `Section`
         variant declares `@container` too, so the query would resolve against
         the enclosing Section instead — silently restoring the pane-relative
         sizing this exists to fix. `proseDiffRow.test.tsx` asserts both halves
         for that reason. */
        className={cn(
          'border-kiwi/40 bg-kiwi/5 @container mx-3 mb-3 rounded-xl border sm:mx-4',
          className,
        )}
      >
        <header className="border-border/60 flex flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-4">
          <Sparkles className="text-primary-strong h-4 w-4 shrink-0" aria-hidden="true" />
          <p id={headingId} className="text-foreground min-w-0 flex-1 text-sm font-semibold">
            {t('ai.diff_fields', { count: rows.length })}
          </p>
          {entryName && (
            <span id={nameId} className="sr-only">
              {entryName}
            </span>
          )}
          {/* ⚠️ Only past one row. With a single changed field the header's
            buttons would repeat the row's own, word for word — two identical
            "Use the proposal" controls, one of which quietly means "and
            everything else too". */}
          {rows.length > 1 && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {/* Same order and same variants as the row buttons below, so one panel
                teaches one colour for one meaning (`.claude/rules/ui.md`). */}
              {/* ⚠️ "Keep all N", not "Keep mine". With two rewritten fields the
                tree held THREE controls named "Keep mine" — one discarding every
                proposal, two discarding a single field — which a screen-reader
                user browsing by button list cannot tell apart, and a voice-control
                user cannot address. The accept side already qualified itself
                ("Use all 2"); the decline side did not. */}
              <Button
                variant="secondary"
                size="sm"
                className="border-input"
                onClick={(event) => {
                  armHandoff(0, 'decline', isKeyboardActivation(event));
                  armAnnouncement('decline', null);
                  declineAll();
                }}
              >
                {t('ai.diff_keep_all', { count: rows.length })}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={(event) => {
                  armHandoff(0, 'accept', isKeyboardActivation(event));
                  armAnnouncement('accept', null);
                  acceptAll();
                }}
              >
                {t('ai.diff_replace_all', { count: rows.length })}
              </Button>
            </div>
          )}
        </header>

        <ul>
          {rows.map((row, index) => (
            <EntryDiffRow
              key={row.field}
              row={row}
              onAccept={(event) => {
                armHandoff(index, 'accept', isKeyboardActivation(event));
                armAnnouncement('accept', row.label);
                acceptField(row.field);
              }}
              onDecline={(event) => {
                armHandoff(index, 'decline', isKeyboardActivation(event));
                armAnnouncement('decline', row.label);
                declineField(row.field);
              }}
            />
          ))}
        </ul>

        {/* ⚠️ One clause, not two. "The preview already shows the proposal."
          used to lead here and was dropped: it explained an IMPLEMENTATION fact
          the reader needs in order to understand nothing, and it was measurably
          false the moment anyone edited the live field — the preview then showed
          neither version in the panel while the sentence still claimed one. Two
          clauses also read as an explanation rather than a caution, which is why
          the owner took the whole footer for something panel-specific.

          What remains states an irreversible consequence, which the design
          language asks for and which is the only warning about the edit-then-
          decline path the store now guards. */}
        <p className="text-muted-foreground border-border/60 border-t px-3 py-2 text-xs sm:px-4">
          {t('ai.diff_history_note')}
        </p>
      </section>
    </>
  );
}
