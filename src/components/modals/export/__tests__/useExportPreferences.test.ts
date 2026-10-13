// @vitest-environment jsdom
import {
  DEFAULT_EXPORT_PREFERENCES,
  readExportPreferences,
  useExportPreferences,
} from '@/components/modals/export/useExportPreferences';
import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

const KEY = BRAND_STORAGE_KEYS.exportPreferences;

const stored = () => JSON.parse(localStorage.getItem(KEY) as string);

describe('useExportPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to the ZIP only, with every cloud destination off', () => {
    expect(readExportPreferences()).toEqual(DEFAULT_EXPORT_PREFERENCES);
    expect(DEFAULT_EXPORT_PREFERENCES.destinations).toEqual({
      zip: true,
      github_repo: false,
      google_drive: false,
      github_pages: false,
    });
  });

  it('round-trips a destination toggle through storage', () => {
    const { result } = renderHook(() => useExportPreferences());

    act(() => result.current.setDestinationEnabled('github_repo', true));

    expect(result.current.preferences.destinations.github_repo).toBe(true);
    expect(readExportPreferences().destinations.github_repo).toBe(true);
  });

  it('round-trips a format toggle, and never stores the snapshot as a format', () => {
    const { result } = renderHook(() => useExportPreferences());

    act(() => result.current.setFormatEnabled('pdf', false));

    expect(readExportPreferences().formats).toEqual({ pdf: false, html: true });
    expect(Object.keys(stored().formats)).not.toContain('json');
  });

  it('falls back to the defaults for unparseable JSON', () => {
    localStorage.setItem(KEY, '{not json');
    expect(readExportPreferences()).toEqual(DEFAULT_EXPORT_PREFERENCES);
  });

  it('falls back to the defaults for a stored version this build does not know', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: 99, destinations: { zip: false }, formats: { pdf: false } }),
    );
    expect(readExportPreferences()).toEqual(DEFAULT_EXPORT_PREFERENCES);
  });

  it('falls back to the defaults when the entry is not an object at all', () => {
    localStorage.setItem(KEY, JSON.stringify(['zip']));
    expect(readExportPreferences()).toEqual(DEFAULT_EXPORT_PREFERENCES);
  });

  it('ignores a non-boolean flag rather than storing it as one', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: 1, destinations: { zip: 'yes', github_repo: true } }),
    );

    const preferences = readExportPreferences();
    expect(preferences.destinations.zip).toBe(true);
    expect(preferences.destinations.github_repo).toBe(true);
  });

  /**
   * A disconnected provider keeps its flag. Reconnecting GitHub next week
   * restores the preference the user last expressed; deleting it on a token
   * expiry would quietly punish them for it. Excluding it from the *run* is
   * `useExportDestinations`' job, not storage's.
   */
  it('keeps a stored flag for a destination that is not currently connected', () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, destinations: { github_repo: true } }));

    const { result } = renderHook(() => useExportPreferences());
    act(() => result.current.setDestinationEnabled('zip', false));

    expect(stored().destinations.github_repo).toBe(true);
  });

  it('drops an unknown id on the next write instead of on read', () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, destinations: { zip: true, dropbox: true } }));

    expect(stored().destinations.dropbox).toBe(true);

    const { result } = renderHook(() => useExportPreferences());
    act(() => result.current.setDestinationEnabled('zip', false));

    expect(stored().destinations.dropbox).toBeUndefined();
  });
});
