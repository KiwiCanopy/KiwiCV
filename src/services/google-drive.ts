/**
 * Google Drive API Client for KiwiCV
 * Communicates with the Netlify function to handle Drive operations.
 */
import { type GoogleDriveRoot, UNUSABLE_DRIVE_CREDENTIAL_ERRORS } from '@/constants/cloud';
import type { ResumeData } from '@/types/resume';

const FUNCTION_URL = '/.netlify/functions/google-drive-sync';
export const REVOKE_TIMEOUT_MS = 10_000;

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  driveRoot: GoogleDriveRoot;
  /** Read by `fromDriveAppProperties`; absent on a file that never had any. */
  appProperties?: Record<string, string>;
}

export interface DriveUploadFile {
  name: string;
  content: string | Blob;
  contentType: string;
  /** Written in the same request; a `null` value deletes that property. */
  appProperties?: Record<string, string | null>;
}

export const googleDriveService = {
  /**
   * Verifies the refresh token and returns user information.
   * Optionally performs backup discovery in the same request.
   */
  async handshake(
    refreshToken: string,
    discover: boolean = false,
  ): Promise<{ backups: Record<string, DriveFile[]> | null }> {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'handshake',
        refreshToken,
        discover,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'HANDSHAKE_ERROR');
    }

    const data = await response.json();
    if (UNUSABLE_DRIVE_CREDENTIAL_ERRORS.has(data?.error)) {
      throw new Error(data.error);
    }
    if (data && (data.error === 'UNAUTHORIZED' || data.success === false)) {
      throw new Error('UNAUTHORIZED');
    }

    return data;
  },

  /**
   * @deprecated Use handshake instead for better performance
   */
  async checkAuth(refreshToken: string) {
    return this.handshake(refreshToken, false);
  },

  /**
   * Revokes the Google grant this refresh token belongs to.
   *
   * Clearing the token locally only makes KiwiCV forget it; the authorization
   * keeps existing in the user's Google account, which is why reconnecting
   * used to skip the consent screen. Disconnecting should mean disconnected.
   *
   * Never throws. Revocation is best-effort by design: the local credential is
   * cleared either way, and a failure here must not leave the user stuck
   * connected to something they asked to leave.
   */
  async revoke(refreshToken: string): Promise<boolean> {
    // The disconnect dialog cannot be cancelled while this runs, so a stall ends
    // as a failure. A timer, not `AbortSignal.timeout`, which fake timers cannot drive.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REVOKE_TIMEOUT_MS);
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'revoke', refreshToken }),
        signal: controller.signal,
      });
      if (!response.ok) return false;
      const data = await response.json().catch(() => ({}));
      return data?.success === true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  },

  /**
   * Syncs a file or set of files to Google Drive.
   */
  async sync(
    refreshToken: string,
    folderPath: string[],
    files: DriveUploadFile[],
    unique: boolean = false,
  ): Promise<{ folderId: string; folderName?: string }> {
    const preparedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.content instanceof Blob) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.readAsDataURL(file.content as Blob);
          });
          const contentBase64 = await base64Promise;
          return {
            fileName: file.name,
            content: contentBase64,
            contentType: file.contentType,
            isBase64: true,
            appProperties: file.appProperties,
          };
        }
        return {
          fileName: file.name,
          content: file.content as string,
          contentType: file.contentType,
          isBase64: false,
          appProperties: file.appProperties,
        };
      }),
    );

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'upload',
        refreshToken,
        folderPath,
        files: preparedFiles,
        unique,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Drive sync failed: ${error.error}`);
    }

    const data = await response.json();
    return { folderId: data.folderId, folderName: data.folderName };
  },

  /**
   * Checks if files exist for a given folder path.
   */
  async listFiles(refreshToken: string, folderPath: string[]): Promise<DriveFile[]> {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'list-files',
        refreshToken,
        folderPath,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'FETCH_ERROR');
    }

    try {
      const data = await response.json();
      if (data.error) {
        if (
          data.error.includes('permission') ||
          data.error.includes('scope') ||
          data.error.includes('consent')
        ) {
          throw new Error('UNAUTHORIZED');
        }
        throw new Error(data.error);
      }
      return data;
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') throw e;
      return [];
    }
  },

  /**
   * Downloads the resume JSON from Drive.
   */
  async downloadJsonById(refreshToken: string, fileId: string): Promise<ResumeData> {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'get-file',
        refreshToken,
        fileId,
      }),
    });

    if (!response.ok) {
      throw new Error('Could not download resume from Google Drive');
    }

    return response.json();
  },

  async downloadJsonByName(
    refreshToken: string,
    folderPath: string[],
    fileName: string = 'resume.json',
  ): Promise<ResumeData> {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'get-file',
        refreshToken,
        folderPath,
        fileName,
      }),
    });

    if (!response.ok) {
      throw new Error('Could not download resume from Google Drive');
    }

    return response.json();
  },

  /**
   * Discovers all locales and their backup files.
   * Returns Record<locale, DriveFile[]>
   */
  async discoverBackups(refreshToken: string): Promise<Record<string, DriveFile[]>> {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'discover-backups',
        refreshToken,
        t: Date.now(), // Cache-buster
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'DISCOVERY_ERROR');
    }

    return response.json();
  },

  /**
   * Deletes a file from Google Drive.
   */
  async deleteFile(refreshToken: string, fileId: string): Promise<void> {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete-file',
        refreshToken,
        fileId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'DELETE_ERROR');
    }
  },
};
