// @vitest-environment jsdom
import { useState } from 'react';

import { CoverLetterParagraphs } from '@/components/editor/CoverLetterForm/CoverLetterParagraphs';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, profile: null, isPremium: false, session: null }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'editor.coverLetter.insert_link': 'Insert link',
        'editor.coverLetter.add': 'Add',
      };
      return labels[key] ?? key;
    },
  }),
}));

/** Controlled parent, mirroring how the editor holds the paragraphs in the
 * store: `onCommit` replaces the array, which flows back in as new props. */
function Harness({ initial }: { initial: string[] }) {
  const [paragraphs, setParagraphs] = useState(initial);
  return (
    <CoverLetterParagraphs paragraphs={paragraphs} onCommit={setParagraphs} lock={undefined} />
  );
}

describe('CoverLetterParagraphs link insertion', () => {
  it('wraps the selected text even when the pre-link commit normalizes the buffer', () => {
    render(<Harness initial={['Dear world']} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    // Edit into a buffer whose commit will *normalize* to something different
    // from the current store value: a new leading paragraph and collapsible
    // blank-line run, so `onCommit` fires and the store round-trip replaces the
    // buffer — shifting every offset after the collapsed whitespace.
    const dirty = 'Intro\n\n\n\nDear world  ';
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: dirty } });

    // Select "world" against the dirty buffer.
    const start = dirty.indexOf('world');
    const end = start + 'world'.length;
    textarea.setSelectionRange(start, end);
    fireEvent.select(textarea);

    // Open the link popover (captures the selection + buffer snapshot), then the
    // popover's autofocus blurs the textarea and commits — normalizing the store
    // value and replacing the buffer under the stale offsets.
    fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));
    fireEvent.blur(textarea);

    fireEvent.change(screen.getByPlaceholderText('https://example.com'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    // The link must wrap "world", not the substring the stale offsets would
    // point at in the normalized buffer.
    expect(textarea.value).toContain('[world](https://example.com)');
  });
});
