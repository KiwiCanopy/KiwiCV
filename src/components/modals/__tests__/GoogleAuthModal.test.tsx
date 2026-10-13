// @vitest-environment jsdom
import { GoogleAuthModal } from '@/components/modals/GoogleAuthModal';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

const googleSignin = vi.fn(() => new Promise<void>(() => {}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ googleSignin, user: null, loading: false }),
}));
// `useLanguage` reads the locale from the pathname now, not a `:lang` param.
vi.mock('react-router-dom', () => ({ useLocation: () => ({ pathname: '/' }) }));
vi.mock('@/store/ui/useFlowStore', () => ({
  useFlowStore: (selector: (state: { auth: { requireDrive: boolean } }) => unknown) =>
    selector({ auth: { requireDrive: false } }),
}));

describe('GoogleAuthModal', () => {
  beforeEach(() => {
    googleSignin.mockClear();
  });

  it('names the dialog once, from the visible heading', async () => {
    const { container } = render(<GoogleAuthModal isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');

    // The name used to come from an sr-only DialogFrameTitle in this file while
    // AuthView rendered the same string as a visible h2 — a hidden second copy,
    // which DialogFrameTitle's contract rules out and which had already been
    // fixed once in PricingDialog. AuthView now owns the title through
    // `ownsDialogTitle`, so exactly one element carries the string and the
    // dialog points at it.
    const headings = screen.getAllByRole('heading', { name: /sign in with google/i });
    expect(headings).toHaveLength(1);
    expect(dialog.getAttribute('aria-labelledby')).toBe(headings[0].id);

    expect((await axe(container)).violations).toEqual([]);
  });
});
