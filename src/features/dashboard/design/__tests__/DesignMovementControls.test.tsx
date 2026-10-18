// @vitest-environment jsdom
import { SortableSectionItem } from '@/features/dashboard/design/layout/SortableSectionItem';
import { createSortingAnnouncements } from '@/features/dashboard/design/sortingAnnouncements';
import { EditorLayoutContext } from '@/features/dashboard/layout/EditorLayoutContext';
import { DndContext } from '@dnd-kit/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars: Record<string, string | number> = {}) => {
      const labels: Record<string, string> = {
        'common.move_up_named': 'Move “{{name}}” up, position {{position}} of {{total}}',
        'common.move_down_named': 'Move “{{name}}” down, position {{position}} of {{total}}',
        'common.moved_named': '“{{name}}” moved to position {{position}} of {{total}}',
        'design.more_actions_named': 'More actions for “{{name}}”',
        'design.swap_column_named': 'Move “{{name}}” to the other column',
        'common.cancel': 'Cancel',
        'common.success': 'Success',
        'design.layout_swap_tooltip': 'Move to other column',
        'design.page_break_tooltip': 'Add page break',
        'design.page_break_named': 'Page break before “{{name}}”',
        'common.move_up': 'Move up',
        'common.move_down': 'Move down',
        'common.move_items': 'Move items',
      };
      return (labels[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        String(vars[name]),
      );
    },
  }),
}));

// The row shows its move buttons or hides them in the overflow menu depending
// on the Design column's width, so every render has to say which one it is.
const layout = (width: number) => ({ width, isStandard: width > 560, isSocial: width > 650 });

const renderRow = (
  position: number,
  columnWidth: number,
  handlers: { onMoveUp: () => void; onMoveDown: () => void },
) => (
  <EditorLayoutContext.Provider value={layout(columnWidth)}>
    <DndContext>
      <SortableSectionItem
        id="work"
        label="Work"
        editTitle="Edit"
        onEdit={vi.fn()}
        visibilityTitle="Hide"
        onToggleVisibility={vi.fn()}
        onTogglePageBreak={vi.fn()}
        canSwap
        onSwap={vi.fn()}
        position={position}
        total={3}
        onMoveUp={handlers.onMoveUp}
        onMoveDown={handlers.onMoveDown}
      />
    </DndContext>
  </EditorLayoutContext.Provider>
);

describe('Design movement controls', () => {
  it('keeps named non-drag actions reachable from every section', async () => {
    const user = userEvent.setup();
    const moveUp = vi.fn();
    const handlers = { onMoveUp: moveUp, onMoveDown: vi.fn() };
    const { container, rerender } = render(renderRow(2, 800, handlers));

    // A wide column has room for the label, so movement stays in the overflow
    // menu and the row keeps to one line.
    expect(screen.getByRole('button', { name: 'Move “Work” to the other column' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Move “Work” up, position 2 of 3' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'More actions for “Work”' }));
    await user.click(screen.getByRole('button', { name: 'Move “Work” up, position 2 of 3' }));
    expect(moveUp).toHaveBeenCalledOnce();

    // The announcement reports the committed position, not a prediction.
    rerender(renderRow(1, 800, handlers));
    expect(screen.getByText('“Work” moved to position 1 of 3')).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('puts the move buttons on the row itself in a narrow column', async () => {
    const user = userEvent.setup();
    const moveDown = vi.fn();
    const handlers = { onMoveUp: vi.fn(), onMoveDown: moveDown };
    const { container } = render(renderRow(2, 375, handlers));

    // Visible without opening anything: the affordance a touch user can find
    // without knowing that a 250ms long-press starts a drag.
    await user.click(screen.getByRole('button', { name: 'Move “Work” down, position 2 of 3' }));
    expect(moveDown).toHaveBeenCalledOnce();

    // …and not offered a second time inside the menu. The menu copy carries
    // the same accessible name, so a duplicate would show up as a second node.
    await user.click(screen.getByRole('button', { name: 'More actions for “Work”' }));
    expect(screen.getAllByRole('button', { name: 'Move “Work” up, position 2 of 3' })).toHaveLength(
      1,
    );
    expect(
      screen.getAllByRole('button', { name: 'Move “Work” down, position 2 of 3' }),
    ).toHaveLength(1);

    expect((await axe(container)).violations).toEqual([]);
  });

  it('keeps the page-break toggle and its state on the row itself', async () => {
    const user = userEvent.setup();
    const onTogglePageBreak = vi.fn();
    const row = (hasPageBreak: boolean) => (
      <EditorLayoutContext.Provider value={layout(800)}>
        <DndContext>
          <SortableSectionItem
            id="work"
            label="Work"
            onEdit={vi.fn()}
            hasPageBreak={hasPageBreak}
            onTogglePageBreak={onTogglePageBreak}
          />
        </DndContext>
      </EditorLayoutContext.Provider>
    );
    const { container, rerender } = render(row(false));

    // Named per section, with the state in aria-pressed rather than the name.
    const toggle = screen.getByRole('button', { name: 'Page break before “Work”' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await user.click(toggle);
    expect(onTogglePageBreak).toHaveBeenCalledWith('work');

    rerender(row(true));
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    // Not offered a second time behind the overflow menu.
    await user.click(screen.getByRole('button', { name: 'More actions for “Work”' }));
    expect(screen.getAllByRole('button', { name: 'Page break before “Work”' })).toHaveLength(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('greys out the page break on the first or a hidden row, reason in a tooltip', async () => {
    const user = userEvent.setup();
    const onTogglePageBreak = vi.fn();
    const row = (flags: { isFirst?: boolean; isHidden?: boolean }) => (
      <EditorLayoutContext.Provider value={layout(800)}>
        <DndContext>
          <SortableSectionItem
            id="work"
            label="Work"
            {...flags}
            onTogglePageBreak={onTogglePageBreak}
          />
        </DndContext>
      </EditorLayoutContext.Provider>
    );
    const { container, rerender } = render(row({ isFirst: true }));

    const button = screen.getByRole('button', { name: 'Page break before “Work”' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    // Not printed under the button: the reason is the shared refusal tooltip.
    const tooltip = document.getElementById(button.getAttribute('aria-describedby')!)!;
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.textContent).toBe('design.page_break_disabled_first');
    await user.click(button);
    expect(onTogglePageBreak).not.toHaveBeenCalled();
    expect((await axe(container)).violations).toEqual([]);

    rerender(row({ isHidden: true }));
    const hidden = screen.getByRole('button', { name: 'Page break before “Work”' });
    expect(hidden.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(hidden.getAttribute('aria-describedby')!)!.textContent).toBe(
      'design.page_break_disabled_hidden',
    );
  });

  it('keeps the page break on a stacked row, once', async () => {
    const user = userEvent.setup();
    const onTogglePageBreak = vi.fn();
    const { container } = render(
      <EditorLayoutContext.Provider value={layout(375)}>
        <DndContext>
          <SortableSectionItem
            id="work"
            label="Work"
            onEdit={vi.fn()}
            onTogglePageBreak={onTogglePageBreak}
            position={2}
            total={3}
            onMoveUp={vi.fn()}
            onMoveDown={vi.fn()}
          />
        </DndContext>
      </EditorLayoutContext.Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'Page break before “Work”' }));
    expect(onTogglePageBreak).toHaveBeenCalledWith('work');
    await user.click(screen.getByRole('button', { name: 'More actions for “Work”' }));
    expect(screen.getAllByRole('button', { name: 'Page break before “Work”' })).toHaveLength(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('lets a stacked row shrink its buttons below the width its button count needs', () => {
    // jsdom does no layout, so this pins the container-query threshold per
    // button count; the 320px and 375px fit was measured in the browser (#19).
    const row = (swap: boolean) => (
      <EditorLayoutContext.Provider value={layout(375)}>
        <DndContext>
          <SortableSectionItem
            id="work"
            label="Work"
            onEdit={vi.fn()}
            onToggleVisibility={vi.fn()}
            canSwap={swap}
            onSwap={vi.fn()}
            position={2}
            total={3}
            onMoveUp={vi.fn()}
            onMoveDown={vi.fn()}
          />
        </DndContext>
      </EditorLayoutContext.Provider>
    );
    const { rerender } = render(row(true));
    const card = () => screen.getByRole('button', { name: 'Move “Work” to the other column' });
    const rowOf = (el: HTMLElement) => el.closest('.group') as HTMLElement;
    const arrows = () => screen.getByRole('group', { name: 'Move items' });

    // Six buttons: grip, visibility, swap, up, down, menu → 6 × 44 + 4 = 268.
    expect(rowOf(card()).className).toContain('@container/row');
    expect(rowOf(card()).className).toContain('@max-[268px]/row:[&_button]:size-9');
    expect(arrows().className).toContain('@max-[268px]/row:gap-0');

    // No swap → five buttons → 224.
    rerender(row(false));
    const five = rowOf(arrows());
    expect(five.className).toContain('@max-[224px]/row:[&_button]:size-9');
    expect(five.className).not.toContain('268px');
    expect(arrows().className).toContain('@max-[224px]/row:gap-0');
  });

  it('builds sorting announcements from localized labels', () => {
    const announcements = createSortingAnnouncements({
      items: ['work', 'education'],
      getLabel: (id) => ({ work: 'Beruf', education: 'Ausbildung' })[id] || id,
      t: (key, vars = {}) =>
        (
          ({
            'common.moving_named':
              '„{{name}}“ wird verschoben, Position {{position}} von {{total}}',
            'common.moved_named': '„{{name}}“ an Position {{position}} von {{total}} verschoben',
            'common.move_cancelled_named': 'Verschieben von „{{name}}“ abgebrochen',
          }) as Record<string, string>
        )[key].replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name])),
    });

    expect(announcements.onDragStart({ active: { id: 'work' } } as never)).toBe(
      '„Beruf“ wird verschoben, Position 1 von 2',
    );
    expect(
      announcements.onDragEnd({ active: { id: 'work' }, over: { id: 'education' } } as never),
    ).toBe('„Beruf“ an Position 2 von 2 verschoben');
    expect(announcements.onDragCancel?.({ active: { id: 'work' } } as never)).toBe(
      'Verschieben von „Beruf“ abgebrochen',
    );
    // Dropped outside the list: not "being moved" after the drop.
    expect(announcements.onDragEnd({ active: { id: 'work' }, over: null } as never)).toBe(
      'Verschieben von „Beruf“ abgebrochen',
    );
    expect(announcements.onDragOver({ active: { id: 'work' }, over: null } as never)).toBe(
      '„Beruf“ wird verschoben, Position 1 von 2',
    );
  });
});
