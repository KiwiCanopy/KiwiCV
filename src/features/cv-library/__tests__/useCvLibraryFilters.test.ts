// @vitest-environment jsdom
import { flattenDiscovery } from '@/features/cv-library/flattenDiscovery';
import { useCvLibraryFilters } from '@/features/cv-library/useCvLibraryFilters';
import type { BackupDiscoveryMap } from '@/store/library/useCvLibraryStore';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/analytics', () => ({
  ANALYTICS_EVENTS: { CV_LIBRARY_SCOPE_CHANGED: 'x', CV_LIBRARY_FILTER_CHANGED: 'y' },
  analytics: { track: vi.fn() },
}));

const FOUR_MONTHS_AGO = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();

const DATA: BackupDiscoveryMap = {
  en: {
    github: [
      {
        name: 'Old_position_Designer_company_Northwind_theme_lunar.json',
        label: 'Old',
        position: 'Designer',
        company: 'Northwind',
        theme: 'lunar',
        updatedAt: FOUR_MONTHS_AGO,
      },
      {
        name: 'Fresh_position_Engineer_company_Contoso_theme_elegant.json',
        label: 'Fresh',
        position: 'Engineer',
        company: 'Contoso',
        theme: 'elegant',
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  de: {
    google_drive: [
      {
        id: 'drive-1',
        name: 'Bewerbung.json',
        label: 'Bewerbung',
        theme: 'elegant',
        updatedAt: new Date().toISOString(),
      },
    ],
  },
};

const versions = flattenDiscovery(DATA).versions;

describe('useCvLibraryFilters', () => {
  it('starts with no filter active, so a four-month-old backup is visible on first paint', () => {
    const { result } = renderHook(() => useCvLibraryFilters(versions, 'en'));

    expect(result.current.activeFilters.size).toBe(0);
    expect(result.current.filtered.map((v) => v.file.label)).toContain('Old');
  });

  it('computes the scope counts before the scope narrowing', () => {
    const { result } = renderHook(() => useCvLibraryFilters(versions, 'en'));

    act(() => result.current.setScope('github'));

    expect(result.current.filtered).toHaveLength(2);
    // The Drive chip still reports its match, so it never reads "Google Drive 0"
    // next to the row it would show.
    expect(result.current.scopeCounts).toEqual({ all: 3, github: 2, google_drive: 1 });
  });

  it('narrows by language', () => {
    const { result } = renderHook(() => useCvLibraryFilters(versions, 'en'));

    act(() => result.current.setLocaleFilter('de'));

    expect(result.current.filtered.map((v) => v.file.label)).toEqual(['Bewerbung']);
  });

  it('searches label, filename, company, role and design', () => {
    const { result } = renderHook(() => useCvLibraryFilters(versions, 'en'));

    for (const [query, expected] of [
      ['fresh', 'Fresh'],
      ['bewerbung.json', 'Bewerbung'],
      ['northwind', 'Old'],
      ['engineer', 'Fresh'],
      ['lunar', 'Old'],
    ] as const) {
      act(() => result.current.setSearch(query));
      expect(result.current.filtered.map((v) => v.file.label)).toEqual([expected]);
    }
  });

  it('keeps the pinned master out of the rows and out of the counts', () => {
    const withMasters = flattenDiscovery({
      ...DATA,
      en: {
        github: [
          ...(DATA.en?.github ?? []),
          { name: 'resume.json', label: 'Latest', updatedAt: new Date().toISOString() },
        ],
      },
    }).versions;

    const { result } = renderHook(() => useCvLibraryFilters(withMasters, 'en'));

    expect(result.current.pinned.map((v) => v.locale)).toEqual(['en']);
    expect(result.current.filtered.map((v) => v.file.name)).not.toContain('resume.json');
    // A row that is not in the table must not be in the number describing it.
    expect(result.current.scopeCounts).toEqual({ all: 3, github: 2, google_drive: 1 });
  });

  it('follows the language filter into the pinned area', () => {
    const withMasters = flattenDiscovery({
      en: { github: [{ name: 'resume.json', label: 'EN', updatedAt: '2026-01-01T00:00:00Z' }] },
      de: {
        google_drive: [
          { id: 'd', name: 'resume.json', label: 'DE', updatedAt: '2026-05-01T00:00:00Z' },
        ],
      },
    }).versions;

    const { result } = renderHook(() => useCvLibraryFilters(withMasters, 'en'));

    expect(result.current.pinned.map((v) => v.locale)).toEqual(['en', 'de']);

    act(() => result.current.setLocaleFilter('en'));

    // The German master is the newer of the two and used to take the pinned
    // slot in every view. An English view now pins English, full stop.
    expect(result.current.pinned.map((v) => v.locale)).toEqual(['en']);
    // ...and the language dropdown still lists both, so it stays reachable.
    expect(result.current.availableLocales).toEqual(['de', 'en']);
  });

  it('resetAll clears the scope and the language too, not only the search', () => {
    const { result } = renderHook(() => useCvLibraryFilters(versions, 'en'));

    act(() => {
      result.current.setScope('github');
      result.current.setLocaleFilter('en');
      result.current.setSearch('fresh');
    });
    act(() => result.current.resetAll());

    expect(result.current.scope).toBe('all');
    expect(result.current.localeFilter).toBe('all');
    expect(result.current.search).toBe('');
    expect(result.current.filtered).toHaveLength(3);
  });
});
