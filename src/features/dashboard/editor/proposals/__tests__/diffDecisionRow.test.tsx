// @vitest-environment jsdom
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { named, sourceFiles } from '@/test/sourceFiles';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * One shell for every proposal row: the `data-diff-*` contract is spelled
 * in `diffContract.ts` alone, and every row kind renders through
 * `DiffDecisionRow` rather than a look-alike of its own.
 */

const SELF = fileURLToPath(import.meta.url);
const SRC = resolve(dirname(SELF), '..', '..', '..', '..', '..');
const CONTRACT = 'features/dashboard/editor/proposals/diffContract.ts';

const appSources = (dir: string): string[] =>
  sourceFiles(dir, { extensions: ['.ts', '.tsx'], skip: [named('__tests__')] });

/** App files (tests excluded) that spell the attribute names out. */
const spellers = (): string[] =>
  appSources(SRC)
    .filter((file) => /data-diff-(row|action)/.test(readFileSync(file, 'utf8')))
    .map((file) => relative(SRC, file));

describe('the proposal row contract', () => {
  it('names data-diff-row and data-diff-action in diffContract.ts only', () => {
    expect(spellers()).toEqual([CONTRACT]);
  });

  it('renders one shell whatever the row body', () => {
    useResumeStore.setState((state) => ({
      resume: {
        ...state.resume,
        coverLetter: { ...state.resume.coverLetter, subject: 'New', paragraphs: ['a new', 'b'] },
      },
      ai: {
        ...state.ai,
        reorgSuggestion: null,
        suggestions: {
          'item:coverLetter': {
            originalValue: { subject: 'Old', paragraphs: ['a', 'b'], keywords: ['x', 'y'] },
            improvedValue: { subject: 'New', paragraphs: ['a new', 'b'], keywords: ['y', 'z'] },
            timestamp: 1,
          },
        },
      },
    }));

    const { container } = render(
      <EntryDiffPanel
        target="item:coverLetter"
        fieldLabels={{ subject: 'Subject', paragraphs: 'Body', keywords: 'Keywords' }}
        proseFields={['paragraphs']}
      />,
    );

    const rows = [...container.querySelectorAll('[data-diff-row]')];
    // Plain comparison, bullet marks and prose toggle — each body kind once.
    expect(rows).toHaveLength(3);
    expect(rows.some((row) => row.querySelector('.line-through'))).toBe(true);
    expect(rows.some((row) => row.querySelector('[role="group"]'))).toBe(true);

    // Guards a row kind that spreads `diffRowProps` onto its own `<li>` and
    // pair instead of wrapping its body in `DiffDecisionRow`.
    const shellOf = (row: Element) => ({
      rowClass: row.className,
      pairClass: row.lastElementChild!.className,
      buttons: [...row.lastElementChild!.querySelectorAll('button')].map((button) => [
        button.getAttribute('data-diff-action'),
        button.textContent,
        button.className,
      ]),
    });
    const [first, ...rest] = rows.map(shellOf);
    expect(first.buttons.map(([action, name]) => [action, name])).toEqual([
      ['decline', 'Keep mine'],
      ['accept', 'Use the proposal'],
    ]);
    for (const shell of rest) expect(shell).toEqual(first);
  });
});
