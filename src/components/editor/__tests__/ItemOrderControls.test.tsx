// @vitest-environment jsdom
import { ItemOrderControls } from '@/components/editor/ItemOrderControls';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars: Record<string, string | number> = {}) => {
      const labels: Record<string, string> = {
        'common.move_items': 'Move items',
        'common.move_up_named': 'Move “{{name}}” up, position {{position}} of {{total}}',
        'common.move_down_named': 'Move “{{name}}” down, position {{position}} of {{total}}',
        'common.moved_named': '“{{name}}” moved to position {{position}} of {{total}}',
      };
      return (labels[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(vars[name]),
      );
    },
  }),
}));

describe('ItemOrderControls', () => {
  it('provides named movement actions and announces the committed result', async () => {
    const user = userEvent.setup();
    const onMoveUp = vi.fn();
    const { container, rerender } = render(
      <ItemOrderControls
        itemLabel="Editor"
        position={2}
        total={3}
        onMoveUp={onMoveUp}
        onMoveDown={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Move “Editor” up, position 2 of 3' }));
    expect(onMoveUp).toHaveBeenCalledOnce();

    // The announcement reports the committed position, so it only appears once
    // the caller has actually applied the move.
    rerender(
      <ItemOrderControls
        itemLabel="Editor"
        position={1}
        total={3}
        onMoveUp={onMoveUp}
        onMoveDown={vi.fn()}
      />,
    );

    expect(screen.getByRole('status').textContent).toBe('“Editor” moved to position 1 of 3');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('does not announce success when the caller declines the move', async () => {
    const user = userEvent.setup();
    render(
      <ItemOrderControls
        itemLabel="Editor"
        position={2}
        total={3}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    );

    // Callers guard their own bounds and can silently no-op, leaving position
    // unchanged. Announcing success there would be a lie.
    await user.click(screen.getByRole('button', { name: 'Move “Editor” up, position 2 of 3' }));

    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('keeps focus on the movement controls after a move', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ItemOrderControls
        itemLabel="Editor"
        position={2}
        total={3}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Move “Editor” up, position 2 of 3' }));
    rerender(
      <ItemOrderControls
        itemLabel="Editor"
        position={1}
        total={3}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    );

    // Reaching the boundary disables the pressed button, which would otherwise
    // drop focus to <body>. Focus moves to the sibling instead.
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Move “Editor” down, position 1 of 3' }),
    );
  });

  it('keeps unavailable directions visible with a concise reason', () => {
    render(
      <ItemOrderControls
        itemLabel="Editor"
        position={1}
        total={1}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    );

    expect(
      (
        screen.getByRole('button', {
          name: 'Move “Editor” up, position 1 of 1',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole('button', {
          name: 'Move “Editor” down, position 1 of 1',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
