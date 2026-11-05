// @vitest-environment jsdom
import { type DestinationRunContext, runDestination } from '@/hooks/export/destinationAdapters';
import { type ExportArtifacts } from '@/hooks/export/types';
import { type SyncResult } from '@/hooks/sync/types';
import { describe, expect, it, vi } from 'vitest';

const artifacts: ExportArtifacts = {
  folderName: 'MyCV',
  backupFileName: 'MyCV',
  json: '{}',
  html: null,
  pdf: null,
};

function contextWith(result: SyncResult): DestinationRunContext {
  return {
    artifacts,
    t: (key, vars) => (vars?.folder ? `${key}:${vars.folder}` : key),
    syncToCloud: vi.fn(async () => ({ success: result.success, results: [result] })),
  };
}

describe('cloud destination folder notice (#41)', () => {
  it('names the folder Drive actually wrote when it differs from the one asked for', async () => {
    const result = await runDestination(
      'google_drive',
      contextWith({ service: 'google_drive', success: true, renamedFolder: 'MyCV_2' }),
    );

    expect(result).toEqual({
      success: true,
      notice: 'sync.export_dialog.drive_folder_renamed:MyCV_2',
    });
  });

  it('says nothing when Drive wrote the folder it was asked for', async () => {
    const result = await runDestination(
      'google_drive',
      contextWith({ service: 'google_drive', success: true }),
    );

    expect(result).toEqual({ success: true });
  });

  it('reports no notice on a failed Drive write', async () => {
    const result = await runDestination(
      'google_drive',
      contextWith({
        service: 'google_drive',
        success: false,
        error: 'quota',
        renamedFolder: 'MyCV_2',
      }),
    );

    expect(result).toEqual({ success: false, error: 'quota' });
  });
});
