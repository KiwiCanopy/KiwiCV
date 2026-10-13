// @vitest-environment jsdom
import { TagEditorDialog } from '@/components/ui/tag-field/TagEditorDialog';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// useTranslation reads the locale off the resume/ui stores; a flat mock keeps
// the test focused on the dialog's save/cancel wiring, not on i18n plumbing.
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, string>) =>
      key === 'common.edit_field' ? `Edit ${vars?.field ?? ''}`.trim() : key,
  }),
}));

function renderDialog(overrides = {}) {
  const props = {
    id: 'tag-1',
    text: 'React',
    type: 'input' as const,
    label: 'Skills',
    singularLabel: 'Skill',
    onUpdate: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<TagEditorDialog {...props} />);
  return props;
}

describe('TagEditorDialog', () => {
  it('renders its editor into the portal with the field label', () => {
    renderDialog();
    // createPortal mounts into document.body — query via screen, not container.
    expect(screen.getByRole('heading', { name: /edit skill/i })).toBeTruthy();
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('React');
  });

  it('commits the edited text and closes on save', async () => {
    const user = userEvent.setup();
    const props = renderDialog();

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Vue');
    await user.click(screen.getByRole('button', { name: 'common.save' }));

    expect(props.onUpdate).toHaveBeenCalledWith('tag-1', 'Vue');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('discards edits and closes on cancel', async () => {
    const user = userEvent.setup();
    const props = renderDialog();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Discarded');
    await user.click(screen.getByRole('button', { name: 'common.cancel' }));

    expect(props.onUpdate).not.toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
