// @vitest-environment jsdom
import { ExportModal } from '@/components/modals/export/ExportModal';
import { clearExportDraft } from '@/components/modals/export/exportDraft';
import { type ProviderState } from '@/hooks/sync/providerState';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, string | number>) =>
      typeof vars?.count === 'number' ? `${key}_${vars.count === 1 ? 'one' : 'other'}` : key,
    uiLanguage: 'en',
  }),
}));

const ensureConnected = vi.fn();
vi.mock('@/hooks/sync/useSyncAuthGateway', () => ({
  useSyncAuthGateway: () => ({ ensureConnected }),
}));

const providerStates = {
  github: 'not_connected' as ProviderState,
  googleDrive: 'not_connected' as ProviderState,
};
vi.mock('@/hooks/sync/useProviderStates', () => ({
  useProviderStates: () => providerStates,
}));

const storeState = {
  resume: {
    meta: {
      theme: { locale: 'en', name: 'default', params: { palette: 'a' } },
      export: { hostingPath: '/docs' },
      content: { order: { twoColumn: { sidebarPosition: 'left' } } },
    },
    coverLetter: { enabled: false },
  },
  updateMeta: vi.fn(),
  syncVersion: vi.fn(),
  sync: {},
  viewMode: 'edit',
};
vi.mock('@/store/resume/useResumeStore', () => ({
  useResumeStore: Object.assign(
    (selector: (s: typeof storeState) => unknown) => selector(storeState),
    { getState: () => storeState },
  ),
}));

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { EXPORT_MODAL_OPENED: 'export_opened', EXPORT_PERFORMED: 'export_performed' },
  analytics: { track: vi.fn() },
}));

vi.mock('@/utils/export', () => ({
  getProjectFilename: () => 'my-cv',
  constructBackupFilename: (base: string) => base,
  getCleanProjectName: (name: string) => name,
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const runDestination = vi.fn(async () => ({ success: true }));
vi.mock('@/hooks/export/destinationAdapters', () => ({
  runDestination: (...args: unknown[]) => runDestination(...(args as [])),
}));

vi.mock('@/hooks/export/buildExportArtifacts', () => ({
  buildExportArtifacts: async () => ({
    folderName: 'my-cv',
    backupFileName: 'my-cv',
    json: '{}',
    html: null,
    pdf: null,
  }),
}));

vi.mock('@/hooks/useCloudSync', () => ({
  useCloudSync: () => ({ handleSync: vi.fn(async () => ({ success: true, results: [] })) }),
}));

vi.mock('@/store/ui/useToastStore', () => ({
  useToastStore: (selector: (s: { addToast: unknown }) => unknown) =>
    selector({ addToast: vi.fn() }),
}));

vi.mock('@/components/preview/ThemeRegistry', () => ({
  getThemeMeta: () => ({ id: 'default', layout: 'single-column' }),
}));

function renderModal(overrides: { isOpen?: boolean } = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSetupRequired: vi.fn(),
    ...overrides,
  };
  render(<ExportModal {...props} />);
  return props;
}

describe('ExportModal', () => {
  beforeEach(() => {
    localStorage.clear();
    clearExportDraft();
    providerStates.github = 'not_connected';
    providerStates.googleDrive = 'not_connected';
    storeState.resume.coverLetter.enabled = false;
  });

  afterEach(() => {
    clearExportDraft();
  });

  it('names the export dialog by its parameterized title', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'sync.export_dialog.title' })).toBeTruthy();
  });

  it('switches the title to the application-documents label when a cover letter is enabled', () => {
    storeState.resume.coverLetter.enabled = true;
    renderModal();
    expect(screen.getByRole('dialog', { name: 'sync.export_dialog.title_documents' })).toBeTruthy();
  });

  it('stays closed when not open', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('offers the ZIP and the cloud setup row while nothing is connected', () => {
    renderModal();

    expect(screen.getByRole('switch', { name: 'sync.export_dialog.dest_zip_label' })).toBeTruthy();
    expect(
      screen.queryByRole('switch', { name: 'sync.export_dialog.dest_github_repo_label' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'sync.export_dialog.cloud_setup_action' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /sync\.export_dialog\.trigger_one/ })).toBeTruthy();
  });

  it('exposes each destination as a switch reporting its own checked state', () => {
    providerStates.github = 'active';
    renderModal();

    const zip = screen.getByRole('switch', { name: 'sync.export_dialog.dest_zip_label' });
    const repo = screen.getByRole('switch', { name: 'sync.export_dialog.dest_github_repo_label' });

    expect(zip.getAttribute('aria-checked')).toBe('true');
    expect(repo.getAttribute('aria-checked')).toBe('false');
  });

  it('offers the publish row and its target path once GitHub is connected', () => {
    providerStates.github = 'active';
    renderModal();

    expect(
      screen.getByRole('switch', { name: 'sync.export_dialog.dest_github_pages_label' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('sync.export_dialog.dest_github_pages_path_label')).toBeTruthy();
  });

  it('offers no publish row to a Drive-only user, because Pages is GitHub-specific', () => {
    providerStates.googleDrive = 'active';
    renderModal();

    expect(
      screen.getByRole('switch', { name: 'sync.export_dialog.dest_google_drive_label' }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('switch', { name: 'sync.export_dialog.dest_github_pages_label' }),
    ).toBeNull();
  });

  it('relabels the trigger as destinations are toggled on', async () => {
    providerStates.github = 'active';
    const user = userEvent.setup();
    renderModal();

    await user.click(
      screen.getByRole('switch', { name: 'sync.export_dialog.dest_github_repo_label' }),
    );

    expect(screen.getByRole('button', { name: /sync\.export_dialog\.trigger_other/ })).toBeTruthy();
  });

  it('routes the setup row through the sync gateway in push mode', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'sync.export_dialog.cloud_setup_action' }));

    expect(ensureConnected).toHaveBeenCalledWith(expect.objectContaining({ mode: 'push' }));
  });

  // The toast carries the result; only a failure keeps the report on screen (#34).
  it('closes on its own after a fully successful run', async () => {
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /sync\.export_dialog\.trigger_one/ }));

    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
  });

  it('reports a failed destination in its row and relabels the trigger as a retry', async () => {
    runDestination.mockResolvedValueOnce({ success: false, error: 'disk full' } as never);
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /sync\.export_dialog\.trigger_one/ }));

    await waitFor(() => expect(screen.getByText('disk full')).toBeTruthy());
    expect(screen.getByRole('button', { name: /sync\.export_dialog\.retry_one/ })).toBeTruthy();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('mounts the live region before it has anything to say', () => {
    const { container } = render(<ExportModal isOpen onClose={vi.fn()} />);
    const region = container.ownerDocument.querySelector('[role="status"][aria-live="polite"]');
    expect(region).toBeTruthy();
    expect(region?.textContent).toBe('');
  });

  it('keeps the backup format locked rather than offering a switch that refuses to move', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /sync\.export_dialog\.package_summary/ }));

    expect(
      screen.getByRole('switch', { name: 'sync.export_dialog.package_pdf_label' }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('switch', { name: 'sync.export_dialog.package_backup_label' }),
    ).toBeNull();
  });
});
