// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CvLibraryPage } from '@/pages/CvLibraryPage';
import { useCvLibraryStore } from '@/store/library/useCvLibraryStore';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listContents: vi.fn(async () => []),
  getLastCommit: vi.fn(async () => null),
  driveDiscover: vi.fn(async () => ({})),
  deleteFile: vi.fn(async () => true),
  isCloudActive: { value: false },
  isGoogleActive: { value: false },
}));
const { listContents, getLastCommit, driveDiscover, deleteFile } = mocks;

vi.mock('@/services/github', () => ({
  GitHubService: class {
    listContents = mocks.listContents;
    getLastCommit = mocks.getLastCommit;
    deleteFile = mocks.deleteFile;
  },
}));

vi.mock('@/services/google-drive', () => ({
  googleDriveService: { discoverBackups: mocks.driveDiscover },
}));

vi.mock('@/hooks/sync/useSyncAuthGateway', () => ({
  useSyncAuthGateway: () => ({
    isCloudActive: mocks.isCloudActive.value,
    isGitHubActive: mocks.isCloudActive.value,
    isGoogleActive: mocks.isGoogleActive.value,
    // Takes the branch the real hook routes a signed-in user with no Drive
    // credentials down — the one the page used to answer with an empty function.
    ensureConnected: (options: { onSetupRequired: () => void }) => options.onSetupRequired(),
    user: null,
  }),
}));

vi.mock('@/hooks/useSyncWorkflow', () => ({
  useSyncWorkflow: () => ({ handleTrigger: vi.fn(), syncStatus: 'idle' }),
}));

// The scope chips read real connection state, which comes from `useAuth` and a
// provider context this render has no reason to mount.
vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => ({ github: 'active', googleDrive: 'active' }),
}));

function setDriveSync(enabled: boolean) {
  const store = useResumeStore.getState();
  store.updateSync({ googleDrive: { ...store.sync.googleDrive, enabled } });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/en/cvs']}>
      <Routes>
        <Route path="/:lang/cvs" element={<CvLibraryPage />} />
      </Routes>
      {/* A store singleton the layout mounts, not the page. */}
      <ConfirmModal />
    </MemoryRouter>,
  );
}

const rowMenu = (label: string) =>
  screen.getByRole('button', { name: `More actions for ${label}` });

/** Focus the control, prove it took, then activate it from the keyboard. */
async function pressWithKeyboard(user: UserEvent, control: HTMLElement) {
  control.focus();
  expect(document.activeElement).toBe(control);
  await user.keyboard('{Enter}');
}

/** Menu → Delete → Confirm → OK, every step from the keyboard. */
async function deleteRow(user: UserEvent, label: string) {
  await pressWithKeyboard(user, rowMenu(label));
  await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Delete' }));
  await pressWithKeyboard(user, await screen.findByRole('button', { name: 'Confirm' }));
  await pressWithKeyboard(user, await screen.findByRole('button', { name: 'OK' }));
}

/** Three tailored versions, newest first, none of them a master. */
function seedThreeVersions() {
  mocks.isCloudActive.value = true;
  useCvLibraryStore.getState().setReady(
    {
      en: {
        github: [
          { name: 'ProjectA.json', label: 'ProjectA', updatedAt: '2026-07-03T10:00:00Z' },
          { name: 'ProjectB.json', label: 'ProjectB', updatedAt: '2026-07-02T10:00:00Z' },
          { name: 'ProjectC.json', label: 'ProjectC', updatedAt: '2026-07-01T10:00:00Z' },
        ],
      },
    },
    { en: 'backups/en' },
  );
}

describe('CvLibraryPage', () => {
  beforeEach(() => {
    mocks.isCloudActive.value = false;
    mocks.isGoogleActive.value = false;
    listContents.mockClear();
    getLastCommit.mockClear();
    driveDiscover.mockClear();
    deleteFile.mockClear();
    // `useCloudOperations` reads these at hook body; without them `handleDelete`
    // throws before it ever reaches the provider.
    localStorage.setItem('github_pat', 'test-pat');
    localStorage.setItem('github_repo', 'owner/repo');
    useCvLibraryStore.getState().reset();
  });

  afterEach(() => {
    setDriveSync(false);
    useCvLibraryStore.getState().reset();
    useConfirmStore.getState().close();
    localStorage.removeItem('github_pat');
    localStorage.removeItem('github_repo');
    localStorage.removeItem('google_drive_refresh_token');
    // The gateway case writes a store nothing else here resets.
    useUIStore.getState().setSyncModal('none');
  });

  it('offers to connect, and issues zero provider calls, when nothing is connected', () => {
    renderPage();

    expect(screen.getByText('Connect cloud storage to see your versions')).toBeTruthy();
    // The nav item used to open an empty popup here. Nothing is fetched,
    // because there is nothing to fetch from.
    expect(listContents).not.toHaveBeenCalled();
    expect(driveDiscover).not.toHaveBeenCalled();
  });

  // A stored Drive credential is not consent to use it: sync off means the
  // library sends Google no token, whatever else is connected.
  it('does not query Drive when only GitHub is active, though a Drive token is stored', async () => {
    mocks.isCloudActive.value = true;
    localStorage.setItem('google_drive_refresh_token', 'leftover-token');

    renderPage();

    await waitFor(() => expect(listContents).toHaveBeenCalled());
    await waitFor(() => expect(useCvLibraryStore.getState().status).toBe('ready'));
    expect(driveDiscover).not.toHaveBeenCalled();
  });

  // A cold load: the handshake has not answered when the library loads, and the
  // library caches that pass, so the gate must not wait on it.
  it('queries Drive on a cold load with GitHub active, before the handshake answers', async () => {
    mocks.isCloudActive.value = true;
    mocks.isGoogleActive.value = false; // hasDrivePermission still null
    setDriveSync(true);
    localStorage.setItem('google_drive_refresh_token', 'synced-token');

    const { rerender } = renderPage();
    mocks.isGoogleActive.value = true; // the handshake answers after mount
    rerender(
      <MemoryRouter initialEntries={['/en/cvs']}>
        <Routes>
          <Route path="/:lang/cvs" element={<CvLibraryPage />} />
        </Routes>
        <ConfirmModal />
      </MemoryRouter>,
    );

    await waitFor(() => expect(driveDiscover).toHaveBeenCalledWith('synced-token'));
    expect(listContents).toHaveBeenCalled();
  });

  it('opens the sync gateway when the connect button is pressed', () => {
    useUIStore.getState().setSyncModal('none');
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Connect cloud storage' }));

    expect(useUIStore.getState().activeSyncModal).toBe('gateway');
    // ⚠️ `setSyncModal` only writes the target when it is truthy, so without
    // this the argument is unguarded: the gateway would inherit `'save'` and
    // point its CTA at a sync on an account with no provider configured.
    expect(useUIStore.getState().syncGatewayTarget).toBe('manage');
  });

  it('shows the loading state while discovery is in flight', () => {
    mocks.isCloudActive.value = true;
    useCvLibraryStore.getState().setLoading();

    renderPage();

    // Title plus the StatePanel's own live-region copy of it.
    expect(screen.getAllByText('Checking for backups...').length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('shows the error state when every attempted provider failed', () => {
    mocks.isCloudActive.value = true;
    useCvLibraryStore.getState().setError('Token expired');

    renderPage();

    expect(screen.getByText('We could not read your cloud storage')).toBeTruthy();
    expect(screen.getByText('Token expired')).toBeTruthy();
  });

  it('invites a first backup when the account is connected but empty', () => {
    mocks.isCloudActive.value = true;
    useCvLibraryStore.getState().setReady({}, {});

    renderPage();

    expect(screen.getByText('No versions in the cloud yet')).toBeTruthy();
  });

  it('pins one master per language, active language first, and lists neither twice', () => {
    mocks.isCloudActive.value = true;
    useCvLibraryStore.getState().setReady(
      {
        en: {
          github: [
            { name: 'resume.json', label: 'Latest Backup', updatedAt: '2026-03-01T10:00:00Z' },
            { name: 'ProjectA.json', label: 'ProjectA', updatedAt: '2026-07-04T10:00:00Z' },
          ],
        },
        de: {
          github: [
            { name: 'resume.json', label: 'Latest Backup', updatedAt: '2026-06-01T10:00:00Z' },
          ],
        },
      },
      { en: 'backups/en', de: 'backups/de' },
    );

    renderPage();

    const pinned = within(screen.getByRole('region', { name: 'Latest backup' }));
    // English first even though the German master is newer, because the draft
    // in the editor is English. `ProjectA.json` is newer than both and is not
    // pinned at all — the pinned row is the copy this device syncs to.
    expect(pinned.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('English'),
      expect.stringContaining('German'),
    ]);

    // Both masters are out of the table, and the tailored version is in it.
    expect(screen.queryByText('Latest Backup')).toBeNull();
    expect(screen.getByText('ProjectA')).toBeTruthy();
    expect(screen.getByText('Showing 1 of 1')).toBeTruthy();
  });

  it('keeps the toolbar mounted when the filters match nothing, so they can be undone', async () => {
    mocks.isCloudActive.value = true;
    useCvLibraryStore.getState().setReady(
      {
        en: {
          github: [{ name: 'ProjectA.json', label: 'ProjectA', updatedAt: '2026-03-04T10:00:00Z' }],
        },
      },
      { en: 'backups/en' },
    );

    renderPage();

    const search = screen.getByLabelText('Search versions');
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(search, { target: { value: 'nothing matches this' } });

    expect(screen.getByText('No results found')).toBeTruthy();
    expect(screen.getByLabelText('Search versions')).toBeTruthy();
  });

  /**
   * ⚠️ These drive the WHOLE chain — page → `VersionTable`'s `shown.map` →
   * `VersionRow` → `useCvLibrary.remove` → `handleDelete` → `confirm` — because
   * every hop above `remove` was unbound. `VersionTable` has no
   * test of its own, and `versionDeleteFocus.test.tsx` re-creates the `map` in
   * its own harness, so `index={index}` → `index={0}` type-checked and left the
   * whole gate green while every delete below row 0 anchored on row 0.
   */
  describe('focus after a keyboard delete', () => {
    it('lands on the menu trigger of the row that took the deleted one place', async () => {
      const user = userEvent.setup();
      seedThreeVersions();
      renderPage();

      await deleteRow(user, 'ProjectB');

      await waitFor(() => {
        expect(screen.queryByText('ProjectB')).toBeNull();
        expect(document.activeElement).not.toBe(document.body);
        expect(document.activeElement).toBe(rowMenu('ProjectC'));
      });
    });

    /**
     * ⚠️ The branch the first cut of this fix missed entirely. `CvLibraryPage`
     * gates the empty-library panel — which carries the middle rung — on the
     * **unfiltered** count, so deleting the last row matching an active filter
     * leaves `VersionTable`'s own no-results panel, where that rung does not
     * exist. Only the page's own heading outlives both empties.
     */
    it('lands on the page heading when the delete empties a filtered view', async () => {
      const user = userEvent.setup();
      seedThreeVersions();
      renderPage();

      fireEvent.change(screen.getByLabelText('Search versions'), {
        target: { value: 'ProjectB' },
      });
      expect(rowMenu('ProjectB')).toBeTruthy();

      await deleteRow(user, 'ProjectB');

      await waitFor(() => {
        // The library still holds two versions, so the empty-library panel and
        // its call to action never mount — this is the filtered empty.
        expect(screen.getByText('No results found')).toBeTruthy();
        expect(document.activeElement).not.toBe(document.body);
        expect(document.activeElement).toBe(document.getElementById('cv-library-heading'));
      });
    });

    /** The whole library empties: the invitation to back up is the middle rung. */
    it('lands on the empty-state call to action when the last version goes', async () => {
      const user = userEvent.setup();
      mocks.isCloudActive.value = true;
      useCvLibraryStore.getState().setReady(
        {
          en: {
            github: [
              { name: 'ProjectA.json', label: 'ProjectA', updatedAt: '2026-07-03T10:00:00Z' },
            ],
          },
        },
        { en: 'backups/en' },
      );
      renderPage();

      await deleteRow(user, 'ProjectA');

      await waitFor(() => {
        expect(screen.getByText('No versions in the cloud yet')).toBeTruthy();
        expect(document.activeElement).toBe(document.getElementById('cv-library-empty-cta'));
      });
    });
  });
});
