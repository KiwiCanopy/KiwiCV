import { type MouseEvent, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { DiffDecisionRow } from '@/features/dashboard/editor/proposals/DiffDecisionRow';
import { type ProseDiffModel } from '@/features/dashboard/editor/proposals/types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProseDiffRowProps {
  /** ⚠️ The model itself, not the row. `row.prose` is nullable, and taking the
   *  row meant a non-null assertion whose invariant lived only in the caller —
   *  a second call site would have thrown and blanked the editor. */
  prose: ProseDiffModel;
  label: string;
  /** Takes the event: the panel gates its handoff on `isKeyboardActivation`. */
  onAccept: (event: MouseEvent<HTMLButtonElement>) => void;
  onDecline: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** Paragraphs past this are folded away until the reader asks for them. */
const COLLAPSED_MAX_HEIGHT = 'max-h-[22rem]';

/**
 * A long prose field's proposal — the cover letter's body.
 *
 * ⚠️ **Compared by toggling, never by aligning.** The bullet marks
 * `EntryDiffRow` uses were built for `highlights` and `keywords`: short,
 * order-insensitive entries where "these appeared, those went" reads correctly.
 * Measured against a real 11-paragraph letter they render **2,869px at
 * 1440×900 and 5,205px on a phone** — three to six screens of tinted,
 * struck-through prose sitting above the letter it describes, at ~5:1 where
 * `--foreground` gives 15.86:1. Paragraph-by-paragraph pairing is worse still:
 * the count is asked for in the prompt with nothing enforcing it, so one merged
 * paragraph shifts every index below and the comparison starts lying.
 *
 * So: one version at a time, whichever the toggle names, at full width and full
 * legibility. The pattern is `ReorgDiffPanel`'s, which
 * [UI_PATTERNS.md](../../../../../.agent/wiki/code/UI_PATTERNS.md) already rules
 * for exactly this shape — a long AI diff in a narrow editor column.
 *
 * ⚠️ Rendered as text, not as a disabled control: selectable and copyable, so a
 * reader who wants one sentence of their own wording back can take it, and
 * plainly not typeable, because the real editor is directly below.
 */
export function ProseDiffRow({ prose, label, onAccept, onDecline }: ProseDiffRowProps) {
  const { t } = useTranslation();
  // Defaults to the proposal because the proposal is already applied and the
  // preview beside this is already showing it. `ReorgDiffPanel:18` for the same
  // reason.
  const [view, setView] = useState<'proposal' | 'mine'>('proposal');
  const [expanded, setExpanded] = useState(false);

  /**
   * ⚠️ Measured, not guessed from a paragraph count. A short letter fits inside
   * the cap, and a fold control over nothing is a dead control — `.claude/rules/
   * ui.md` keeps unavailable controls visible and disabled *with a reason*, and
   * the honest version of that here is not to offer one at all.
   */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;
    setOverflows(node.scrollHeight > node.clientHeight + 1);
  }, [prose, expanded]);

  const showingProposal = view === 'proposal';
  const paragraphs = showingProposal ? prose.proposal : prose.mine;
  const countChanged = prose.mine.length !== prose.proposal.length;

  /**
   * What changed, before a word of it is read. Counting is safe where pairing is
   * not — and when the counts differ, that difference IS the summary and the
   * per-paragraph hints below drop out.
   */
  const summary = countChanged
    ? t('ai.diff_prose_count_changed', {
        proposed: prose.proposal.length,
        original: prose.mine.length,
      })
    : t('ai.diff_prose_rewritten', {
        count: prose.changedCount,
        total: prose.proposal.length,
      });

  // ⚠️ Two literal calls, not one call with a computed key. `i18n:check` reads
  // the sources to know which keys are live, and a key it cannot see is a key it
  // will happily let someone delete.
  const percent = Math.abs(prose.lengthDeltaPercent);
  /**
   * ⚠️ Suppressed when the paragraph count changed, and that is a rendering fix
   * rather than a preference: `diff_prose_count_changed` is a full sentence with
   * a terminal period, so appending gave "…instead of 11. · about 23% shorter".
   * Making it a fragment instead would mean re-translating 15 locale files for a
   * line that is secondary anyway — when the count moved, the count is the news.
   */
  const lengthNote =
    countChanged || prose.lengthDeltaPercent === 0
      ? null
      : prose.lengthDeltaPercent < 0
        ? t('ai.diff_prose_shorter', { percent })
        : t('ai.diff_prose_longer', { percent });

  return (
    <DiffDecisionRow onAccept={onAccept} onDecline={onDecline}>
      {/* ⚠️ Order: label, summary, toggle, body. The toggle sits against the
          thing it switches, which is what stops "Use the proposal" reading as
          "apply whatever is displayed" — it is a VIEW control and proximity is
          what says so. It also stops sharing a line with the panel header's
          accept-all cluster one row up. */}
      <p className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">{label}</p>

      {/* ⚠️ The summary is the only thing that says what changed, so it carries
          the weight the uppercase label used to. That label repeats the panel
          header and the section title; this line does not repeat anything. */}
      {/* ⚠️ The key to the marks rides on the summary rather than taking a row
          of its own: this line already says "N of M paragraphs rewritten", so the
          swatch lands in the sentence that states the count instead of repeating
          the word beneath it. It carries the SAME 2px rule the paragraphs do — a
          legend has to show the actual mark, or it stops being a legend — and it
          appears only where the marks do, since under "Your wording" there is
          nothing for it to label.

          ⚠️ `aria-hidden`, with no label of its own. The sentence beside it
          already says "rewritten", and every marked paragraph carries its own
          `sr-only` marker — a third copy of the word here would be read out
          before a count that then repeats it. */}
      <p className="text-foreground mt-1 mb-2 flex flex-wrap items-baseline gap-x-2 text-sm">
        {showingProposal && prose.changedCount > 0 && (
          <span
            data-mark-key
            className="border-l-primary-strong h-4 shrink-0 border-l-2"
            aria-hidden="true"
          />
        )}
        <span>
          {summary}
          {lengthNote && <span className="text-muted-foreground"> · {lengthNote}</span>}
        </span>
      </p>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SegmentedToggle
          value={view}
          onChange={setView}
          variant="pill"
          options={[
            { value: 'proposal', label: t('ai.diff_proposal') },
            { value: 'mine', label: t('ai.diff_mine') },
          ]}
        />

        {/* ⚠️ ABOVE the body it unfolds. Below it, pressing "Show the whole
            letter" pushed this very control 912px off-screen with focus still on
            it, so re-collapsing meant hunting for it — the defect UI_PATTERNS
            already rules on for the composer bar's Collapse ("only the rows
            below move"). Rendered only when something is actually folded. */}
        {(overflows || expanded) && (
          <Button
            variant="quiet"
            size="sm"
            onClick={() => setExpanded((open) => !open)}
            // Not `aria-expanded`: nothing expands for assistive tech. The fold
            // is `max-h` + `overflow-hidden`, so every paragraph stays in the
            // accessibility tree either way and a screen reader already has the
            // whole letter. `aria-pressed` states the control's own state
            // without claiming a disclosure that is not happening.
            aria-pressed={expanded}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
            {expanded ? t('ai.diff_prose_show_less') : t('ai.diff_prose_show_all')}
          </Button>
        )}
      </div>

      {/* ⚠️ Capped, not scrolled. A nested scroller inside the already-scrolling
          entry column is where people lose their place, and most readers are
          checking the shape of the letter rather than proof-reading it here.

          ⚠️ No `transition-[max-height]`. It never ran — expanding drops the cap
          rather than raising it, and `max-height` cannot animate to `none` — and
          `.claude/rules/ui.md` forbids transitioning a layout property in the
          word "never". */}
      <div
        ref={bodyRef}
        // Named so a screen-reader user knows which of the two versions they are
        // in; the toggle above is the control, this is what it switched.
        role="group"
        aria-label={showingProposal ? t('ai.diff_proposal') : t('ai.diff_mine')}
        className={cn(
          'space-y-3',
          // ⚠️ A reading ceiling, not just a floor. `EntryDiffRow` one file over
          // splits at 48rem to protect ~45 characters per line; unbounded, this
          // body measured 109 at a 1045px panel. Legibility is the whole reason
          // this row exists.
          //
          // ⚠️ `rem`, not `ch`. `ch` is the width of the digit ZERO, which in
          // this face is 10.1px against 7.5px for average lowercase prose — so
          // `max-w-[72ch]` measured **97** characters per line, not 72. 34rem is
          // 544px, which measures ~72.
          'max-w-[34rem]',
          // A mask fades the CONTENT, so it needs no gradient stop matched to
          // the panel's ground and works in both themes unchanged. Without it
          // the cap slices glyphs mid-band, which reads as a rendering fault.
          !expanded && `${COLLAPSED_MAX_HEIGHT} overflow-hidden mask-b-from-85%`,
        )}
      >
        {paragraphs.map((paragraph, index) => {
          const rewritten = showingProposal && prose.changed[index];
          return (
            <p
              key={`${view}-${index}`}
              className={cn(
                'text-foreground border-l-2 pl-3 text-sm leading-6',
                // A rule, not a tint. Hue on a block of prose costs two thirds of
                // its legibility to say something the summary line says better —
                // and `border-l-transparent` keeps every paragraph on one margin.
                rewritten ? 'border-l-primary-strong' : 'border-l-transparent',
              )}
            >
              {/* ⚠️ The rule is the only per-paragraph signal, and a rule is not
                  readable. `EntryDiffRow` solved the same problem next door with
                  `sr-only` marks; without this a screen-reader user gets the
                  aggregate count and no way to tell which paragraph moved. */}
              {rewritten && <span className="sr-only">{t('ai.diff_paragraph_rewritten')} </span>}
              {paragraph.trim() === '' ? (
                <span className="text-muted-foreground italic opacity-70">
                  {t('ai.diff_empty')}
                </span>
              ) : (
                paragraph
              )}
            </p>
          );
        })}
      </div>
    </DiffDecisionRow>
  );
}
