/**
 * Google Drive Sync Function for KiwiCV
 * Handles secure communication with Google Drive API v3.
 */
import { GOOGLE_DRIVE_READ_ROOTS, GOOGLE_DRIVE_ROOT } from './lib/brand-config.js';
import { discoverBackups } from './lib/google-drive-discovery.js';
import {
  driveError,
  ensureFolderPath,
  escapeDriveQueryValue,
  getAccessToken,
  isDriveFileId,
  isInsufficientScope,
  isUploadContentType,
  uploadFiles,
} from './lib/google-drive.js';

function isSupportedReadPath(folderPath) {
  return Array.isArray(folderPath) && GOOGLE_DRIVE_READ_ROOTS.includes(folderPath[0]);
}

function isCanonicalWritePath(folderPath) {
  return Array.isArray(folderPath) && folderPath[0] === GOOGLE_DRIVE_ROOT;
}

function invalidPathResponse(message) {
  return {
    statusCode: 400,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: message }),
  };
}

export const handler = async (event) => {
  // CORS & Methods
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, refreshToken, folderPath: customPath, lang } = body;

    if (!refreshToken) {
      console.warn('[GoogleDriveSync] Missing refresh token in request body.');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing refresh token' }) };
    }

    // --- ACTIONS ---

    // 1. Revoke. Handled before the access-token exchange on purpose:
    // an already-expired or already-revoked grant cannot mint an access token,
    // and that must not stop the user from disconnecting.
    //
    // Revoking a refresh token revokes the whole grant, so the next Drive
    // authorization shows a real consent screen instead of silently reusing an
    // authorization the user believes they removed. Without this, "Disconnect"
    // only forgets our copy of the credential.
    if (action === 'revoke') {
      const response = await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refreshToken }).toString(),
      });

      // Google answers 400 for a token that is already invalid. The user's
      // intent — this grant should not exist — is satisfied either way, so
      // reporting failure would only invite a pointless retry.
      if (!response.ok && response.status !== 400) {
        console.warn('[GoogleDriveSync] Revoke failed:', response.status);
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: false, error: 'REVOKE_FAILED' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true }),
      };
    }

    const accessToken = await getAccessToken(refreshToken);
    const folderPath = customPath || [GOOGLE_DRIVE_ROOT, 'backups', lang];

    // 2. Handshake / Auth Check (Optional Discovery)
    if (action === 'handshake' || action === 'check-auth') {
      // Just check if the token is valid by calling a minimal endpoint
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=kind', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn(
            '[GoogleDriveSync] Unauthorized/Forbidden from Google API:',
            response.status,
          );
          // Only a missing drive.file grant is reported as such; a quota or policy
          // 403 stays UNAUTHORIZED, which the client treats as possibly transient.
          const missingScope =
            response.status === 403 && isInsufficientScope(await response.json().catch(() => null));
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              success: false,
              error: missingScope ? 'INSUFFICIENT_SCOPE' : 'UNAUTHORIZED',
            }),
          };
        }
        throw driveError('HANDSHAKE_FAILED', 'Handshake failed', response.status);
      }

      let backups = null;

      if (body.discover) {
        backups = await discoverBackups(accessToken);
      }

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          backups,
        }),
      };
    }

    // 3. Discover Backups (Batch)
    if (action === 'discover-backups') {
      const locales = await discoverBackups(accessToken);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(locales),
      };
    }

    // 3. Upload / Sync
    if (action === 'upload') {
      if (!isCanonicalWritePath(folderPath)) {
        return invalidPathResponse('Uploads must use the KiwiCV Drive root');
      }
      if (body.parentId) {
        return invalidPathResponse('Direct parent folder uploads are not supported');
      }

      const files = body.files || [
        {
          fileName: body.fileName,
          content: body.content,
          contentType: body.contentType,
          isBase64: body.isBase64,
        },
      ];
      if (!files.every((file) => isUploadContentType(file.contentType))) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported contentType' }) };
      }

      const folderInfo = await ensureFolderPath(accessToken, folderPath, true, body.unique);

      const results = await uploadFiles(accessToken, folderInfo, files);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          success: true,
          folderId: folderInfo.id,
          folderName: folderInfo.name,
          results,
        }),
      };
    }

    // 4. Get File (Download)
    if (action === 'get-file') {
      let fileId = body.fileId;
      if (fileId && !isDriveFileId(fileId)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid fileId' }) };
      }

      if (!fileId) {
        if (!isSupportedReadPath(folderPath)) {
          return invalidPathResponse('Unsupported Google Drive read root');
        }

        const folderInfo = await ensureFolderPath(accessToken, folderPath, false);
        if (!folderInfo) {
          // Folder and file names are user-chosen; logs carry fixed labels only.
          console.warn('[GoogleDriveSync] get-file: folder not found.');
          return { statusCode: 404, body: JSON.stringify({ error: 'Folder not found' }) };
        }

        const query = `name = '${escapeDriveQueryValue(body.fileName)}' and '${folderInfo.id}' in parents and trashed = false`;
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        const searchData = await searchRes.json();
        fileId = searchData.files?.[0]?.id;
      }

      if (!fileId) {
        console.warn('[GoogleDriveSync] get-file: file not found.');
        return { statusCode: 404, body: JSON.stringify({ error: 'File not found' }) };
      }

      const downloadRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!downloadRes.ok)
        throw driveError('DOWNLOAD_FAILED', 'Download failed', downloadRes.status);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(await downloadRes.json()),
      };
    }

    // 5. List Files
    if (action === 'list-files') {
      if (!isSupportedReadPath(folderPath)) {
        return invalidPathResponse('Unsupported Google Drive read root');
      }

      const folderInfo = await ensureFolderPath(accessToken, folderPath, false);
      if (!folderInfo?.id) {
        return {
          statusCode: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify([]),
        };
      }

      const query = `'${folderInfo.id}' in parents and trashed = false`;
      const listRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, modifiedTime)`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const listData = await listRes.json();

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(listData.files || []),
      };
    }

    // 6. Resolve Folder
    if (action === 'resolve-folder') {
      if (!isCanonicalWritePath(folderPath)) {
        return invalidPathResponse('Folders may only be created below the KiwiCV Drive root');
      }

      const { id, name } = await ensureFolderPath(accessToken, folderPath, true, body.unique);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ folderId: id, folderName: name }),
      };
    }

    // 7. Delete File
    if (action === 'delete-file') {
      const { fileId } = body;
      if (!fileId) {
        console.warn('[GoogleDriveSync] Missing fileId for delete-file action.');
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing fileId' }) };
      }
      if (!isDriveFileId(fileId)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid fileId' }) };
      }

      const deleteRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!deleteRes.ok && deleteRes.status !== 404) {
        const errorData = await deleteRes.json().catch(() => ({}));
        throw driveError(
          'DELETE_FAILED',
          errorData.error?.message || 'Delete failed',
          deleteRes.status,
        );
      }

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true }),
      };
    }

    console.warn('[GoogleDriveSync] Invalid action requested.');
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
  } catch (error) {
    // Error messages can carry file names and provider bodies; log the code only.
    console.error(
      '[GoogleDriveSync] Request failed:',
      error?.code ?? error?.name ?? 'UNKNOWN',
      error?.status ?? '',
    );
    // Not 401/403: the client maps those to UNAUTHORIZED before it reads a code.
    if (error?.code === 'INVALID_GRANT') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: 'INVALID_GRANT' }),
      };
    }
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
