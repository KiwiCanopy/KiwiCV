import { BRAND_STORAGE_KEYS, BRAND_STORAGE_MIGRATIONS } from '@/config/brand';
import { migrateBrandStorage, migrateStorageKeys } from '@/services/storage/brandStorageMigration';
import { describe, expect, it } from 'vitest';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  constructor(initial: Record<string, string> = {}) {
    Object.entries(initial).forEach(([key, value]) => this.values.set(key, value));
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('brand storage migration', () => {
  it('copies legacy values when the KiwiCV target is absent', () => {
    const storage = new MemoryStorage({ 'cvcanvas-ui-prefs': '{"theme":"dark"}' });

    const result = migrateStorageKeys(storage, BRAND_STORAGE_MIGRATIONS.local);

    expect(storage.getItem(BRAND_STORAGE_KEYS.uiPreferences)).toBe('{"theme":"dark"}');
    expect(storage.getItem('cvcanvas-ui-prefs')).toBe('{"theme":"dark"}');
    expect(result.copied).toContain(BRAND_STORAGE_KEYS.uiPreferences);
  });

  it('never overwrites an existing KiwiCV value', () => {
    const storage = new MemoryStorage({
      [BRAND_STORAGE_KEYS.uiPreferences]: 'kiwi-value',
      'cvcanvas-ui-prefs': 'legacy-value',
    });

    const result = migrateStorageKeys(storage, BRAND_STORAGE_MIGRATIONS.local);

    expect(storage.getItem(BRAND_STORAGE_KEYS.uiPreferences)).toBe('kiwi-value');
    expect(result.preserved).toContain(BRAND_STORAGE_KEYS.uiPreferences);
  });

  it('prefers the newest legacy key and falls back to the oldest spelling', () => {
    const newest = new MemoryStorage({
      'cvcanvas-ui-prefs': 'newest-legacy',
      'cv-canvas-ui-prefs': 'oldest-legacy',
    });
    const oldest = new MemoryStorage({ 'cv-canvas-ui-prefs': 'oldest-legacy' });

    migrateStorageKeys(newest, BRAND_STORAGE_MIGRATIONS.local);
    migrateStorageKeys(oldest, BRAND_STORAGE_MIGRATIONS.local);

    expect(newest.getItem(BRAND_STORAGE_KEYS.uiPreferences)).toBe('newest-legacy');
    expect(oldest.getItem(BRAND_STORAGE_KEYS.uiPreferences)).toBe('oldest-legacy');
  });

  it('is idempotent across repeated local and session migrations', () => {
    const local = new MemoryStorage({ cv_canvas_last_seen_version: '3.9.0' });
    const session = new MemoryStorage({
      'cvcanvas-flow-state': 'flow',
      'cvcanvas-import-modal': 'import',
    });

    const first = migrateBrandStorage(local, session);
    const second = migrateBrandStorage(local, session);

    expect(first.local.copied).toEqual([BRAND_STORAGE_KEYS.lastSeenVersion]);
    expect(first.session.copied).toEqual([
      BRAND_STORAGE_KEYS.flowState,
      BRAND_STORAGE_KEYS.importModal,
    ]);
    expect(second.local.copied).toEqual([]);
    expect(second.session.copied).toEqual([]);
    expect(local.getItem('cv_canvas_last_seen_version')).toBe('3.9.0');
  });
});
