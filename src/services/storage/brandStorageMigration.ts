import { BRAND_STORAGE_MIGRATIONS } from '@/config/brand';

interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

interface StorageMigration {
  readonly target: string;
  readonly legacy: readonly string[];
}

export interface StorageMigrationResult {
  copied: string[];
  preserved: string[];
}

export const migrateStorageKeys = (
  storage: StorageLike,
  migrations: readonly StorageMigration[],
): StorageMigrationResult => {
  const result: StorageMigrationResult = { copied: [], preserved: [] };

  migrations.forEach(({ target, legacy }) => {
    if (storage.getItem(target) !== null) {
      result.preserved.push(target);
      return;
    }

    const source = legacy.find((key) => storage.getItem(key) !== null);
    if (!source) return;

    const value = storage.getItem(source);
    if (value === null) return;

    storage.setItem(target, value);
    result.copied.push(target);
  });

  return result;
};

export const migrateBrandStorage = (
  local: StorageLike,
  session: StorageLike,
): { local: StorageMigrationResult; session: StorageMigrationResult } => ({
  local: migrateStorageKeys(local, BRAND_STORAGE_MIGRATIONS.local),
  session: migrateStorageKeys(session, BRAND_STORAGE_MIGRATIONS.session),
});
