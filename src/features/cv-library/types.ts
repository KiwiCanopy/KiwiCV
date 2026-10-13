import type { BackupFile, BackupSource } from '@/store/library/useCvLibraryStore';

/**
 * One restorable backup, with the nesting of `BackupDiscoveryMap` unwound.
 *
 * The map is `locale -> source -> files`, so a file on its own cannot say which
 * language folder or which provider it came from — and `downloadBackup` needs
 * both. Every row in the library carries them.
 */
export interface CvVersion {
  /** Unique across the whole library: the file key namespaced by locale and source. */
  key: string;
  file: BackupFile;
  source: BackupSource;
  locale: string;
  /** `resume.json` — the rolling latest backup rather than a named version. */
  isMaster: boolean;
}

/** Which provider the list is narrowed to. */
export type LibraryScope = 'all' | BackupSource;

/** A language narrowing, or every language at once. */
export type LocaleFilter = 'all' | (string & {});

export type ActiveFilter = 'calendar' | 'theme' | 'company' | 'position';

export interface DateRange {
  start: string;
  end: string;
}

export type SortBy = 'date' | 'position' | 'company' | 'theme';
export type SortOrder = 'asc' | 'desc';

/** Counts per scope, computed before the scope narrowing is applied. */
export interface ScopeCounts {
  all: number;
  github: number;
  google_drive: number;
}
