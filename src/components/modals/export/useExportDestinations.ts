import { useMemo } from 'react';

import {
  DESTINATION_IDS,
  type DestinationId,
  type ExportDestination,
  type ExportFormatId,
} from '@/components/modals/export/types';
import { useExportPreferences } from '@/components/modals/export/useExportPreferences';
import { type ProviderState } from '@/hooks/sync/providerState';
import { useProviderStates } from '@/hooks/sync/useProviderStates';

/** Credentials exist, whether or not background sync is switched on. */
const isConnected = (state: ProviderState): boolean =>
  state === 'active' || state === 'connected_disabled';

export interface UseExportDestinationsResult {
  /** The rows to render, in `DESTINATION_IDS` order. */
  destinations: ExportDestination[];
  /** The ids a run would actually target. */
  selected: DestinationId[];
  /** True when no cloud provider is connected: the dialog offers the setup row. */
  showCloudSetup: boolean;
  formats: Record<ExportFormatId, boolean>;
  toggleDestination: (id: DestinationId, enabled: boolean) => void;
  toggleFormat: (id: ExportFormatId, enabled: boolean) => void;
}

/**
 * Turns connection state plus stored toggles into the rows the dialog renders.
 *
 * Availability comes from `useProviderStates`, the documented single
 * acquisition point — deliberately not from a second `localStorage` read of
 * `github_pat`, which is how two surfaces end up telling different stories
 * about the same credential.
 *
 * A `connected_disabled` provider gets a row, defaulted off. The store's
 * `sync.*.enabled` flag is the *background backup* preference; this toggle is a
 * per-run choice, and running it once must not switch the Backup button's
 * behaviour back on.
 */
export function useExportDestinations(): UseExportDestinationsResult {
  const { github, googleDrive } = useProviderStates();
  const { preferences, setDestinationEnabled, setFormatEnabled } = useExportPreferences();

  const githubConnected = isConnected(github);
  const driveConnected = isConnected(googleDrive);
  // `deriveGoogleDriveState` reports `checking` while the Drive handshake is
  // unresolved. GitHub has no handshake and can never be in this state.
  const drivePending = googleDrive === 'checking';

  const destinations = useMemo(() => {
    const available: Record<DestinationId, boolean> = {
      zip: true,
      github_repo: githubConnected,
      google_drive: driveConnected || drivePending,
      // Pages is GitHub-specific: a Drive-only user never sees this row.
      github_pages: githubConnected,
    };

    return DESTINATION_IDS.filter((id) => available[id]).map<ExportDestination>((id) => ({
      id,
      enabled: preferences.destinations[id],
      pending: id === 'google_drive' && drivePending,
    }));
  }, [githubConnected, driveConnected, drivePending, preferences.destinations]);

  const selected = useMemo(
    () => destinations.filter((d) => d.enabled && !d.pending).map((d) => d.id),
    [destinations],
  );

  return {
    destinations,
    selected,
    showCloudSetup: !githubConnected && !driveConnected && !drivePending,
    formats: preferences.formats,
    toggleDestination: setDestinationEnabled,
    toggleFormat: setFormatEnabled,
  };
}
