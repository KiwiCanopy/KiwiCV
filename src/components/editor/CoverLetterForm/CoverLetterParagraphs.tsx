import { useLayoutEffect, useRef, useState } from 'react';

import {
  type MarkerEdit,
  insertLink,
  isSymmetricMarkerActive,
  toggleSymmetricMarker,
} from '@/components/editor/CoverLetterForm/markerEdit';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { InfoBox } from '@/components/ui/InfoBox';
import { LockedReason } from '@/components/ui/LockedReason';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/Popover';
import {
  type FieldLock,
  LOCKED_BUTTON_CLASS,
  LOCKED_CONTROL_CLASS,
  lockedReasonId,
} from '@/components/ui/fieldLock';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Bold, CircleQuestionMark, Italic, Link2 } from 'lucide-react';

const BOLD = '**';
const ITALIC = '_';

/** Paragraphs are stored one per array entry; the editor joins them with a
 * blank line and splits back on any run of blank lines. */
const joinParagraphs = (paragraphs: string[]) => paragraphs.join('\n\n');
const splitParagraphs = (buffer: string) =>
  buffer
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

interface CoverLetterParagraphsProps {
  paragraphs: string[];
  onCommit: (paragraphs: string[]) => void;
  /** Locks the body while a pending AI proposal covers it; same contract as `TextArea`'s. */
  lock: FieldLock | null | undefined;
}

/**
 * The letter body: a formatting toolbar (bold / italic / link) over a plain
 * `<textarea>`. No contentEditable — the toolbar splices the same markdown
 * markers a user could type by hand around the current selection.
 *
 * The buffer is local and only flushed to the store on blur, mirroring the
 * shared `TextArea`'s commit-on-blur so toolbar edits and typing never trigger
 * a Typst recompile mid-keystroke.
 */
export function CoverLetterParagraphs({ paragraphs, onCommit, lock }: CoverLetterParagraphsProps) {
  const { t } = useTranslation();
  const external = joinParagraphs(paragraphs);
  const ref = useRef<HTMLTextAreaElement>(null);

  const [buffer, setBuffer] = useState(external);
  const [prevExternal, setPrevExternal] = useState(external);
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Selection to reapply after a toolbar edit re-renders the textarea.
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);
  // Buffer + selection snapshotted when the link popover opens. Its input
  // autofocuses, which blurs the textarea and runs `commit()`; if that
  // normalizes the text the store round-trip replaces `buffer` and the offsets
  // no longer line up. Splicing into this snapshot keeps the link on the text
  // the user actually selected.
  const linkSnapshot = useRef({ start: 0, end: 0, buffer: '' });

  // Adopt outside changes (store commit, undo/redo, import) only while idle, so
  // an in-flight edit is never clobbered — same guard as Input/TextArea.
  if (external !== prevExternal) {
    setPrevExternal(external);
    if (!isFocused) setBuffer(external);
  }

  // A link half-entered when the lock arrives has nowhere left to go.
  if (lock && linkOpen) setLinkOpen(false);

  useLayoutEffect(() => {
    if (pendingSelection.current && ref.current) {
      const { start, end } = pendingSelection.current;
      pendingSelection.current = null;
      ref.current.focus();
      ref.current.setSelectionRange(start, end);
      setSelection({ start, end });
    }
  }, [buffer]);

  const liveSelection = () => {
    const el = ref.current;
    return el ? { start: el.selectionStart, end: el.selectionEnd } : selection;
  };

  // The toolbar, its shortcuts and the link popover all write through here.
  const applyEdit = (edit: MarkerEdit) => {
    if (lock) return;
    setBuffer(edit.text);
    pendingSelection.current = { start: edit.selectionStart, end: edit.selectionEnd };
  };

  const toggleMarker = (marker: string) => {
    const { start, end } = liveSelection();
    applyEdit(toggleSymmetricMarker(buffer, start, end, marker));
  };

  const commit = () => {
    const next = splitParagraphs(buffer);
    // Typed before the lock arrived: kept as the user's side, not written over the proposal.
    if (lock) {
      const mine = Array.isArray(lock.mine) ? lock.mine.map((entry) => String(entry ?? '')) : [];
      if (buffer !== external && buffer !== joinParagraphs(mine)) lock.keepTyped?.(next);
      setBuffer(external);
      return;
    }
    if (joinParagraphs(next) !== external) onCommit(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      toggleMarker(BOLD);
    } else if (key === 'i') {
      e.preventDefault();
      toggleMarker(ITALIC);
    }
  };

  const openLink = () => {
    if (lock) return;
    const { start, end } = liveSelection();
    linkSnapshot.current = { start, end, buffer };
    setLinkUrl('');
    setLinkOpen(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url) {
      const { start, end, buffer: snapshot } = linkSnapshot.current;
      applyEdit(insertLink(snapshot, start, end, url, 'link text'));
    }
    setLinkOpen(false);
  };

  // Locked, the textarea shows the stored text, so the toolbar reads that too.
  const shown = lock ? external : buffer;
  const boldActive = isSymmetricMarkerActive(shown, selection.start, selection.end, BOLD);
  const italicActive = isSymmetricMarkerActive(shown, selection.start, selection.end, ITALIC);

  const controlId = 'cover-letter-body';
  const lockedId = lock ? lockedReasonId(controlId) : undefined;
  const lockedToolbarProps = lock ? { 'aria-disabled': true, 'aria-describedby': lockedId } : {};

  return (
    <div className="w-full">
      {/* The section header carries the name and the `?` now — a visible label
          here just restated the section title one line above it. This stays so
          the textarea keeps an accessible name; removing it outright would
          leave the control unlabelled for a screen reader. */}
      <label htmlFor={controlId} className="sr-only">
        {t('editor.coverLetter.body_label')}
      </label>
      <LockedReason controlId={controlId} lock={lock} />

      {/* Toolbar */}
      <div className="border-input bg-muted/40 flex items-center gap-1 rounded-t-md border border-b-0 px-2 py-1.5">
        <IconButton
          type="button"
          variant="quiet"
          label={t('editor.coverLetter.bold')}
          title={t('editor.coverLetter.bold_title')}
          aria-pressed={boldActive}
          {...lockedToolbarProps}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleMarker(BOLD)}
          className={cn(
            'h-9 w-9',
            boldActive && 'bg-primary/15 text-primary-strong',
            lock && LOCKED_BUTTON_CLASS,
          )}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </IconButton>
        <IconButton
          type="button"
          variant="quiet"
          label={t('editor.coverLetter.italic')}
          title={t('editor.coverLetter.italic_title')}
          aria-pressed={italicActive}
          {...lockedToolbarProps}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleMarker(ITALIC)}
          className={cn(
            'h-9 w-9',
            italicActive && 'bg-primary/15 text-primary-strong',
            lock && LOCKED_BUTTON_CLASS,
          )}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </IconButton>

        <Popover open={linkOpen} onOpenChange={(open) => (open ? openLink() : setLinkOpen(false))}>
          <PopoverAnchor asChild>
            <IconButton
              type="button"
              variant="quiet"
              label={t('editor.coverLetter.insert_link')}
              title={t('editor.coverLetter.insert_link')}
              aria-pressed={linkOpen}
              {...lockedToolbarProps}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => (linkOpen ? setLinkOpen(false) : openLink())}
              className={cn(
                'h-9 w-9',
                linkOpen && 'bg-primary/15 text-primary-strong',
                lock && LOCKED_BUTTON_CLASS,
              )}
            >
              <Link2 className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            className="w-64 p-3"
            // Closed by an arriving lock, focus would drop to <body>: hand it to the body text.
            onCloseAutoFocus={(event) => {
              if (!lock) return;
              event.preventDefault();
              ref.current?.focus();
            }}
          >
            <label htmlFor="cover-letter-link-url" className="text-foreground text-xs font-medium">
              {t('editor.coverLetter.link_url')}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="cover-letter-link-url"
                type="url"
                value={linkUrl}
                autoFocus
                placeholder="https://example.com"
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                className="border-input bg-background text-foreground focus:border-primary-strong focus:ring-primary-strong/20 w-full rounded-md border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none"
              />
              <Button type="button" size="sm" onClick={applyLink}>
                {t('editor.coverLetter.add')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* The hint describes these three controls, so it lives with them
            rather than beside the section title. The toolbar is a plain div,
            so the InfoBox trigger is not nested inside another button here —
            in the section header it would have been. */}
        <InfoBox position="top" content={t('editor.coverLetter.format_hint')} className="ml-1 flex">
          <CircleQuestionMark
            className="text-muted-foreground/60 hover:text-primary-strong h-4 w-4 cursor-help transition-colors"
            aria-hidden="true"
          />
        </InfoBox>
      </div>

      <textarea
        id={controlId}
        ref={ref}
        value={shown}
        readOnly={Boolean(lock)}
        aria-disabled={lock ? true : undefined}
        aria-describedby={lockedId}
        rows={10}
        placeholder={t('editor.coverLetter.body_placeholder')}
        onChange={(e) => setBuffer(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commit();
        }}
        onKeyDown={handleKeyDown}
        onSelect={(e) =>
          setSelection({
            start: e.currentTarget.selectionStart,
            end: e.currentTarget.selectionEnd,
          })
        }
        className={cn(
          'border-input bg-background text-foreground focus:border-primary-strong focus:ring-primary-strong/20 w-full resize-y rounded-b-md border px-3 py-2 text-sm leading-6 shadow-sm transition-all focus:ring-2 focus:outline-none',
          lock && LOCKED_CONTROL_CLASS,
        )}
      />
    </div>
  );
}
