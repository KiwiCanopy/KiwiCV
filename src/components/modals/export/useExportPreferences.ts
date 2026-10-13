import { useCallback, useState } from 'react';

import {
  DESTINATION_IDS,
  type DestinationId,
  EXPORT_FORMAT_IDS,
  type ExportFormatId,
  type ExportPreferences,
} from '@/components/modals/export/types';
import { BRAND_STORAGE_KEYS } from '@/config/brand';

const STORAGE_KEY = BRAND_STORAGE_KEYS.exportPreferences;

/** Bumped whenever the stored shape changes. A mismatch discards, never migrates. */
const PREFERENCES_VERSION = 1;

/**
 * ZIP on, every cloud destination off, deliberately on both counts.
 * `github_pages` stays off even once GitHub is connected: the repository push is
 * the backup, publishing is an opt-in.
 */
export const DEFAULT_EXPORT_PREFERENCES: ExportPreferences = {
  destinations: { zip: true, github_repo: false, google_drive: false, github_pages: false },
  formats: { pdf: true, html: true },
};

const clone = (preferences: ExportPreferences): ExportPreferences => ({
  destinations: { ...preferences.destinations },
  formats: { ...preferences.formats },
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Reads the stored preferences, falling back to the defaults for anything the
 * current shape does not recognise.
 *
 * Never throws: this runs during a render, and a corrupt storage entry must not
 * be able to take the dialog down. An unknown destination id is simply not read
 * — it disappears on the next write rather than being deleted here, so a key
 * this version does not understand survives a downgrade.
 */
export function readExportPreferences(): ExportPreferences {
  const defaults = clone(DEFAULT_EXPORT_PREFERENCES);

  let parsed: unknown;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    parsed = JSON.parse(raw);
  } catch {
    return defaults;
  }

  if (!isRecord(parsed) || parsed.v !== PREFERENCES_VERSION) return defaults;

  const destinations = parsed.destinations;
  if (isRecord(destinations)) {
    for (const id of DESTINATION_IDS) {
      if (typeof destinations[id] === 'boolean') defaults.destinations[id] = destinations[id];
    }
  }

  const formats = parsed.formats;
  if (isRecord(formats)) {
    for (const id of EXPORT_FORMAT_IDS) {
      if (typeof formats[id] === 'boolean') defaults.formats[id] = formats[id];
    }
  }

  return defaults;
}

function writeExportPreferences(preferences: ExportPreferences): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: PREFERENCES_VERSION, ...clone(preferences) }),
    );
  } catch {
    // A full or blocked storage is not worth failing an export over.
  }
}

/**
 * Device-local memory of what the last export targeted.
 *
 * Storage is written on the toggle event, not from an effect, so a render never
 * touches it. A stored destination whose provider is no longer connected keeps
 * its flag: reconnecting GitHub next week should restore the preference the
 * user last expressed, and deleting it on a token expiry would punish them for
 * it. `useExportDestinations` is what hides the row and excludes it from a run.
 */
export function useExportPreferences() {
  const [preferences, setPreferences] = useState<ExportPreferences>(readExportPreferences);

  const setDestinationEnabled = useCallback((id: DestinationId, enabled: boolean) => {
    setPreferences((current) => {
      const next: ExportPreferences = {
        destinations: { ...current.destinations, [id]: enabled },
        formats: { ...current.formats },
      };
      writeExportPreferences(next);
      return next;
    });
  }, []);

  const setFormatEnabled = useCallback((id: ExportFormatId, enabled: boolean) => {
    setPreferences((current) => {
      const next: ExportPreferences = {
        destinations: { ...current.destinations },
        formats: { ...current.formats, [id]: enabled },
      };
      writeExportPreferences(next);
      return next;
    });
  }, []);

  return { preferences, setDestinationEnabled, setFormatEnabled };
}
