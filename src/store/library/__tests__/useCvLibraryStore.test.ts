import {
  type BackupDiscoveryMap,
  type BackupFile,
  useCvLibraryStore,
} from '@/store/library/useCvLibraryStore';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useCvLibraryStore', () => {
  beforeEach(() => {
    useCvLibraryStore.getState().reset();
  });

  it('removes a discovered Drive file by ID without deleting a same-name sibling', () => {
    const canonical: BackupFile = {
      id: 'canonical-id',
      name: 'resume.json',
      label: 'Manual backup',
      driveRoot: 'KiwiCV',
    };
    const legacy: BackupFile = {
      id: 'legacy-id',
      name: 'resume.json',
      label: 'Manual backup',
      driveRoot: 'CVCanvas',
    };
    const discoveryData: BackupDiscoveryMap = {
      en: { google_drive: [canonical, legacy] },
    };

    useCvLibraryStore.getState().setReady(discoveryData, {});
    useCvLibraryStore.getState().removeFile('en', 'google_drive', legacy);

    expect(useCvLibraryStore.getState().discoveryData?.en.google_drive).toEqual([canonical]);
  });

  it('setReady records the GitHub path map and a load timestamp', () => {
    useCvLibraryStore.getState().setReady({ de: { github: [] } }, { de: 'backup/de' });

    const state = useCvLibraryStore.getState();
    expect(state.status).toBe('ready');
    expect(state.githubPaths).toEqual({ de: 'backup/de' });
    expect(state.loadedAt).toBeTypeOf('number');
    expect(state.failedSources).toEqual([]);
  });

  it('reset returns the store to idle with no cached discovery', () => {
    useCvLibraryStore.getState().setReady({ en: { github: [] } }, { en: 'backups/en' }, ['github']);
    useCvLibraryStore.getState().reset();

    const state = useCvLibraryStore.getState();
    expect(state.status).toBe('idle');
    expect(state.discoveryData).toBeNull();
    expect(state.githubPaths).toEqual({});
    expect(state.failedSources).toEqual([]);
    expect(state.loadedAt).toBeNull();
  });
});
