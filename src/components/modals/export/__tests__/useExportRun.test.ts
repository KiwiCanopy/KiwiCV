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
  results: { service: string; success: boolean; error?: string }[];
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
  useResumeStore: Object.assign(() => undefined, { getState: () => ({ syncVersion }) }),
}));

vi.mock('@/components/preview/ThemeRegistry', () => ({
  getThemeMeta: () => ({ id: 'default', layout: 'single-column' }),
}));

const resume = initialResumeState as ResumeData;

function renderRun(formats = { pdf: true, html: true }) {
  return renderHook(() => useExportRun({ resume, formats }));
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
