// @vitest-environment jsdom
import { GitHubSyncModalFooter } from '@/components/modals/github-sync/GitHubSyncModalFooter';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderFooter(overrides = {}) {
  const props = {
    status: 'idle' as const,
    isLoading: false,
    canConnect: true,
    onConnect: vi.fn(),
    onBack: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<GitHubSyncModalFooter {...props} />);
  return props;
}

describe('GitHubSyncModalFooter', () => {
  it('connects when the connect button is clicked and connection is possible', async () => {
    const user = userEvent.setup();
    const { onConnect } = renderFooter();

    await user.click(screen.getByRole('button', { name: /connect & sync/i }));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('disables the connect button when connection is not possible', () => {
    renderFooter({ canConnect: false });
    const button = screen.getByRole('button', { name: /connect & sync/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('goes back via onBack when provided', async () => {
    const user = userEvent.setup();
    const { onBack, onClose } = renderFooter();

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
