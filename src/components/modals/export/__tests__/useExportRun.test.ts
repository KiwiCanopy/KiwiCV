// @vitest-environment jsdom
import { ALL_OK_TOAST_MS, useExportRun } from '@/components/modals/export/useExportRun';
import { type ExportArtifacts } from '@/hooks/export/types';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The regression that matters: the PDF compile, the HTML render and the JSON
 * serialization used to live in three places behind one Typst worker, so a run
 * targeting three destinations would have paid the slow compile three times.
 * The call count below is the guard for that, and it is why the artifacts are
 * built before any destination is touched rather than inside each adapter.
 */

const artifacts: ExportArtifacts = {
  folderName: 'Ada_Lovelace',
  backupFileName: 'Ada_Lovelace_position_undefined_company_undefined_theme_default',
  json: '{}',
  html: '<html></html>',
  pdf: null,
};

const buildExportArtifacts = vi.fn(async () => artifacts);
vi.mock('@/hooks/export/buildExportArtifacts', () => ({
  buildExportArtifacts: (...args: unknown[]) => buildExportArtifacts(...(args as [])),
}));

const saveAs = vi.fn();
vi.mock('file-saver', () => ({ saveAs: (...args: unknown[]) => saveAs(...(args as [])) }));

type HandleSync = (
  variant: string,
  projectName: string,
  mode: string,
  options?: { providers?: string[] },
) => Promise<{
  success: boolean;
  results: { service: string; success: boolean; error?: string; renamedFolder?: string }[];
}>;

let handleSyncImpl: HandleSync = async () => ({ success: true, results: [] });
const handleSync = vi.fn<HandleSync>((...args) => handleSyncImpl(...args));
vi.mock('@/hooks/useCloudSync', () => ({
  useCloudSync: () => ({ handleSync }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const track = vi.fn();
vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { EXPORT_PERFORMED: 'export_performed' },
  analytics: { track: (...args: unknown[]) => track(...(args as [])) },
}));

const addToast = vi.fn();
vi.mock('@/store/ui/useToastStore', () => ({
  useToastStore: (selector: (s: { addToast: unknown }) => unknown) => selector({ addToast }),
}));

const syncVersion = vi.fn();
vi.mock('@/store/resume/useResumeStore', () => ({
  useResumeStore: Object.assign(() => undefined, { getState: () => ({ syncVersion, resume }) }),
}));

vi.mock('@/components/preview/ThemeRegistry', () => ({
  getThemeMeta: () => ({ id: 'default', layout: 'single-column' }),
}));

const resume = initialResumeState as ResumeData;

function renderRun(formats = { pdf: true, html: true }) {
  return renderHook(() => useExportRun({ formats }));
}

describe('useExportRun', () => {
  beforeEach(() => {
    handleSyncImpl = async () => ({ success: true, results: [] });
  });

  it('builds the export package exactly once for three destinations', async () => {
    const { result } = renderRun();

    await act(async () => {
      await result.current.run(['zip', 'github_repo', 'google_drive'], 'Ada');
    });

    expect(buildExportArtifacts).toHaveBeenCalledTimes(1);
    expect(handleSync).toHaveBeenCalledTimes(2);
    expect(result.current.succeeded).toEqual(['zip', 'github_repo', 'google_drive']);
  });

  it('hands every cloud destination the same prebuilt artifacts', async () => {
    const { result } = renderRun();

    await act(async () => {
      await result.current.run(['github_repo', 'google_drive'], 'Ada');
    });

    for (const call of handleSync.mock.calls) {
      expect(call[3]).toMatchObject({ artifacts });
    }
  });

  it('bumps the resume version once per run, not once per destination', async () => {
    const { result } = renderRun();

    await act(async () => {
      await result.current.run(['zip', 'github_repo', 'google_drive'], 'Ada');
    });

    expect(syncVersion).toHaveBeenCalledTimes(1);
  });

  it('leaves the other destinations intact when one rejects', async () => {
    handleSyncImpl = async (_variant, _name, _mode, options) => {
      if (options?.providers?.includes('github')) throw new Error('token expired');
      return { success: true, results: [] };
    };

    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['zip', 'github_repo', 'google_drive'], 'Ada');
    });

    expect(result.current.succeeded).toEqual(['zip', 'google_drive']);
    expect(result.current.failed).toEqual(['github_repo']);
    expect(result.current.state.rows.github_repo?.error).toBe('token expired');
    expect(saveAs).toHaveBeenCalledTimes(1);
  });

  it('reports a provider failure result as a failed row rather than a throw', async () => {
    handleSyncImpl = async (_variant, _name, _mode, options) =>
      options?.providers?.includes('google_drive')
        ? { success: false, results: [{ service: 'google_drive', success: false, error: 'quota' }] }
        : { success: true, results: [] };

    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['github_repo', 'google_drive'], 'Ada');
    });

    expect(result.current.state.rows.google_drive).toEqual({ status: 'failed', error: 'quota' });
  });

  it('retries only the failed destinations', async () => {
    handleSyncImpl = async (_variant, _name, _mode, options) => {
      if (options?.providers?.includes('github')) throw new Error('token expired');
      return { success: true, results: [] };
    };

    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['zip', 'github_repo', 'google_drive'], 'Ada');
    });

    handleSync.mockClear();
    buildExportArtifacts.mockClear();
    handleSyncImpl = async () => ({ success: true, results: [] });

    await act(async () => {
      await result.current.run(result.current.failed, 'Ada');
    });

    expect(handleSync).toHaveBeenCalledTimes(1);
    expect(handleSync.mock.calls[0][3]).toMatchObject({ providers: ['github'] });
    expect(buildExportArtifacts).toHaveBeenCalledTimes(1);
    expect(result.current.failed).toEqual([]);
  });

  it('keeps a succeeded row, with its notice, through a retry (#90)', async () => {
    const drive = { service: 'google_drive', success: true, renamedFolder: 'Ada_2' };
    handleSyncImpl = async (_variant, _name, _mode, options) =>
      options?.providers?.includes('github')
        ? { success: false, results: [{ service: 'github', success: false, error: 'expired' }] }
        : { success: true, results: [drive] };
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['github_repo', 'google_drive'], 'Ada');
    });
    const driveRow = result.current.state.rows.google_drive;
    expect(driveRow?.status).toBe('done');

    let retried: Promise<void> | undefined;
    let release: () => void = () => {};
    handleSyncImpl = () =>
      new Promise((resolve) => {
        release = () => resolve({ success: false, results: [] });
      });
    act(() => {
      retried = result.current.run(result.current.failed, 'Ada');
    });

    expect(result.current.state.rows.google_drive).toEqual(driveRow);
    expect(result.current.state.runIds).toEqual(['github_repo']);

    await act(async () => {
      await vi.waitFor(() =>
        expect(handleSync).toHaveBeenLastCalledWith(
          'full',
          'Ada',
          'sync',
          expect.objectContaining({ providers: ['github'] }),
        ),
      );
      release();
      await retried;
    });

    expect(result.current.state.rows.google_drive).toEqual(driveRow);
    expect(result.current.failed).toEqual(['github_repo']);
    expect(result.current.succeeded).toEqual(['google_drive']);
  });

  it('keeps a succeeded row when the retry cannot build the package (#90)', async () => {
    handleSyncImpl = async (_variant, _name, _mode, options) =>
      options?.providers?.includes('github')
        ? { success: false, results: [{ service: 'github', success: false, error: 'expired' }] }
        : { success: true, results: [] };
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['github_repo', 'google_drive'], 'Ada');
    });

    buildExportArtifacts.mockRejectedValueOnce(new Error('typst'));
    await act(async () => {
      await result.current.run(result.current.failed, 'Ada');
    });

    expect(result.current.state.rows.google_drive?.status).toBe('done');
    expect(result.current.state.rows.github_repo?.error).toBe('sync.export_dialog.build_failed');
    expect(result.current.failed).toEqual(['github_repo']);
    expect(addToast.mock.lastCall).toEqual([
      'sync.export_dialog.result_partial sync.export_dialog.build_failed_hint',
      'warning',
    ]);
  });

  it('fires one analytics event per run, carrying the destinations that succeeded', async () => {
    handleSyncImpl = async (_variant, _name, _mode, options) => {
      if (options?.providers?.includes('github')) throw new Error('nope');
      return { success: true, results: [] };
    };

    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['zip', 'github_repo', 'google_drive'], 'Ada');
    });

    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][1]).toMatchObject({
      providers: ['zip', 'google_drive'],
      formats: ['json', 'pdf', 'html'],
    });
  });

  it('fails every selected row for the same reason when the package cannot be built', async () => {
    buildExportArtifacts.mockRejectedValueOnce(new Error('Serializer not found'));

    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['zip', 'github_repo'], 'Ada');
    });

    expect(handleSync).not.toHaveBeenCalled();
    expect(result.current.failed).toEqual(['zip', 'github_repo']);
    expect(result.current.state.buildError).toBe('Serializer not found');
    expect(addToast).toHaveBeenCalledTimes(1);
  });

  it('raises exactly one toast per run, and it is always a translated key', async () => {
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['zip'], 'Ada');
    });

    expect(addToast).toHaveBeenCalledTimes(1);
    expect(addToast.mock.calls[0][0]).toMatch(/^sync\.export_dialog\./);
  });

  // The dialog closes on a full success, so its toast is the whole report (#34).
  it('keeps a full success on screen for ten seconds', async () => {
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['zip'], 'Ada');
    });
    expect(addToast).toHaveBeenLastCalledWith(expect.any(String), 'success', ALL_OK_TOAST_MS);
    expect(ALL_OK_TOAST_MS).toBe(10_000);
  });

  // The dialog closes on a full success, so a renamed folder has to reach the toast (#41).
  it('carries a renamed Drive folder into the row, the toast and the announcement', async () => {
    handleSyncImpl = async () => ({
      success: true,
      results: [{ service: 'google_drive', success: true, renamedFolder: 'Ada_Lovelace_2' }],
    });
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['google_drive'], 'Ada');
    });

    const message = addToast.mock.lastCall?.[0];
    expect(message).toContain('sync.export_dialog.result_all_ok');
    expect(message).toContain('sync.export_dialog.drive_folder_renamed');
    expect(addToast).toHaveBeenCalledTimes(1);
    expect(result.current.state.rows.google_drive?.notice).toBe(
      'sync.export_dialog.drive_folder_renamed',
    );
    expect(result.current.announcement).toBe(message);
  });

  it('leaves the toast and row plain when Drive wrote the folder it was asked for', async () => {
    handleSyncImpl = async () => ({
      success: true,
      results: [{ service: 'google_drive', success: true }],
    });
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['google_drive'], 'Ada');
    });

    expect(addToast.mock.lastCall?.[0]).toBe('sync.export_dialog.result_all_ok');
    expect(result.current.state.rows.google_drive?.notice).toBeUndefined();
  });

  it('names the renamed folder in a partial run, and again in the retry that finishes it', async () => {
    let githubFails = true;
    handleSyncImpl = async (_variant, _name, _mode, options) => {
      if (options?.providers?.includes('github')) {
        return githubFails
          ? { success: false, results: [{ service: 'github', success: false, error: 'expired' }] }
          : { success: true, results: [{ service: 'github', success: true }] };
      }
      return {
        success: true,
        results: [{ service: 'google_drive', success: true, renamedFolder: 'Ada_Lovelace_2' }],
      };
    };
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['github_repo', 'google_drive'], 'Ada');
    });

    const partial = addToast.mock.lastCall;
    expect(partial?.[0]).toContain('sync.export_dialog.result_partial');
    expect(partial?.[0]).toContain('sync.export_dialog.drive_folder_renamed');
    expect(partial?.[1]).toBe('warning');

    githubFails = false;
    await act(async () => {
      await result.current.run(result.current.failed, 'Ada');
    });

    expect(addToast.mock.lastCall?.[0]).toBe(
      'sync.export_dialog.result_all_ok sync.export_dialog.drive_folder_renamed',
    );
  });

  it('still reports the finished destination and its folder when the retry fails again', async () => {
    let githubFails = true;
    handleSyncImpl = async (_variant, _name, _mode, options) => {
      if (options?.providers?.includes('github')) {
        return githubFails
          ? { success: false, results: [{ service: 'github', success: false, error: 'expired' }] }
          : { success: true, results: [{ service: 'github', success: true }] };
      }
      return {
        success: true,
        results: [{ service: 'google_drive', success: true, renamedFolder: 'Ada_Lovelace_2' }],
      };
    };
    const { result } = renderRun();
    await act(async () => {
      await result.current.run(['github_repo', 'google_drive'], 'Ada');
    });
    await act(async () => {
      await result.current.run(result.current.failed, 'Ada');
    });

    const expected = 'sync.export_dialog.result_partial sync.export_dialog.drive_folder_renamed';
    expect(addToast.mock.lastCall).toEqual([expected, 'warning']);
    expect(result.current.announcement).toBe(expected);

    githubFails = false;
    await act(async () => {
      await result.current.run(result.current.failed, 'Ada');
    });

    expect(addToast.mock.lastCall?.[0]).toBe(
      'sync.export_dialog.result_all_ok sync.export_dialog.drive_folder_renamed',
    );
  });

  it('does nothing at all when no destination is selected', async () => {
    const { result } = renderRun();
    await act(async () => {
      await result.current.run([], 'Ada');
    });

    expect(buildExportArtifacts).not.toHaveBeenCalled();
    expect(result.current.state.hasRun).toBe(false);
  });

  it('passes the format choice through to the package build', async () => {
    const { result } = renderRun({ pdf: false, html: true });
    await act(async () => {
      await result.current.run(['zip'], 'Ada');
    });

    expect(buildExportArtifacts).toHaveBeenCalledWith(
      expect.objectContaining({ formats: { pdf: false, html: true }, projectName: 'Ada' }),
    );
  });
});
