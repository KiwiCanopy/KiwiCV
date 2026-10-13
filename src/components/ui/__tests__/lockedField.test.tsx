// @vitest-environment jsdom
import { useState } from 'react';

import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TagField } from '@/components/ui/TagField';
import { TextArea } from '@/components/ui/TextArea';
import type { FieldLock } from '@/components/ui/fieldLock';
import { useTagField } from '@/components/ui/tag-field/useTagField';
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

/**
 * `lock` on the primitives: what a field locked by a pending AI proposal
 * refuses, what it still announces, and where a buffer typed before it goes. The editor call sites are
 * bound separately in `proposals/__tests__/lockedFields.test.tsx`.
 */

const REASON = 'Choose a version above to edit this field.';
const LOCK: FieldLock = { reason: REASON, mine: 'mine' };

/** The reason the field's `aria-describedby` points at, read back through the DOM. */
const describedText = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

describe('a locked text field', () => {
  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s stays focusable and announces why it is read-only', (_, Field) => {
    render(<Field label="Summary" value="AI wording" onChange={vi.fn()} lock={LOCK} />);
    const field = screen.getByLabelText('Summary');

    expect(field.hasAttribute('readonly')).toBe(true);
    expect(field.getAttribute('aria-disabled')).toBe('true');
    expect(field.hasAttribute('disabled')).toBe(false);
    expect(describedText(field)).toContain(REASON);
    field.focus();
    expect(document.activeElement).toBe(field);
  });

  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s cannot be typed into', async (_, Field) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Field label="Summary" value="AI wording" onChange={onChange} lock={LOCK} />);
    const field = screen.getByLabelText<HTMLInputElement>('Summary');

    await user.click(field);
    await user.keyboard('typed');
    await user.tab();

    expect(field.value).toBe('AI wording');
    expect(onChange).not.toHaveBeenCalled();
  });

  /**
   * The primitives buffer keystrokes and commit on blur. A buffer typed before
   * the lock arrived must neither land on the proposal nor vanish: it goes to
   * `keepTyped`, the user's side of the choice.
   */
  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s hands a buffer typed before the lock to keepTyped on blur', (_, Field) => {
    const onChange = vi.fn();
    const keepTyped = vi.fn();
    const lock = { ...LOCK, keepTyped };
    const { rerender } = render(<Field label="Summary" value="mine" onChange={onChange} />);
    const field = screen.getByLabelText<HTMLInputElement>('Summary');

    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: 'mine, half typed' } });
    rerender(<Field label="Summary" value="AI wording" onChange={onChange} lock={lock} />);
    expect(field.value).toBe('AI wording');
    fireEvent.blur(field);

    expect(keepTyped).toHaveBeenCalledExactlyOnceWith('mine, half typed');
    expect(onChange).not.toHaveBeenCalled();
    expect(field.value).toBe('AI wording');
  });

  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s hands nothing to keepTyped when nothing was typed', (_, Field) => {
    const keepTyped = vi.fn();
    render(
      <Field label="Summary" value="AI wording" onChange={vi.fn()} lock={{ ...LOCK, keepTyped }} />,
    );
    const field = screen.getByLabelText('Summary');

    fireEvent.focus(field);
    fireEvent.blur(field);

    expect(keepTyped).not.toHaveBeenCalled();
  });

  /** Focus alone is not typing: the buffer still holds the user's own side. */
  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)(
    '%s hands nothing to keepTyped when the lock lands on a focused field',
    (_, Field) => {
      const keepTyped = vi.fn();
      const { rerender } = render(<Field label="Summary" value="mine" onChange={vi.fn()} />);
      const field = screen.getByLabelText('Summary');
      fireEvent.focus(field);

      rerender(
        <Field
          label="Summary"
          value="AI wording"
          onChange={vi.fn()}
          lock={{ ...LOCK, keepTyped }}
        />,
      );
      fireEvent.blur(field);

      expect(keepTyped).not.toHaveBeenCalled();
    },
  );

  /** A description that appears under the caret is never read; the live region says it. */
  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s announces a lock that arrives while it has focus', (_, Field) => {
    // `null`: lockable, not locked, so the region is mounted before it fills.
    const { rerender } = render(
      <Field label="Summary" value="mine" onChange={vi.fn()} lock={null} />,
    );
    const region = screen.getByRole('status');
    expect(region.textContent).toBe('');
    act(() => screen.getByLabelText('Summary').focus());

    rerender(<Field label="Summary" value="AI wording" onChange={vi.fn()} lock={LOCK} />);

    expect(screen.getByRole('status')).toBe(region);
    expect(region.textContent).toBe(REASON);
  });

  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s stays quiet about a lock that arrives elsewhere', (_, Field) => {
    const { rerender } = render(
      <Field label="Summary" value="mine" onChange={vi.fn()} lock={null} />,
    );

    rerender(<Field label="Summary" value="AI wording" onChange={vi.fn()} lock={LOCK} />);

    expect(screen.getByRole('status').textContent).toBe('');
    expect(screen.getByText(REASON)).toBeTruthy();
  });

  /** Outside the AI editor `lock` is never passed, and no empty region is mounted. */
  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s mounts no status region unless it is lockable', (_, Field) => {
    render(<Field label="Summary" value="mine" onChange={vi.fn()} />);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('mounts no status region on an unlockable select or date picker', () => {
    render(
      <>
        <Select
          label="Level"
          value="3"
          onChange={vi.fn()}
          options={[{ value: '3', label: 'Three' }]}
        />
        <DatePicker id="start" date={new Date(2020, 0, 1)} onChange={vi.fn()} />
      </>,
    );

    expect(screen.queryByRole('status')).toBeNull();
  });

  it.each([
    ['Input', Input],
    ['TextArea', TextArea],
  ] as const)('%s unlocks in place, keeping focus and the node', async (_, Field) => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Field label="Summary" value="AI wording" onChange={onChange} lock={LOCK} />,
    );
    const field = screen.getByLabelText('Summary');
    field.focus();

    rerender(<Field label="Summary" value="AI wording" onChange={onChange} />);

    expect(screen.getByLabelText('Summary')).toBe(field);
    expect(document.activeElement).toBe(field);
    expect(field.hasAttribute('readonly')).toBe(false);
    expect(field.hasAttribute('aria-disabled')).toBe(false);
    expect(screen.queryByText(REASON)).toBeNull();
  });
});

describe('a locked select', () => {
  const OPTIONS = [
    { value: '0', label: 'Not specified' },
    { value: '3', label: 'Advanced' },
  ];

  function Harness({ lock }: { lock?: FieldLock }) {
    const [value, setValue] = useState('3');
    return (
      <Select
        label="Level"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        options={OPTIONS}
        lock={lock}
      />
    );
  }

  it('refuses the change and keeps the proposed value', () => {
    render(<Harness lock={LOCK} />);
    const select = screen.getByLabelText<HTMLSelectElement>('Level');

    fireEvent.change(select, { target: { value: '0' } });

    expect(select.value).toBe('3');
    expect(select.getAttribute('aria-disabled')).toBe('true');
    expect(select.hasAttribute('disabled')).toBe(false);
    expect(describedText(select)).toContain(REASON);
  });

  it('refuses the keys that would open or step it', () => {
    render(<Harness lock={LOCK} />);
    const select = screen.getByLabelText('Level');

    for (const key of ['ArrowDown', 'ArrowUp', ' ', 'Enter', 'Home', 'End', 'a']) {
      expect(fireEvent.keyDown(select, { key }), key).toBe(false);
    }
    expect(fireEvent.mouseDown(select)).toBe(false);
  });

  it('lets Tab, Escape and modified chords through', () => {
    render(<Harness lock={LOCK} />);
    const select = screen.getByLabelText('Level');

    expect(fireEvent.keyDown(select, { key: 'Tab' })).toBe(true);
    expect(fireEvent.keyDown(select, { key: 'Escape' })).toBe(true);
    expect(fireEvent.keyDown(select, { key: 'F6' })).toBe(true);
    expect(fireEvent.keyDown(select, { key: 'l', ctrlKey: true })).toBe(true);
    expect(fireEvent.keyDown(select, { key: 'ArrowDown', metaKey: true })).toBe(true);
  });

  it('changes normally once unlocked', () => {
    render(<Harness />);
    const select = screen.getByLabelText<HTMLSelectElement>('Level');

    fireEvent.change(select, { target: { value: '0' } });

    expect(select.value).toBe('0');
    expect(fireEvent.keyDown(select, { key: 'ArrowDown' })).toBe(true);
  });
});

describe('a locked date picker', () => {
  it('stays focusable, announces why, and does not open', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker id="start" date={new Date(2020, 0, 1)} onChange={onChange} lock={LOCK} />);
    const trigger = document.getElementById('start') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.hasAttribute('disabled')).toBe(false);
    expect(describedText(trigger)).toContain(REASON);

    await user.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  /** A refused press must not leave the calendar armed to pop open on unlock. */
  it('does not open by itself once the lock lifts', async () => {
    const user = userEvent.setup();
    const props = { id: 'start', date: new Date(2020, 0, 1), onChange: vi.fn() };
    const { rerender } = render(<DatePicker {...props} lock={LOCK} />);

    await user.click(document.getElementById('start') as HTMLButtonElement);
    rerender(<DatePicker {...props} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes when a lock arrives while it is open', async () => {
    const user = userEvent.setup();
    const props = { id: 'start', date: new Date(2020, 0, 1), onChange: vi.fn() };
    const { rerender } = render(<DatePicker {...props} />);

    await user.click(document.getElementById('start') as HTMLButtonElement);
    expect(screen.getByRole('dialog')).toBeTruthy();
    rerender(<DatePicker {...props} lock={LOCK} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens once unlocked', async () => {
    const user = userEvent.setup();
    render(<DatePicker id="start" date={new Date(2020, 0, 1)} onChange={vi.fn()} />);

    await user.click(document.getElementById('start') as HTMLButtonElement);

    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});

describe('a locked tag list', () => {
  const ITEMS = ['Shipped the checkout', 'Cut build time'];
  const PROPOSAL = ['Shipped checkout v2', 'Halved build time'];

  /** `outside` stands in for a write from elsewhere (a proposal, Keep mine, a sync). */
  function Harness({
    lock,
    outside,
    initial = ITEMS,
  }: {
    lock?: FieldLock;
    outside?: string[];
    initial?: string[];
  }) {
    const [value, setValue] = useState(initial);
    const [seen, setSeen] = useState(outside);
    if (outside !== seen) {
      setSeen(outside);
      if (outside) setValue(outside);
    }
    return (
      <>
        <TagField label="Highlights" value={value} onChange={setValue} lock={lock} />
        <output data-testid="stored">{value.join('|')}</output>
      </>
    );
  }

  const stored = () => screen.getByTestId('stored').textContent;
  const entryControls = () => [
    ...screen.getAllByRole('button', { name: /^Move/ }),
    ...screen.getAllByRole('button', { name: /^Edit/ }),
    ...screen.getAllByRole('button', { name: /^Delete/ }),
  ];

  it('puts the reason on the add field and refuses adding', async () => {
    const user = userEvent.setup();
    render(<Harness lock={LOCK} />);
    const add = screen.getByLabelText('Highlights');

    expect(describedText(add)).toContain(REASON);
    expect(add.getAttribute('aria-disabled')).toBe('true');

    await user.click(add);
    await user.keyboard('Invented{Enter}');
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton.getAttribute('aria-disabled')).toBe('true');
    await user.click(addButton);

    expect(stored()).toBe(ITEMS.join('|'));
  });

  /** The add field's own buffer outlives the lock; Enter adds it to the user's side. */
  it('adds an entry typed before the lock arrived to the user side, not the list', async () => {
    const user = userEvent.setup();
    const keepTyped = vi.fn();
    const { rerender } = render(<Harness />);
    const add = screen.getByLabelText<HTMLInputElement>('Highlights');

    await user.click(add);
    await user.keyboard('Typed before the run');
    rerender(<Harness lock={{ reason: REASON, mine: ['Mine'], keepTyped }} />);
    await user.keyboard('{Enter}');

    expect(keepTyped).toHaveBeenCalledExactlyOnceWith(['Mine', 'Typed before the run']);
    expect(stored()).toBe(ITEMS.join('|'));
    expect(add.value).toBe('');
  });

  /** An edit open when the proposal lands is the user's own entry, edited. */
  it('saves an edit opened before the lock arrived to the user side, in place', async () => {
    const user = userEvent.setup();
    const keepTyped = vi.fn();
    const { rerender } = render(<Harness />);

    await user.click(screen.getByRole('button', { name: /^Edit “Cut build time/ }));
    const dialog = screen.getByRole('heading').parentElement as HTMLElement;
    await user.clear(within(dialog).getByRole('textbox'));
    await user.type(within(dialog).getByRole('textbox'), 'Cut build time by 40%');
    // The proposal replaces the list, so every entry, and its id, is new.
    rerender(<Harness lock={{ reason: REASON, mine: ITEMS, keepTyped }} outside={PROPOSAL} />);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(keepTyped).toHaveBeenCalledExactlyOnceWith([
      'Shipped the checkout',
      'Cut build time by 40%',
    ]);
    expect(stored()).toBe(PROPOSAL.join('|'));
    expect(screen.queryByRole('heading')).toBeNull();
  });

  /** An outside write regenerates every id; the open edit must still land. */
  it('saves an unlocked edit after an outside write replaced the list', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness />);

    await user.click(screen.getByRole('button', { name: /^Edit “Cut build time/ }));
    const dialog = screen.getByRole('heading').parentElement as HTMLElement;
    await user.clear(within(dialog).getByRole('textbox'));
    await user.type(within(dialog).getByRole('textbox'), 'Cut build time by 40%');
    rerender(<Harness outside={[...ITEMS, 'Synced in']} />);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(stored()).toBe('Shipped the checkout|Cut build time by 40%|Synced in');
  });

  it('saves an unlocked edit after a lock came and went with the dialog open', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness />);

    await user.click(screen.getByRole('button', { name: /^Edit “Cut build time/ }));
    const dialog = screen.getByRole('heading').parentElement as HTMLElement;
    await user.clear(within(dialog).getByRole('textbox'));
    await user.type(within(dialog).getByRole('textbox'), 'Cut build time by 40%');
    rerender(<Harness lock={{ reason: REASON, mine: ITEMS }} outside={PROPOSAL} />);
    // Keep mine: the user's list is back, under new ids, and the lock is gone.
    rerender(<Harness outside={[...ITEMS]} />);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(stored()).toBe('Shipped the checkout|Cut build time by 40%');
  });

  /** The dialog saves on Enter or Save whether or not anything changed. */
  it('does not bring back an entry an outside write removed on an untouched Save', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness />);

    await user.click(screen.getByRole('button', { name: /^Edit “Cut build time/ }));
    const dialog = screen.getByRole('heading').parentElement as HTMLElement;
    rerender(<Harness outside={['Shipped the checkout']} />);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(stored()).toBe('Shipped the checkout');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  describe('with duplicate entries', () => {
    const DUPLICATES = ['Led the team', 'Wrote the docs', 'Led the team'];

    /** Opens the second of two equal entries and retypes it. */
    async function editSecondDuplicate(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getAllByRole('button', { name: /^Edit “Led the team/ })[1]);
      const dialog = screen.getByRole('heading').parentElement as HTMLElement;
      await user.clear(within(dialog).getByRole('textbox'));
      await user.type(within(dialog).getByRole('textbox'), 'Led the team of six');
      return dialog;
    }

    it('lands an unlocked edit on the entry it opened on', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Harness initial={DUPLICATES} />);

      const dialog = await editSecondDuplicate(user);
      // A sync appends an entry, so every id is new and only the text can match.
      rerender(<Harness initial={DUPLICATES} outside={[...DUPLICATES, 'Synced in']} />);
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(stored()).toBe('Led the team|Wrote the docs|Led the team of six|Synced in');
    });

    it('lands a locked edit on the entry it opened on', async () => {
      const user = userEvent.setup();
      const keepTyped = vi.fn();
      const { rerender } = render(<Harness initial={DUPLICATES} />);

      const dialog = await editSecondDuplicate(user);
      rerender(
        <Harness
          initial={DUPLICATES}
          lock={{ reason: REASON, mine: DUPLICATES, keepTyped }}
          outside={PROPOSAL}
        />,
      );
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(keepTyped).toHaveBeenCalledExactlyOnceWith([
        'Led the team',
        'Wrote the docs',
        'Led the team of six',
      ]);
    });
  });

  it('appends an unlocked edit whose entry an outside write removed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness />);

    await user.click(screen.getByRole('button', { name: /^Edit “Cut build time/ }));
    const dialog = screen.getByRole('heading').parentElement as HTMLElement;
    await user.clear(within(dialog).getByRole('textbox'));
    await user.type(within(dialog).getByRole('textbox'), 'Cut build time by 40%');
    rerender(<Harness outside={['Shipped the checkout']} />);
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(stored()).toBe('Shipped the checkout|Cut build time by 40%');
  });

  it('keeps every entry control visible, inert and out of the tab order', async () => {
    const user = userEvent.setup();
    render(<Harness lock={LOCK} />);

    // Two entries: a grip and up/down, edit and delete each.
    expect(entryControls()).toHaveLength(10);
    for (const control of entryControls()) {
      expect(control.getAttribute('aria-disabled')).toBe('true');
      expect(control.tabIndex).toBe(-1);
      // The grip's own dnd-kit instructions ("press space to pick up") included.
      expect(describedText(control)).toBe(REASON);
    }
    expect(describedText(screen.getByRole('button', { name: 'Add' }))).toBe(REASON);

    await user.click(screen.getByRole('button', { name: /^Delete “Cut build time/ }));
    await user.click(screen.getByRole('button', { name: /^Move “Shipped the checkout” down/ }));
    await user.click(screen.getByRole('button', { name: /^Edit “Cut build time/ }));

    expect(stored()).toBe(ITEMS.join('|'));
    // The edit dialog's heading: the refused Edit never opened it.
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('tabs from the add field past every entry control', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Harness lock={LOCK} />
        <button type="button">after</button>
      </>,
    );

    screen.getByLabelText('Highlights').focus();
    await user.tab(); // the aria-disabled Add button stays reachable
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
  });

  it('edits normally once unlocked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    for (const control of entryControls()) {
      expect(control.hasAttribute('aria-disabled')).toBe(false);
    }
    await user.click(screen.getByRole('button', { name: /^Delete “Cut build time/ }));

    expect(stored()).toBe('Shipped the checkout');
  });
});

/**
 * The buttons already refuse a press (`Button` honours `aria-disabled`), so this
 * pins the hook's own guard for a caller that does not go through them.
 */
describe('useTagField under a lock', () => {
  it('writes nothing through remove or move', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTagField({ value: ['One', 'Two'], onChange, lock: LOCK }),
    );

    act(() => result.current.handleRemove(result.current.items[0].id));
    act(() => result.current.handleMove(result.current.items[0].id, 1));

    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.items.map((item) => item.text)).toEqual(['One', 'Two']);
  });
});
