// @vitest-environment jsdom
import { ScopeChips } from '@/features/cv-library/ScopeChips';
import type { ProviderState } from '@/hooks/sync/providerState';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const states = vi.hoisted(() => ({
  github: 'not_connected' as ProviderState,
  googleDrive: 'not_connected' as ProviderState,
}));

vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => ({ github: states.github, googleDrive: states.googleDrive }),
}));

const COUNTS = { all: 3, github: 2, google_drive: 1 };

function renderChips(scope: 'all' | 'github' | 'google_drive' = 'all', onChange = vi.fn()) {
  render(<ScopeChips scope={scope} counts={COUNTS} onChange={onChange} />);
  return onChange;
}

describe('ScopeChips', () => {
  beforeEach(() => {
    states.github = 'not_connected';
    states.googleDrive = 'not_connected';
  });

  it('renders All plus one chip per provider when two are connected', () => {
    states.github = 'active';
    // Switched off in Settings still means the credentials exist and the files
    // are listable, so the chip is a filter that can return something.
    states.googleDrive = 'connected_disabled';

    renderChips();

    expect(screen.getByRole('group', { name: 'Filter by storage provider' })).toBeTruthy();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'All3',
      'GitHub2',
      'Google Drive1',
    ]);
  });

  it('never offers a provider the user has not connected', () => {
    states.github = 'not_connected';
    states.googleDrive = 'active';

    renderChips();

    expect(screen.queryByRole('button', { name: /GitHub/ })).toBeNull();
  });

  it('renders no row at all when only one provider is connected', () => {
    states.googleDrive = 'active';

    const { container } = render(<ScopeChips scope="all" counts={COUNTS} onChange={vi.fn()} />);

    // `All` and the one connected provider select an identical set, so two
    // chips that always agree are noise. The per-row provider icon still says
    // where each file lives.
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('renders no row when nothing is connected', () => {
    const { container } = render(<ScopeChips scope="all" counts={COUNTS} onChange={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  it('shows a chip disabled while its handshake is still in flight', () => {
    states.github = 'active';
    states.googleDrive = 'checking';

    renderChips();

    // Rendered, so the row does not appear, vanish and reappear during load,
    // and so a chip does not pop in under the pointer.
    const drive = screen.getByRole('button', { name: /Google Drive/ });
    expect(drive.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /GitHub/ }).hasAttribute('disabled')).toBe(false);
  });

  it('counts an unresolved provider toward the row, so the row cannot pop in mid-load', () => {
    states.github = 'checking';
    states.googleDrive = 'checking';

    renderChips();

    // Both are still handshaking. Deciding on resolved providers only would
    // render nothing now and a full row a moment later.
    expect(screen.getByRole('group')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('falls back to All when the scoped provider is not connected', () => {
    states.googleDrive = 'active';
    states.github = 'active';
    const onChange = renderChips('github');
    expect(onChange).not.toHaveBeenCalled();

    states.github = 'not_connected';
    // Only Drive left: the row is gone, and a stale `?source=github` scope
    // would otherwise filter every row out of a Drive-only library.
    expect(renderChips('github')).toHaveBeenCalledWith('all');
  });

  it('does not fight the user when the scope is already All', () => {
    states.github = 'active';
    states.googleDrive = 'active';

    expect(renderChips('all')).not.toHaveBeenCalled();
  });
});
