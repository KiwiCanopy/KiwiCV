import { googleDriveService } from '@/services/google-drive';
import { clearGoogleDriveCreds, loadGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';

/**
 * Withdraws the Drive connection: sync goes off, the grant is revoked at Google
 * (best effort — a failed revoke still clears), and the refresh token, owner
 * stamp and sync hashes leave this device. The KiwiCV session is untouched.
 * Resolves `false` when Google did not confirm the revoke, so the grant may outlive the token.
 */
export async function disconnectGoogleDrive(): Promise<boolean> {
  const { updateSync } = useResumeStore.getState();
  updateSync({ googleDrive: { enabled: false } });

  // Revoke before clearing: the stored token is the only handle on the grant.
  const refreshToken = loadGoogleDriveCreds();
  const revoked = refreshToken ? await googleDriveService.revoke(refreshToken) : true;
  clearGoogleDriveCreds();
  // Stored credentials notify nobody; this write re-renders every provider-state reader.
  updateSync({ googleDrive: { enabled: false } });
  return revoked;
}
