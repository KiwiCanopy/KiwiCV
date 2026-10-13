import {
  ALL_SYNC_HASH_KEYS,
  discardLegacySyncHashes,
  fullPushStamp,
} from '@/services/storage/syncHashes';
import { isResumeDigest } from '@/utils/hash';
import { describe, expect, it } from 'vitest';

const DIGEST = 'a'.repeat(64);
const LEGACY = btoa(JSON.stringify({ basics: { name: 'Ada' } }));

const memoryStorage = (entries: Record<string, string>) => {
  const map = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    removeItem: (key: string) => void map.delete(key),
    entries: () => Object.fromEntries(map),
  };
};

describe('discardLegacySyncHashes', () => {
  it('removes a base64 copy of the resume from every sync-hash key', () => {
    const storage = memoryStorage(Object.fromEntries(ALL_SYNC_HASH_KEYS.map((k) => [k, LEGACY])));

    discardLegacySyncHashes(storage);

    expect(storage.entries()).toEqual({});
  });

  it('removes a value that only starts like a digest', () => {
    const storage = memoryStorage({ [ALL_SYNC_HASH_KEYS[0]]: `${DIGEST}0` });

    discardLegacySyncHashes(storage);

    expect(storage.entries()).toEqual({});
  });

  it('removes a full-push value that still names its backup file', () => {
    const storage = memoryStorage({ [ALL_SYNC_HASH_KEYS[1]]: `${DIGEST}:Ada_Acme_Engineer` });

    discardLegacySyncHashes(storage);

    expect(storage.entries()).toEqual({});
  });

  it('keeps digests under every key, and every other key', () => {
    const kept = {
      ...Object.fromEntries(ALL_SYNC_HASH_KEYS.map((k) => [k, DIGEST])),
      unrelated: LEGACY,
    };
    const storage = memoryStorage(kept);

    discardLegacySyncHashes(storage);

    expect(storage.entries()).toEqual(kept);
  });

  it('does not throw when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      removeItem: () => {},
    };
    expect(() => discardLegacySyncHashes(blocked)).not.toThrow();
  });
});

describe('fullPushStamp', () => {
  it('is a digest that names neither the file nor the resume digest', async () => {
    const stamp = await fullPushStamp(DIGEST, 'Ada_Acme_Engineer');

    expect(isResumeDigest(stamp)).toBe(true);
    expect(stamp).not.toContain(DIGEST);
    expect(stamp).not.toBe(await fullPushStamp(DIGEST, 'Ada_Other_Engineer'));
  });
});
