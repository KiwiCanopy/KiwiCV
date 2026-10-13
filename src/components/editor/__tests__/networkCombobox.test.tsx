// @vitest-environment jsdom
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { ProfileList } from '@/components/editor/ProfileList';
import { SUGGESTED_NETWORKS } from '@/components/editor/ProfileList/constants';
import { en } from '@/locales/en/index';
import { type ResumeData } from '@/types/resume';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

type Profiles = ResumeData['basics']['profiles'];

/**
 * The network field follows the ARIA combobox pattern — named
 * "Network", closed on focus, opened by ArrowDown or typing, and its options
 * are not Tab stops.
 */
const Harness = ({ onProfiles }: { onProfiles: (profiles: Profiles) => void }) => {
  const [profiles, setProfiles] = useState<Profiles>([
    { network: '', username: 'ada', url: '', _vId: 'p1' },
  ]);
  return (
    <MemoryRouter>
      <ProfileList
        profiles={profiles}
        onChange={(next: Profiles) => {
          setProfiles(next);
          onProfiles(next);
        }}
      />
    </MemoryRouter>
  );
};

// jsdom has no layout, so it lacks `scrollIntoView`.
const scrollIntoView = vi.fn();
beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});
afterEach(() => cleanup());

describe('the social network combobox', () => {
  const field = () => screen.getByRole('combobox', { name: en.editor.fields.network });

  it('is named Network and stays closed on focus; Tab reaches Username', async () => {
    const user = userEvent.setup();
    render(<Harness onProfiles={() => {}} />);
    act(() => field().focus());
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();

    await user.tab();
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      en.placeholders.basics.username,
    );
  });

  it('opens on ArrowDown, moves with the arrows and picks with Enter', () => {
    const onProfiles = vi.fn();
    render(<Harness onProfiles={onProfiles} />);
    const input = field();
    act(() => input.focus());

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(SUGGESTED_NETWORKS.length);
    expect(options.some((option) => option.hasAttribute('tabindex'))).toBe(false);
    expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].id);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onProfiles).toHaveBeenLastCalledWith([
      expect.objectContaining({ network: SUGGESTED_NETWORKS[1] }),
    ]);
  });

  it('closes on Escape', () => {
    render(<Harness onProfiles={() => {}} />);
    const input = field();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on typing and on a click, never as an empty popup', async () => {
    const user = userEvent.setup();
    render(<Harness onProfiles={() => {}} />);
    const input = field();

    await user.click(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(input, { key: 'Escape' });

    await user.type(input, 'git');
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    const count = screen.getAllByRole('option').length;
    const announced = en.editor.basics.profiles[
      count === 1 ? 'suggestions_one' : 'suggestions_other'
    ].replace('{{count}}', String(count));
    expect(screen.getAllByRole('status').some((node) => node.textContent === announced)).toBe(true);

    // A custom network matches nothing: no listbox, not expanded.
    await user.clear(input);
    await user.type(input, 'zzz');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.hasAttribute('aria-controls')).toBe(false);
  });

  it('wraps with the arrows, scrolls the active option into view, and closes on Tab', () => {
    render(<Harness onProfiles={() => {}} />);
    const input = field();
    act(() => input.focus());

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    const options = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].id);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    expect(scrollIntoView).toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('picks with a click without taking focus from the field', () => {
    const onProfiles = vi.fn();
    render(<Harness onProfiles={onProfiles} />);
    const input = field();
    act(() => input.focus());
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const option = screen.getAllByRole('option')[2];

    expect(fireEvent.mouseDown(option)).toBe(false); // default prevented
    fireEvent.click(option);
    expect(onProfiles).toHaveBeenLastCalledWith([
      expect.objectContaining({ network: SUGGESTED_NETWORKS[2] }),
    ]);
  });
});
