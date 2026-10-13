// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SyncWorkflowModals } from '@/components/modals/SyncWorkflowModals';
import { useUIStore } from '@/store/ui/useUIStore';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ Spied, not inferred from the route. Navigating from `/cvs` TO `/cvs`
 * leaves the pathname identical, so an assertion on `useLocation()` passes just
 * as happily with the bug in place — it only pushes a history entry. The call
 * itself is the observable difference.
 */
const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigateSpy,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ signInWithGoogle: vi.fn(), user: null, hasDrivePermission: null }),
}));

// A provider has to be enabled or the gateway's CTA renders disabled.
vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => ({ github: 'active', googleDrive: 'not_configured' }),
}));

vi.mock('@/hooks/useSyncWorkflow', () => ({
  useSyncWorkflow: () => ({ performSync: vi.fn() }),
}));

// `SyncWorkflowModals` also mounts the export dialog, whose hooks read a much
// larger slice of the résumé. This file is about the gateway's CTA.
vi.mock('@/components/modals/export/ExportModal', () => ({ ExportModal: () => null }));

const storeState = {
  sync: { github: { enabled: true }, googleDrive: { enabled: false } },
  updateSync: vi.fn(),
  // `useTranslation` reads `resume.meta` off the same store.
  resume: { meta: {} },
};
vi.mock('@/store/resume/useResumeStore', () => ({
  useResumeStore: Object.assign(
    (selector: (s: typeof storeState) => unknown) => selector(storeState),
    { getState: () => storeState },
  ),
}));

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="*" element={<SyncWorkflowModals />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  navigateSpy.mockClear();
  useUIStore.getState().setSyncModal('none');
});

/**
 * ⚠️ The manage gateway opens FROM `/cvs`, so its CTA navigated to the route the
 * user was already on: the dialog closed and the identical not-connected panel
 * was still there, under a button labelled with the name of that page.
 */
describe('the sync gateway opened for CV management', () => {
  it('does not navigate, and offers to continue, when already on My CVs', async () => {
    const user = userEvent.setup();
    renderAt('/cvs');
    useUIStore.getState().setSyncModal('gateway', 'manage');

    const cta = await screen.findByRole('button', { name: 'Continue' });
    expect(screen.queryByRole('button', { name: 'My CVs' })).toBeNull();

    await user.click(cta);

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(useUIStore.getState().activeSyncModal).toBe('none');
  });

  it('still navigates to My CVs when opened from anywhere else', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');
    useUIStore.getState().setSyncModal('gateway', 'manage');

    await user.click(await screen.findByRole('button', { name: 'My CVs' }));

    expect(navigateSpy).toHaveBeenCalledWith('/cvs');
  });
});
