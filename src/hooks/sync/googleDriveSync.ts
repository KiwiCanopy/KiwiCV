import { GOOGLE_DRIVE_FOLDER } from '@/constants/cloud';
import { buildExportArtifacts } from '@/hooks/export/buildExportArtifacts';
import { type SyncParams, type SyncResult } from '@/hooks/sync/types';
import { type DriveUploadFile, googleDriveService } from '@/services/google-drive';
import {
  GOOGLE_LAST_FULL_PUSH_HASH_KEY,
  GOOGLE_LAST_SYNC_HASH_KEY,
  getGoogleLastFullPushHash,
  getGoogleLastSyncHash,
  googleDriveConnection,
} from '@/services/storage/googleStorage';
import { fullPushStamp } from '@/services/storage/syncHashes';
import { useSignatureStore } from '@/store/signature/useSignatureStore';
import { toDriveAppProperties, wrapBackupJson } from '@/utils/applicationMeta';
import {
  constructBackupFilename,
  getCleanProjectName,
  getProjectFilename,
  parseBackupFilename,
  sanitizePath,
} from '@/utils/export';
import { stringifyResume } from '@/utils/passthrough';

/**
 * The folder an unfinished export wrote to, so its retry adds no second one (#91).
 * Only the same content under the same name and account is a retry. Lost on reload.
 */
let claimedFolder: {
  refreshToken: string;
  requested: string;
  currentHash: string;
  folder: string;
} | null = null;

const writeDeliverables = async (
  refreshToken: string,
  requested: string,
  currentHash: string,
  files: DriveUploadFile[],
) => {
  const exportsPath = [GOOGLE_DRIVE_FOLDER, 'exports'];
  if (
    claimedFolder?.refreshToken === refreshToken &&
    claimedFolder.requested === requested &&
    claimedFolder.currentHash === currentHash
  ) {
    await googleDriveService.sync(refreshToken, [...exportsPath, claimedFolder.folder], files);
    return claimedFolder.folder;
  }
  const { folderName } = await googleDriveService.sync(
    refreshToken,
    [...exportsPath, requested],
    files,
    true, // Auto-increment folder name on collision
  );
  const folder = folderName || requested;
  claimedFolder = { refreshToken, requested, currentHash, folder };
  return folder;
};

/** `sanitizePath` truncates a base here, which would otherwise eat the suffix. */
const MAX_BASE_LENGTH = 50;

/** Applies a folder-style `_2` to a snapshot name, past its base and before its metadata. */
const withSuffix = (backupFileName: string, suffix: string) => {
  if (!suffix) return backupFileName;
  const meta = parseBackupFilename(backupFileName);
  const base = sanitizePath(meta.base).slice(0, MAX_BASE_LENGTH - suffix.length) + suffix;
  return constructBackupFilename(base, meta.company, meta.position, meta.theme);
};

const MAX_SNAPSHOT_COUNTER = 100;

/**
 * Picks a snapshot name nothing holds yet, preferring the folder's suffix. Folders
 * and snapshots no longer advance together (#92), so a free folder proves nothing.
 */
const freeSnapshotName = async (
  refreshToken: string,
  backupPath: string[],
  backupFileName: string,
  folderSuffix: string,
  t: SyncParams['t'],
) => {
  const files = await googleDriveService.listFiles(refreshToken, backupPath);
  const taken = new Set(files.map((file) => file.name));
  const preferred = withSuffix(backupFileName, folderSuffix);
  if (!taken.has(`${preferred}.json`)) return preferred;
  for (let counter = 2; counter <= MAX_SNAPSHOT_COUNTER; counter++) {
    const name = withSuffix(backupFileName, `_${counter}`);
    if (!taken.has(`${name}.json`)) return name;
  }
  throw new Error(t('common.error'));
};

export const performGoogleDriveSync = async (params: SyncParams): Promise<SyncResult> => {
  const { resume, variant, lang, t, currentHash, includeBackup } = params;

  try {
    const connection = googleDriveConnection();
    const { refreshToken } = connection;
    if (!refreshToken) throw new Error(t('sync.error_google_creds'));

    // --- Redundant Sync Protection ---
    let alreadySynced = false;

    if (variant === 'full') {
      const backupFileName = params.projectName || getProjectFilename(resume);
      const lastFullHash = getGoogleLastFullPushHash();
      if (lastFullHash === (await fullPushStamp(currentHash, backupFileName, params.postingUrl))) {
        alreadySynced = true;
      }
    } else if (variant === 'hosting') {
      // Google Drive doesn't support hosting, so we skip it (but mark as success)
      return { service: 'google_drive', success: true };
    } else {
      // standard or config (Backup button)
      const lastSyncHash = getGoogleLastSyncHash();
      if (lastSyncHash === currentHash) {
        alreadySynced = true;
      }
    }

    if (alreadySynced) {
      return { service: 'google_drive', success: true, alreadySynced: true };
    }

    const driveFolder = GOOGLE_DRIVE_FOLDER;

    // 1. MAIN BACKUP: Sync the latest state to backups/{lang}/resume.json
    // This keeps the general restoration point up to date
    // We only update this master backup if the user clicked the Save button (mode === 'sync')
    if (includeBackup && params.mode === 'sync') {
      const filesToSync: { name: string; content: string | Blob; contentType: string }[] = [];
      filesToSync.push({
        name: 'resume.json',
        content: stringifyResume(resume),
        contentType: 'application/json',
      });

      const backupPath = [driveFolder, 'backups', lang];
      await googleDriveService.sync(refreshToken, backupPath, filesToSync);
      connection.writeHash(GOOGLE_LAST_SYNC_HASH_KEY, currentHash);
    }

    // 2. FULL EXPORT: Sync deliverables and project snapshots
    if (variant === 'full') {
      const backupFileName = params.projectName || getProjectFilename(resume);
      const cleanFolderName = getCleanProjectName(backupFileName);

      // --- Deliverables (PDF/HTML) to exports/{finalFolderName}/ ---
      const filesToPush: { name: string; content: string | Blob; contentType: string }[] = [];

      // The deliverables are built once per run by the caller. Compiling here
      // would drive the single Typst worker a second time for the same export.
      const artifacts =
        params.artifacts ??
        (await buildExportArtifacts({
          resume,
          projectName: backupFileName,
          signature: useSignatureStore.getState().signature,
        }));

      if (artifacts.pdf) {
        filesToPush.push({
          name: `${cleanFolderName}.pdf`,
          content: artifacts.pdf,
          contentType: 'application/pdf',
        });
      }

      if (artifacts.html) {
        filesToPush.push({ name: 'index.html', content: artifacts.html, contentType: 'text/html' });
      }

      const backupPath = [driveFolder, 'backups', lang];
      let finalFolderName = cleanFolderName;
      if (filesToPush.length > 0) {
        finalFolderName = await writeDeliverables(
          refreshToken,
          cleanFolderName,
          currentHash,
          filesToPush,
        );
      }

      const finalBackupFileName = await freeSnapshotName(
        refreshToken,
        backupPath,
        backupFileName,
        finalFolderName.substring(cleanFolderName.length),
        t,
      );

      // --- Project Snapshot (JSON) to backups/{lang}/{finalBackupFileName}.json ---
      // The link also goes in `appProperties`, which the library listing reads
      // without opening the file (#54).
      const postingUrl = params.postingUrl ?? null;
      const snapshotFiles: DriveUploadFile[] = [];
      snapshotFiles.push({
        name: `${finalBackupFileName}.json`,
        content: wrapBackupJson(artifacts.json, postingUrl),
        contentType: 'application/json',
        appProperties: toDriveAppProperties(postingUrl),
      });

      await googleDriveService.sync(refreshToken, backupPath, snapshotFiles);
      claimedFolder = null;

      // The requested name, as the check above compares; a renamed folder is Drive's choice.
      const stamp = await fullPushStamp(currentHash, backupFileName, params.postingUrl);
      connection.writeHash(GOOGLE_LAST_FULL_PUSH_HASH_KEY, stamp);
      return {
        service: 'google_drive',
        success: true,
        ...(finalFolderName !== cleanFolderName && { renamedFolder: finalFolderName }),
      };
    }

    return { service: 'google_drive', success: true };
  } catch (err: unknown) {
    return {
      service: 'google_drive',
      success: false,
      error: (err as Error).message,
    };
  }
};
