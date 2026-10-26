import { GOOGLE_DRIVE_READ_ROOTS } from './brand-config.js';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

async function fetchDriveFiles(accessToken, query, fields) {
  const files = [];
  let pageToken;

  do {
    const params = new URLSearchParams({
      q: query,
      fields: `nextPageToken,files(${fields})`,
      pageSize: '1000',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Google Drive discovery failed: ${await response.text()}`);
    }

    const data = await response.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

function folderChildrenQuery(parentId) {
  return `'${parentId}' in parents and mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`;
}

function compareBackups(left, right) {
  const rootDifference =
    GOOGLE_DRIVE_READ_ROOTS.indexOf(left.driveRoot) -
    GOOGLE_DRIVE_READ_ROOTS.indexOf(right.driveRoot);
  if (rootDifference !== 0) return rootDifference;

  return (right.modifiedTime || '').localeCompare(left.modifiedTime || '');
}

/**
 * Reads backups from the canonical KiwiCV root and the CVCanvas compatibility root.
 * The retired CV-Canvas root is intentionally never queried or mutated.
 */
export async function discoverBackups(accessToken) {
  const rootNameQuery = GOOGLE_DRIVE_READ_ROOTS.map((root) => `name = '${root}'`).join(' or ');
  const rootQuery = `(${rootNameQuery}) and mimeType = '${FOLDER_MIME_TYPE}' and 'root' in parents and trashed = false`;
  const roots = await fetchDriveFiles(accessToken, rootQuery, 'id,name');
  const foundBackups = {};
  const seenFileIds = new Set();

  for (const driveRoot of GOOGLE_DRIVE_READ_ROOTS) {
    const matchingRoots = roots.filter((root) => root.name === driveRoot);

    for (const root of matchingRoots) {
      const rootChildren = await fetchDriveFiles(
        accessToken,
        folderChildrenQuery(root.id),
        'id,name',
      );
      const backupFolders = rootChildren.filter((folder) => folder.name === 'backups');

      for (const backupsFolder of backupFolders) {
        const localeFolders = await fetchDriveFiles(
          accessToken,
          folderChildrenQuery(backupsFolder.id),
          'id,name',
        );

        for (const localeFolder of localeFolders) {
          const filesQuery = `'${localeFolder.id}' in parents and trashed = false`;
          const files = await fetchDriveFiles(
            accessToken,
            filesQuery,
            'id,name,parents,modifiedTime,mimeType,appProperties',
          );

          for (const file of files) {
            if (!file.name?.endsWith('.json') || seenFileIds.has(file.id)) continue;
            seenFileIds.add(file.id);

            if (!foundBackups[localeFolder.name]) foundBackups[localeFolder.name] = [];
            foundBackups[localeFolder.name].push({
              id: file.id,
              name: file.name,
              modifiedTime: file.modifiedTime,
              driveRoot,
              ...(file.appProperties && { appProperties: file.appProperties }),
            });
          }
        }
      }
    }
  }

  for (const files of Object.values(foundBackups)) files.sort(compareBackups);

  return foundBackups;
}
