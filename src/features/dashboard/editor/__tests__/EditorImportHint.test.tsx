// @vitest-environment jsdom
import { EditorImportHint } from '@/features/dashboard/editor/EditorImportHint';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'editor.import_hint.question': 'Already have a CV?',
        'editor.import_hint.action': 'Import it',
      })[key] ?? key,
  }),
}));

describe('EditorImportHint', () => {
  it('opens the import dialog from its link button', async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    const { container } = render(<EditorImportHint onImport={onImport} />);

    expect(screen.getByText('Already have a CV?', { exact: false })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Import it' }));

    expect(onImport).toHaveBeenCalledOnce();
    expect((await axe(container)).violations).toEqual([]);
  });
});
