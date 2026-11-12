import { GOOGLE_DRIVE_ROOT } from '@/constants/cloud';
import { GitHubService } from '@/services/github';
import { isPrivateBackupRepo } from '@/services/githubRepoAccess';
import { googleDriveService } from '@/services/google-drive';
import { loadGitHubCreds } from '@/services/storage/githubStorage';
import { loadGoogleDriveCreds } from '@/services/storage/googleStorage';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type StoredSignature, parseStoredSignature } from '@/store/signature/useSignatureStore';

/**
 * The opt-in signature backup (#106): one file of its own on each connected
 * destination, never inside `resume.json`, the JSON export or an AI payload.
 *
 * Drive keeps it below the canonical root, outside `backups/`, so discovery
 * never lists it as a CV. The hidden app-data folder would need the
 * `drive.appdata` scope, which every user would have to grant again.
 */
const DRIVE_FOLDER = [GOOGLE_DRIVE_ROOT, 'signature'];
const FILE_NAME = 'signature.json';
const GITHUB_PATH = `signature/${FILE_NAME}`;
const FILE_VERSION = 1;

export interface SignatureBackupTargets {
  drive: string | null;
  github: { pat: string; owner: string; repo: string } | null;
}

export const NO_BACKUP_TARGETS: SignatureBackupTargets = { drive: null, github: null };

export const hasBackupTarget = (targets: SignatureBackupTargets) =>
  Boolean(targets.drive || targets.github);

/**
 * The destinations connected on this device. GitHub counts only for a repo
 * that may hold the full backup (`isPrivateBackupRepo`): any other repo never
 * receives the signature file.
 */
export async function resolveBackupTargets(): Promise<SignatureBackupTargets> {
  const drive = loadGoogleDriveCreds() || null;
  const { pat } = loadGitHubCreds();
  const repoName = useResumeStore.getState().sync.github?.repo ?? '';
  const [owner, repo] = repoName.split('/');
  let github: SignatureBackupTargets['github'] = null;
  if (pat && owner && repo) {
    const info = await new GitHubService(pat).getRepo(owner, repo).catch(() => null);
    if (isPrivateBackupRepo(info)) github = { pat, owner, repo };
  }
  return { drive, github };
}

const fileContent = (signature: StoredSignature) =>
  JSON.stringify({ v: FILE_VERSION, signature }, null, 2);

const readFile = (raw: unknown): StoredSignature | null =>
  typeof raw === 'object' && raw !== null && (raw as { v?: unknown }).v === FILE_VERSION
    ? parseStoredSignature((raw as { signature?: unknown }).signature)
    : null;

export interface CommitMessages {
  saved: string;
  removed: string;
}

/** Writes the signature to every target. Resolves to whether all writes landed. */
export async function pushSignatureBackup(
  signature: StoredSignature,
  targets: SignatureBackupTargets,
  messages: CommitMessages,
): Promise<boolean> {
  const tasks: Promise<unknown>[] = [];
  if (targets.drive) {
    tasks.push(
      googleDriveService.sync(targets.drive, DRIVE_FOLDER, [
        { name: FILE_NAME, content: fileContent(signature), contentType: 'application/json' },
      ]),
    );
  }
  if (targets.github) {
    const { pat, owner, repo } = targets.github;
    tasks.push(
      new GitHubService(pat).pushFile(
        owner,
        repo,
        GITHUB_PATH,
        fileContent(signature),
        messages.saved,
      ),
    );
  }
  const results = await Promise.allSettled(tasks);
  return results.every((result) => result.status === 'fulfilled');
}

/**
 * Deletes the signature file from every target. On GitHub, earlier commits
 * keep it; the dialog says so. Resolves to whether every delete landed.
 */
export async function deleteSignatureBackup(
  targets: SignatureBackupTargets,
  messages: CommitMessages,
): Promise<boolean> {
  const tasks: Promise<unknown>[] = [];
  if (targets.drive) {
    const token = targets.drive;
    tasks.push(
      googleDriveService.listFiles(token, DRIVE_FOLDER).then((files) =>
        // Identity is the Drive file id (`rules/cloud-sync.md`): every file of
        // this name in KiwiCV's own signature folder is a copy of this one.
        Promise.all(
          files
            .filter((file) => file.name === FILE_NAME)
            .map((file) => googleDriveService.deleteFile(token, file.id)),
        ),
      ),
    );
  }
  if (targets.github) {
    const { pat, owner, repo } = targets.github;
    const gh = new GitHubService(pat);
    tasks.push(
      gh
        .getSha(owner, repo, GITHUB_PATH)
        .then((sha) =>
          sha ? gh.deleteFile(owner, repo, GITHUB_PATH, messages.removed) : undefined,
        ),
    );
  }
  const results = await Promise.allSettled(tasks);
  return results.every((result) => result.status === 'fulfilled');
}

/** The backed-up signature, from Drive first, then GitHub; `null` when there is none. */
export async function fetchSignatureBackup(
  targets: SignatureBackupTargets,
): Promise<StoredSignature | null> {
  if (targets.drive) {
    const found = await googleDriveService
      .downloadJsonByName(targets.drive, DRIVE_FOLDER, FILE_NAME)
      .then((raw: unknown) => readFile(raw))
      .catch(() => null);
    if (found) return found;
  }
  if (targets.github) {
    const { pat, owner, repo } = targets.github;
    const text = await new GitHubService(pat)
      .getFileContent(owner, repo, GITHUB_PATH)
      .catch(() => null);
    if (text) {
      try {
        return readFile(JSON.parse(text));
      } catch {
        return null;
      }
    }
  }
  return null;
}
