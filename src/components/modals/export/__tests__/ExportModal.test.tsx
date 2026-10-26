// @vitest-environment jsdom
import { ExportModal } from '@/components/modals/export/ExportModal';
import { clearExportDraft } from '@/hooks/export/exportDraft';
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
    coverLetter: {
      enabled: false,
      subject: '',
      paragraphs: [] as string[],
      outdated: undefined as boolean | undefined,
    },
  },
  updateMeta: vi.fn(),
  updateCoverLetter: vi.fn(),
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

const confirm = vi.fn(async (): Promise<boolean | null> => null);
vi.mock('@/store/ui/useConfirmStore', () => ({
  useConfirmStore: (selector: (s: { confirm: typeof confirm }) => unknown) => selector({ confirm }),
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

const buildExportArtifacts = vi.fn(async () => ({
  folderName: 'my-cv',
  backupFileName: 'my-cv',
  json: '{}',
  html: null,
  pdf: null,
}));
vi.mock('@/hooks/export/buildExportArtifacts', () => ({
  buildExportArtifacts: (...args: unknown[]) => buildExportArtifacts(...(args as [])),
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
    storeState.resume.coverLetter.paragraphs = [];
    storeState.resume.coverLetter.outdated = undefined;
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

  it('offers the cover letter switch, with its warning, once there is a letter', () => {
    Object.assign(storeState.resume.coverLetter, {
      enabled: true,
      paragraphs: ['Dear team,'],
      outdated: true,
    });
    renderModal();
    expect(screen.getByRole('switch', { name: 'sync.export_dialog.letter_toggle' })).toBeTruthy();
    expect(screen.getByText('sync.export_dialog.letter_outdated')).toBeTruthy();
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

  // `buildExportArtifacts` is the run's first call, before any await, so a
  // not-called assertion right after the keystroke is reliable.
  it('starts the export on Cmd+Enter or Ctrl+Enter from a field, never on plain Enter', async () => {
    const user = userEvent.setup();
    renderModal();
    const company = screen.getByRole('textbox', { name: 'sync.export_modal_company_label' });

    await user.type(company, 'Acme{Enter}');
    expect(buildExportArtifacts).not.toHaveBeenCalled();

    await user.type(company, '{Meta>}{Enter}{/Meta}');
    expect(buildExportArtifacts).toHaveBeenCalledTimes(1);
  });

  it('takes Ctrl+Enter too', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(
      screen.getByRole('textbox', { name: 'sync.export_modal_company_label' }),
      '{Control>}{Enter}{/Control}',
    );
    expect(buildExportArtifacts).toHaveBeenCalledTimes(1);
  });

  it('leaves Cmd+Enter alone on a link, where it opens a new tab', async () => {
    providerStates.github = 'active';
    const user = userEvent.setup();
    renderModal();
    screen.getByRole('link', { name: 'sync.export_dialog.manage_link' }).focus();

    await user.keyboard('{Meta>}{Enter}{/Meta}');
    expect(buildExportArtifacts).not.toHaveBeenCalled();
  });

  it('presses nothing the trigger would refuse: an empty name', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole('button', { name: 'sync.export_dialog.rename' }));
    const base = screen.getByRole('textbox', { name: 'sync.export_modal_input_label' });
    await user.clear(base);

    await user.type(base, '{Meta>}{Enter}{/Meta}');
    expect(buildExportArtifacts).not.toHaveBeenCalled();
  });

  it('closes once a retry clears the last failure', async () => {
    runDestination.mockResolvedValueOnce({ success: false, error: 'disk full' } as never);
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /sync\.export_dialog\.trigger_one/ }));
    await user.click(await screen.findByRole('button', { name: /sync\.export_dialog\.retry_one/ }));

    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
  });

  it('stays open when the package cannot be built', async () => {
    buildExportArtifacts.mockRejectedValueOnce(new Error('Serializer not found'));
    const user = userEvent.setup();
    const props = renderModal();

    await user.click(screen.getByRole('button', { name: /sync\.export_dialog\.trigger_one/ }));

    await waitFor(() =>
      expect(screen.getByText('sync.export_dialog.build_failed_hint')).toBeTruthy(),
    );
    expect(props.onClose).not.toHaveBeenCalled();
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

  describe('an outdated cover letter', () => {
    const trigger = () => screen.getByRole('button', { name: /sync\.export_dialog\.trigger_one/ });

    beforeEach(() => {
      Object.assign(storeState.resume.coverLetter, {
        enabled: true,
        paragraphs: ['Dear team,'],
        outdated: true,
      });
      // Replaces rather than mutates, like the immer store: a run reading a stale
      // render would then still see the letter on.
      storeState.updateCoverLetter.mockImplementation((patch: { enabled?: boolean }) => {
        storeState.resume = {
          ...storeState.resume,
          coverLetter: { ...storeState.resume.coverLetter, ...patch },
        };
      });
    });

    afterEach(() => {
      storeState.updateCoverLetter.mockReset();
    });

    it('asks before exporting, focusing the safe choice', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(trigger());

      expect(confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmText: 'sync.export_dialog.letter_confirm_without',
          cancelText: 'sync.export_dialog.letter_confirm_anyway',
          preferredFocus: 'confirm',
        }),
      );
      // The trigger is busy once the run starts, so focus returns to the dialog.
      const [{ restoreFocusTo }] = confirm.mock.calls[0] as unknown as [
        { restoreFocusTo: () => HTMLElement | null },
      ];
      expect(restoreFocusTo()).toBe(screen.getByRole('dialog'));
    });

    it('exports nothing when the question is dismissed', async () => {
      confirm.mockResolvedValueOnce(null);
      const user = userEvent.setup();
      renderModal();

      await user.click(trigger());

      await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
      expect(buildExportArtifacts).not.toHaveBeenCalled();
    });

    it('switches the letter off before building when exporting without it', async () => {
      confirm.mockResolvedValueOnce(true);
      const user = userEvent.setup();
      renderModal();

      await user.click(trigger());

      await waitFor(() => expect(buildExportArtifacts).toHaveBeenCalledTimes(1));
      expect(storeState.updateCoverLetter).toHaveBeenCalledWith({ enabled: false });
      expect(buildExportArtifacts).toHaveBeenCalledWith(
        expect.objectContaining({
          resume: expect.objectContaining({
            coverLetter: expect.objectContaining({ enabled: false }),
          }),
        }),
      );
    });

    it('keeps the letter and asks only once when exporting anyway', async () => {
      confirm.mockResolvedValueOnce(false);
      runDestination.mockResolvedValueOnce({ success: false, error: 'offline' } as never);
      const user = userEvent.setup();
      renderModal();

      await user.click(trigger());
      await waitFor(() => expect(buildExportArtifacts).toHaveBeenCalledTimes(1));
      expect(storeState.updateCoverLetter).not.toHaveBeenCalled();

      await user.click(await screen.findByRole('button', { name: /sync\.export_dialog\.retry/ }));
      await waitFor(() => expect(buildExportArtifacts).toHaveBeenCalledTimes(2));
      expect(confirm).toHaveBeenCalledTimes(1);
    });

    it('does not ask for a letter that is current', async () => {
      storeState.resume.coverLetter.outdated = false;
      const user = userEvent.setup();
      renderModal();

      await user.click(trigger());

      await waitFor(() => expect(buildExportArtifacts).toHaveBeenCalledTimes(1));
      expect(confirm).not.toHaveBeenCalled();
    });

    it('asks again once the letter is switched off and back on', async () => {
      confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(null);
      runDestination.mockResolvedValueOnce({ success: false, error: 'offline' } as never);
      const user = userEvent.setup();
      const { rerender } = render(<ExportModal isOpen onClose={vi.fn()} />);

      await user.click(trigger());
      await screen.findByRole('button', { name: /sync\.export_dialog\.retry/ });

      storeState.resume = {
        ...storeState.resume,
        coverLetter: { ...storeState.resume.coverLetter, enabled: false },
      };
      rerender(<ExportModal isOpen onClose={vi.fn()} />);
      storeState.resume = {
        ...storeState.resume,
        coverLetter: { ...storeState.resume.coverLetter, enabled: true },
      };
      rerender(<ExportModal isOpen onClose={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /sync\.export_dialog\.retry/ }));
      await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2));
    });

    it('does not ask when the letter is not included', async () => {
      storeState.resume.coverLetter.enabled = false;
      const user = userEvent.setup();
      renderModal();

      await user.click(trigger());

      await waitFor(() => expect(buildExportArtifacts).toHaveBeenCalledTimes(1));
      expect(confirm).not.toHaveBeenCalled();
    });

    it('does not ask when the PDF, the only format carrying the letter, is off', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(
        screen.getByRole('button', { name: /sync\.export_dialog\.package_summary/ }),
      );
      await user.click(
        screen.getByRole('switch', { name: 'sync.export_dialog.package_pdf_label' }),
      );

      await user.click(trigger());

      await waitFor(() => expect(buildExportArtifacts).toHaveBeenCalledTimes(1));
      expect(confirm).not.toHaveBeenCalled();
    });
  });
});
