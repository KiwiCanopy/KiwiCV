import type { CvVersion, LocaleFilter } from '@/features/cv-library/types';
import { type BackupDiscoveryMap, getBackupFileKey } from '@/store/library/useCvLibraryStore';

export interface FlattenedLibrary {
  /** Every discovered file, newest first. Undated files sort last. */
  versions: CvVersion[];
}

const MASTER_FILENAME = 'resume.json';

function timeOf(version: CvVersion): number | null {
  if (!version.file.updatedAt) return null;
  const parsed = new Date(version.file.updatedAt).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Newest first, with undated files last and their relative order preserved.
 * `Array.prototype.sort` is stable in every engine we target, so returning 0
 * for two undated files is enough to keep discovery order between them.
 */
export function compareByUpdatedAtDesc(a: CvVersion, b: CvVersion): number {
  const timeA = timeOf(a);
  const timeB = timeOf(b);
  if (timeA === null && timeB === null) return 0;
  if (timeA === null) return 1;
  if (timeB === null) return -1;
  return timeB - timeA;
}

/**
 * `locale -> source -> files` unwound into a flat, sorted list.
 *
 * Pure: the single place the discovery nesting comes apart, so the page, the
 * filters and the tests all agree about what a row is.
 */
export function flattenDiscovery(data: BackupDiscoveryMap | null): FlattenedLibrary {
  if (!data) return { versions: [] };

  const versions: CvVersion[] = [];

  for (const [locale, sourceMap] of Object.entries(data)) {
    for (const source of ['github', 'google_drive'] as const) {
      for (const file of sourceMap[source] ?? []) {
        versions.push({
          key: `${locale}:${source}:${getBackupFileKey(file)}`,
          file,
          source,
          locale,
          isMaster: file.name === MASTER_FILENAME,
        });
      }
    }
  }

  versions.sort(compareByUpdatedAtDesc);

  return { versions };
}

/**
 * The newest `resume.json` per language.
 *
 * A language can hold two masters — one on GitHub and one on Drive — and only
 * the newer of the two is the copy this device syncs to. Ties keep discovery
 * order, so the answer is stable across renders.
 */
function newestMasterPerLocale(versions: CvVersion[]): Map<string, CvVersion> {
  const byLocale = new Map<string, CvVersion>();

  for (const version of versions) {
    if (!version.isMaster) continue;
    const incumbent = byLocale.get(version.locale);
    if (!incumbent || compareByUpdatedAtDesc(version, incumbent) < 0) {
      byLocale.set(version.locale, version);
    }
  }

  return byLocale;
}

/**
 * The master for one language, or `null` when that language has never been
 * backed up. What "not backed up since" reads: the draft in the editor is in
 * one language, and another language's `resume.json` says nothing about it.
 */
export function selectMasterForLocale(versions: CvVersion[], locale: string): CvVersion | null {
  return newestMasterPerLocale(versions).get(locale) ?? null;
}

export interface PinnedMastersOptions {
  /** The language narrowing the toolbar is showing. */
  localeFilter: LocaleFilter;
  /** The language of the resume in the editor (`resume.meta.theme.locale`). */
  activeLocale: string;
}

export interface PartitionedLibrary {
  /**
   * The masters pinned above the table, the active language first and the rest
   * by recency.
   */
  pinned: CvVersion[];
  /** Every row the table lists. Disjoint from `pinned`, and together exhaustive. */
  listed: CvVersion[];
}

/**
 * Splits the library into the pinned masters and the rows.
 *
 * **The pinned area follows the language filter.** Pick a language and you pin
 * that language's master; pick "All languages" and you pin one per language.
 * An earlier version pinned the single newest master across every language and
 * both providers, which meant a German backup could push the English one — the
 * copy the user's own editor syncs to — into the middle of the table.
 *
 * Only a `resume.json` is ever pinned. A tailored version can easily be newer
 * than the master, and the pinned row means "the copy every device syncs to",
 * not "the newest file".
 *
 * Pure, and the complement is exact: any master that is not pinned stays a row,
 * so nothing the discovery found becomes unreachable.
 */
export function selectPinnedMasters(
  versions: CvVersion[],
  { localeFilter, activeLocale }: PinnedMastersOptions,
): PartitionedLibrary {
  const byLocale = newestMasterPerLocale(versions);

  const candidates =
    localeFilter === 'all'
      ? [...byLocale.values()]
      : [byLocale.get(localeFilter)].filter((version) => version !== undefined);

  candidates.sort(compareByUpdatedAtDesc);

  const pinned = [
    ...candidates.filter((version) => version.locale === activeLocale),
    ...candidates.filter((version) => version.locale !== activeLocale),
  ];

  const pinnedKeys = new Set(pinned.map((version) => version.key));

  return { pinned, listed: versions.filter((version) => !pinnedKeys.has(version.key)) };
}
