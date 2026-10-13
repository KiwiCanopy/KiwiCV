// @vitest-environment jsdom
import { EditorStartPanel } from '@/features/dashboard/editor/EditorStartPanel';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'landing.workflow.create.title': 'Create or import',
        'landing.workflow.create.description': 'Start fresh or bring in your existing CV.',
        'landing.hero.primary_action': 'Create your CV',
        'landing.hero.secondary_action': 'Import a CV',
      })[key] ?? key,
  }),
}));

describe('EditorStartPanel', () => {
  it('offers distinct create and import actions', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onImport = vi.fn();
    const { container } = render(<EditorStartPanel onCreate={onCreate} onImport={onImport} />);

    await user.click(screen.getByRole('button', { name: 'Create your CV' }));
    await user.click(screen.getByRole('button', { name: 'Import a CV' }));

    expect(onCreate).toHaveBeenCalledOnce();
    expect(onImport).toHaveBeenCalledOnce();
    expect((await axe(container)).violations).toEqual([]);
  });
});
