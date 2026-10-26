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
import { toDriveAppProperties, wrapBackupJson } from '@/utils/applicationMeta';
import {
  constructBackupFilename,
  getCleanProjectName,
  getProjectFilename,
  parseBackupFilename,
} from '@/utils/export';
import { stringifyResume } from '@/utils/passthrough';

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

      // --- Deliverables (PDF/HTML) to exports/{cleanFolderName}/ ---
      const exportPath = [driveFolder, 'exports', cleanFolderName];
      const filesToPush: { name: string; content: string | Blob; contentType: string }[] = [];

      // The deliverables are built once per run by the caller. Compiling here
      // would drive the single Typst worker a second time for the same export.
      const artifacts =
        params.artifacts ?? (await buildExportArtifacts({ resume, projectName: backupFileName }));

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

      let finalFolderName = cleanFolderName;

      const { folderName } = await googleDriveService.sync(
        refreshToken,
        exportPath,
        filesToPush,
        true, // Auto-increment folder name on collision
      );
      finalFolderName = folderName || cleanFolderName;

      let finalBackupFileName = backupFileName;
      if (finalFolderName !== cleanFolderName) {
        // If the folder was auto-incremented (e.g. "_2"), apply that suffix to the backup filename
        const suffix = finalFolderName.substring(cleanFolderName.length);
        const meta = parseBackupFilename(backupFileName);
        finalBackupFileName = constructBackupFilename(
          meta.base + suffix,
          meta.company,
          meta.position,
          meta.theme,
        );
      }

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

      const backupPath = [driveFolder, 'backups', lang];
      await googleDriveService.sync(refreshToken, backupPath, snapshotFiles);

      // The requested name, as the check above compares; a renamed folder is Drive's choice.
      const stamp = await fullPushStamp(currentHash, backupFileName, params.postingUrl);
      connection.writeHash(GOOGLE_LAST_FULL_PUSH_HASH_KEY, stamp);
      return { service: 'google_drive', success: true, folderName: finalFolderName };
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
