import {
  GITHUB_LAST_FULL_PUSH_HASH_KEY,
  GITHUB_LAST_HOSTING_HASH_KEY,
  GITHUB_LAST_SYNC_HASH_KEY,
} from '@/services/storage/githubStorage';
import {
  GOOGLE_LAST_FULL_PUSH_HASH_KEY,
  GOOGLE_LAST_SYNC_HASH_KEY,
} from '@/services/storage/googleStorage';
import { isResumeDigest, sha256Hex } from '@/utils/hash';

/** Every localStorage key holding a `getResumeHash` digest. */
export const ALL_SYNC_HASH_KEYS = [
  GITHUB_LAST_SYNC_HASH_KEY,
  GITHUB_LAST_FULL_PUSH_HASH_KEY,
  GITHUB_LAST_HOSTING_HASH_KEY,
  GOOGLE_LAST_SYNC_HASH_KEY,
  GOOGLE_LAST_FULL_PUSH_HASH_KEY,
] as const;

/**
 * What a full-push key stores: one digest over the resume digest, the backup
 * file name (company and position) and the posting link, so changing only the
 * link still pushes. Without a link the stamp is what earlier builds stored.
 */
export const fullPushStamp = (
  resumeHash: string,
  backupFileName: string,
  postingUrl?: string | null,
): Promise<string> =>
  sha256Hex(`${resumeHash}:${backupFileName}${postingUrl ? `:${postingUrl}` : ''}`);

/**
 * Removes any sync-hash value that is not a digest. Earlier builds stored
 * reversible base64 of the whole resume there; a removed value only costs one
 * re-push on the next sync.
 */
export const discardLegacySyncHashes = (storage: Pick<Storage, 'getItem' | 'removeItem'>) => {
  try {
    for (const key of ALL_SYNC_HASH_KEYS) {
      const value = storage.getItem(key);
      if (value !== null && !isResumeDigest(value)) storage.removeItem(key);
    }
  } catch {
    // Storage blocked: there is nothing readable to discard either.
  }
};
