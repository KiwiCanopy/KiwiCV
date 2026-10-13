// @vitest-environment jsdom
import { CloudSyncGatewayModal } from '@/components/modals/CloudSyncGatewayModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ signInWithGoogle: vi.fn() }) }));

vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => ({ github: 'not_configured', googleDrive: 'not_configured' }),
}));

const storeState = {
  sync: { github: { enabled: false }, googleDrive: { enabled: false } },
  updateSync: vi.fn(),
  // useTranslation reads state.resume.meta off the same store.
  resume: { meta: {} },
};
vi.mock('@/store/resume/useResumeStore', () => ({
  useResumeStore: (selector: (s: typeof storeState) => unknown) => selector(storeState),
}));

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onStartSync: vi.fn(),
    onConnectGitHub: vi.fn(),
    onConnectGoogle: vi.fn(),
    ...overrides,
  };
  render(<CloudSyncGatewayModal {...props} />);
  return props;
}

describe('CloudSyncGatewayModal', () => {
  it('exposes an accessible dialog named by its title', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /cloud sync/i })).toBeTruthy();
  });

  it('disables the push-to-cloud action while no provider is enabled', () => {
    renderModal();
    const push = screen.getByRole('button', { name: /upload to cloud/i }) as HTMLButtonElement;
    expect(push.disabled).toBe(true);
  });

  it('connects GitHub from its set-up button', async () => {
    const user = userEvent.setup();
    const { onConnectGitHub } = renderModal();

    // GitHub is the first service row, so its set-up button is first.
    await user.click(screen.getAllByRole('button', { name: /set up/i })[0]);
    expect(onConnectGitHub).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
