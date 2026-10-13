/**
 * Google Drive API Library for KiwiCV
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    '[GoogleDriveLib] Configuration Error: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.',
  );
}

/**
 * Escapes a string for use inside a single-quoted Drive API query literal.
 */
export function escapeDriveQueryValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * A client-supplied Drive file id is interpolated into a URL path, so it must be a bare id.
 */
export function isDriveFileId(value) {
  return typeof value === 'string' && /^[\w-]+$/.test(value);
}

const UPLOAD_CONTENT_TYPES = new Set(['application/json', 'application/pdf', 'text/html']);

/**
 * The content types the client uploads; anything else would reach a hand-built multipart header.
 * An absent type falls back to JSON.
 */
export function isUploadContentType(value) {
  return value === undefined || value === null || UPLOAD_CONTENT_TYPES.has(value);
}

/**
 * An error that carries a fixed `code` (and HTTP `status`) safe to write to function logs.
 */
export function driveError(code, message, status) {
  return Object.assign(new Error(message), { code, status });
}

/**
 * Whether a Drive API error body says the access token lacks a required scope:
 * legacy `errors[].reason` or google.rpc.ErrorInfo `details[].reason`.
 */
export function isInsufficientScope(body) {
  const error = body?.error;
  if (!error || typeof error !== 'object') return false;
  const reasons = [
    ...(Array.isArray(error.errors) ? error.errors : []),
    ...(Array.isArray(error.details) ? error.details : []),
  ].map((entry) => entry?.reason);
  return (
    reasons.includes('insufficientPermissions') ||
    reasons.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')
  );
}

/**
 * Gets a fresh access token using the user's refresh token.
 */
export async function getAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Log the OAuth error code only; the response body is provider-controlled.
    const oauthCode = typeof error?.error === 'string' ? error.error.slice(0, 64) : 'unknown';
    console.error('[GoogleDriveLib] Failed to refresh token:', response.status, oauthCode);
    // Revoked, expired or otherwise dead: no retry can revive this refresh token.
    if (oauthCode === 'invalid_grant') {
      throw driveError('INVALID_GRANT', 'Refresh token is no longer valid', response.status);
    }
    throw driveError(
      'TOKEN_REFRESH_FAILED',
      `Failed to refresh token: ${JSON.stringify(error)}`,
      response.status,
    );
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Resolves or creates a folder path in Google Drive.
 */
export async function ensureFolderPath(accessToken, pathParts, create = true, unique = false) {
  let parentId = 'root';
  let lastPartName = pathParts[pathParts.length - 1];

  for (let i = 0; i < pathParts.length; i++) {
    let part = pathParts[i];
    const isLastPart = i === pathParts.length - 1;

    // Search for existing folder
    const query = `name = '${escapeDriveQueryValue(part)}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const searchData = await searchRes.json();
    let folderId = searchData.files?.[0]?.id;

    // For the last part of the path, if unique creation is requested, find a name suffix
    if (folderId && isLastPart && unique && create) {
      let counter = 2;
      let uniqueNameFound = false;
      while (!uniqueNameFound) {
        const uniquePart = `${part}_${counter}`;
        const uQuery = `name = '${escapeDriveQueryValue(uniquePart)}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
        const uSearchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(uQuery)}&fields=files(id)`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        const uSearchData = await uSearchRes.json();
        if (uSearchData.files && uSearchData.files.length === 0) {
          part = uniquePart;
          lastPartName = uniquePart;
          folderId = null;
          uniqueNameFound = true;
        } else {
          counter++;
        }
        if (counter > 20) break;
      }
    }

    if (folderId) {
      parentId = folderId;
    } else if (create) {
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: part,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        }),
      });
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !createData.id) {
        throw driveError('FOLDER_CREATE_FAILED', 'Folder creation failed', createRes.status);
      }
      parentId = createData.id;
    } else {
      return null;
    }
  }

  return { id: parentId, name: lastPartName };
}

/**
 * Uploads one or more files to a folder.
 */
export async function uploadFiles(accessToken, folderInfo, files) {
  const parentId = folderInfo.id;
  const results = [];

  for (const file of files) {
    const { fileName, content, contentType, isBase64 } = file;

    // Check if file exists to update it
    const query = `name = '${escapeDriveQueryValue(fileName)}' and '${parentId}' in parents and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const searchData = await searchRes.json();
    const existingFileId = searchData.files?.[0]?.id;

    if (existingFileId) {
      // Update Content
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': contentType || 'application/json',
          },
          body: isBase64 ? Buffer.from(content, 'base64') : content,
        },
      );
      if (!updateRes.ok)
        throw driveError(
          'UPDATE_FAILED',
          `Update failed for ${fileName}: ${await updateRes.text()}`,
          updateRes.status,
        );
    } else {
      // Create Multipart
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadata = JSON.stringify({
        name: fileName,
        parents: [parentId],
        mimeType: contentType || 'application/json',
      });

      const multipartBody = Buffer.concat([
        Buffer.from(delimiter),
        Buffer.from('Content-Type: application/json; charset=UTF-8\r\n\r\n'),
        Buffer.from(metadata),
        Buffer.from(delimiter),
        Buffer.from('Content-Type: ' + (contentType || 'application/json') + '\r\n\r\n'),
        isBase64 ? Buffer.from(content, 'base64') : Buffer.from(content),
        Buffer.from(closeDelimiter),
      ]);

      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': multipartBody.length.toString(),
          },
          body: multipartBody,
        },
      );

      if (!uploadRes.ok)
        throw driveError(
          'UPLOAD_FAILED',
          `Upload failed for ${fileName}: ${await uploadRes.text()}`,
          uploadRes.status,
        );
    }
    results.push({ fileName, success: true });
  }

  return results;
}
