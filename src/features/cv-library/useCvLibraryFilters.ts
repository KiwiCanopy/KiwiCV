import { useCallback, useMemo, useState } from 'react';

import { selectPinnedMasters } from '@/features/cv-library/flattenDiscovery';
import type {
  ActiveFilter,
  CvVersion,
  DateRange,
  LibraryScope,
  LocaleFilter,
  ScopeCounts,
  SortBy,
  SortOrder,
} from '@/features/cv-library/types';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';

const EMPTY_RANGE: DateRange = { start: '', end: '' };

function matchesSearch(version: CvVersion, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  const { label, name, company, position, theme } = version.file;
  return [label, name, company, position, theme].some((field) =>
    field?.toLowerCase().includes(query),
  );
}

function matchesDateRange(version: CvVersion, range: DateRange): boolean {
  if (!range.start && !range.end) return true;
  if (!version.file.updatedAt) return false;

  const fileDate = new Date(version.file.updatedAt);
  fileDate.setHours(0, 0, 0, 0);

  if (range.start) {
    const start = new Date(range.start);
    start.setHours(0, 0, 0, 0);
    if (fileDate < start) return false;
  }
  if (range.end) {
    const end = new Date(range.end);
    end.setHours(23, 59, 59, 999);
    if (fileDate > end) return false;
  }
  return true;
}

/**
 * The library's search, narrowing and sort.
 *
 * Successor to the modal's `useBackupFilters`, with three differences:
 *
 * 1. It works on `CvVersion`, so provider and language are filterable at all —
 *    the modal made you pick both from dropdowns before you could see a list.
 * 2. **`activeFilters` starts empty.** The modal defaulted to a three-month
 *    calendar window, which in a 45vh popup is defensible and on a full page
 *    silently hides every backup older than a quarter on first paint.
 * 3. Scope counts are computed from the *unscoped* result, so switching to
 *    GitHub never shows a chip reading `GitHub 0` next to the rows it matches.
 *
 * It also owns the pinned/listed split, because which masters are pinned is a
 * function of `localeFilter` — state that lives here. Splitting first and
 * narrowing second is what keeps the chip counts honest: a pinned row is not in
 * the table, so it must not be in the number that describes the table.
 *
 * `activeLocale` is the language of the resume in the editor, and only orders
 * the pinned masters; it never hides a row.
 */
export function useCvLibraryFilters(versions: CvVersion[], activeLocale: string) {
  const [search, setSearch] = useState('');
  const [scope, setScopeState] = useState<LibraryScope>('all');
  const [localeFilter, setLocaleFilter] = useState<LocaleFilter>('all');

  const setScope = useCallback((next: LibraryScope) => {
    analytics.track(ANALYTICS_EVENTS.CV_LIBRARY_SCOPE_CHANGED, { scope: next });
    setScopeState(next);
  }, []);

  const [showFilterBar, setShowFilterBar] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<ActiveFilter>>(() => new Set());

  const [dateRange, setDateRange] = useState<DateRange>(EMPTY_RANGE);
  const [positionQuery, setPositionQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const availableThemes = useMemo(() => {
    const themes = new Set<string>();
    versions.forEach((version) => {
      if (version.file.theme) themes.add(version.file.theme);
    });
    return Array.from(themes).sort();
  }, [versions]);

  // Read off every discovered file rather than off the listed rows: a language
  // whose only backup is its master would otherwise drop out of the dropdown
  // the moment that master got pinned.
  const availableLocales = useMemo(() => {
    const found = new Set<string>();
    versions.forEach((version) => found.add(version.locale));
    return Array.from(found).sort();
  }, [versions]);

  const toggleFilter = useCallback((filter: ActiveFilter) => {
    analytics.track(ANALYTICS_EVENTS.CV_LIBRARY_FILTER_CHANGED, { filter });
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(filter)) {
        next.delete(filter);
        if (filter === 'theme') setSelectedThemes([]);
        if (filter === 'company') setCompanyQuery('');
        if (filter === 'position') setPositionQuery('');
        if (filter === 'calendar') setDateRange(EMPTY_RANGE);
      } else {
        next.add(filter);
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSearch('');
    setScopeState('all');
    setLocaleFilter('all');
    setDateRange(EMPTY_RANGE);
    setPositionQuery('');
    setCompanyQuery('');
    setSelectedThemes([]);
    setActiveFilters(new Set());
    setShowFilterBar(false);
  }, []);

  const { pinned, listed } = useMemo(
    () => selectPinnedMasters(versions, { localeFilter, activeLocale }),
    [versions, localeFilter, activeLocale],
  );

  /** Everything except the scope narrowing — the set the chip counts describe. */
  const unscoped = useMemo(() => {
    return listed.filter((version) => {
      if (!matchesSearch(version, search)) return false;
      if (localeFilter !== 'all' && version.locale !== localeFilter) return false;
      if (activeFilters.has('calendar') && !matchesDateRange(version, dateRange)) return false;
      if (activeFilters.has('position') && positionQuery.trim()) {
        if (!version.file.position?.toLowerCase().includes(positionQuery.toLowerCase()))
          return false;
      }
      if (activeFilters.has('company') && companyQuery.trim()) {
        if (!version.file.company?.toLowerCase().includes(companyQuery.toLowerCase())) return false;
      }
      if (activeFilters.has('theme') && selectedThemes.length > 0) {
        if (!version.file.theme || !selectedThemes.includes(version.file.theme)) return false;
      }
      return true;
    });
  }, [
    listed,
    search,
    localeFilter,
    activeFilters,
    dateRange,
    positionQuery,
    companyQuery,
    selectedThemes,
  ]);

  const scopeCounts = useMemo<ScopeCounts>(
    () => ({
      all: unscoped.length,
      github: unscoped.filter((version) => version.source === 'github').length,
      google_drive: unscoped.filter((version) => version.source === 'google_drive').length,
    }),
    [unscoped],
  );

  const filtered = useMemo(() => {
    const scoped = scope === 'all' ? unscoped : unscoped.filter((v) => v.source === scope);

    return [...scoped].sort((a, b) => {
      let comparison: number;
      if (sortBy === 'date') {
        const dateA = a.file.updatedAt ? new Date(a.file.updatedAt).getTime() : 0;
        const dateB = b.file.updatedAt ? new Date(b.file.updatedAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'position') {
        comparison = (a.file.position || '').localeCompare(b.file.position || '');
      } else if (sortBy === 'company') {
        comparison = (a.file.company || '').localeCompare(b.file.company || '');
      } else {
        comparison = (a.file.theme || '').localeCompare(b.file.theme || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [unscoped, scope, sortBy, sortOrder]);

  const hasActiveNarrowing =
    !!search.trim() || scope !== 'all' || localeFilter !== 'all' || activeFilters.size > 0;

  return {
    search,
    setSearch,
    scope,
    setScope,
    localeFilter,
    setLocaleFilter,
    showFilterBar,
    setShowFilterBar,
    activeFilters,
    toggleFilter,
    dateRange,
    setDateRange,
    positionQuery,
    setPositionQuery,
    companyQuery,
    setCompanyQuery,
    selectedThemes,
    setSelectedThemes,
    availableThemes,
    availableLocales,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetAll,
    scopeCounts,
    pinned,
    filtered,
    hasActiveNarrowing,
  };
}
