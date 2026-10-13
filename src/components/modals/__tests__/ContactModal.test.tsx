// @vitest-environment jsdom
import { ContactModal } from '@/components/modals/ContactModal';
import { CONTACT_EMAIL } from '@/constants/contact';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const addToast = vi.fn();
vi.mock('@/store/ui/useToastStore', () => ({
  useToastStore: (selector: (s: { addToast: typeof addToast }) => unknown) =>
    selector({ addToast }),
}));

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { CONTACT_MODAL_OPENED: 'contact_modal_opened' },
  analytics: { track: vi.fn() },
}));

function renderModal(overrides = {}) {
  const props = { isOpen: true, onClose: vi.fn(), ...overrides };
  render(<ContactModal {...props} />);
  return props;
}

describe('ContactModal', () => {
  it('names the dialog and links to the contact email', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /legal\.contact\.title/i })).toBeTruthy();
    const mailto = screen.getByRole('link', {
      name: /legal\.contact\.button/i,
    }) as HTMLAnchorElement;
    expect(mailto.getAttribute('href')).toBe(`mailto:${CONTACT_EMAIL}`);
  });

  it('stays closed when not open', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('toasts on email copy', async () => {
    // userEvent.setup() installs its own clipboard stub, so assert the
    // observable effect (the success toast) rather than a writeText spy.
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: /common\.copied/i }));
    expect(addToast).toHaveBeenCalledWith('common.copied', 'success');
  });

  it('closes from the back button', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('button', { name: /common\.back/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
