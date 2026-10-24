/**
 * Row order in the dialog, and the inventory every keyed structure below is
 * bound to. A new destination is added here and the compiler names every place
 * that has to answer for it.
 */
export const DESTINATION_IDS = ['zip', 'github_repo', 'google_drive', 'github_pages'] as const;

export type DestinationId = (typeof DESTINATION_IDS)[number];

/**
 * The optional deliverables. `json` is not a member: the project snapshot is
 * what makes an export restorable, so it is locked on and never persisted.
 */
export const EXPORT_FORMAT_IDS = ['pdf', 'html'] as const;

export type ExportFormatId = (typeof EXPORT_FORMAT_IDS)[number];

/** One row in the destination list, after availability and toggles are merged. */
export interface ExportDestination {
  id: DestinationId;
  /** The user's per-run choice. Never the store's `sync.*.enabled` flag. */
  enabled: boolean;
  /**
   * True while a provider handshake is unresolved. The row renders with its
   * switch disabled and the "checking connection" description rather than
   * disappearing — a row that is about to appear is better shown inert than
   * hidden.
   */
  pending: boolean;
}

export type DestinationStatus = 'idle' | 'running' | 'done' | 'failed';

export interface DestinationRunState {
  status: DestinationStatus;
  error?: string;
}

export interface ExportRunState {
  isRunning: boolean;
  /** Only destinations that took part in a run appear here. */
  rows: Partial<Record<DestinationId, DestinationRunState>>;
  /**
   * Set when the package itself could not be built, which fails every selected
   * destination for the same reason.
   */
  buildError: string | null;
  /** True once a run has finished, so the footer can report a result. */
  hasRun: boolean;
  /**
   * The finished run's result, decided once by the run itself: the toast and
   * the dialog's own close (#34) both read it. `null` until a run finishes.
   */
  outcome: 'all_ok' | 'partial' | 'failed' | null;
}

/** The device-local shape written to `BRAND_STORAGE_KEYS.exportPreferences`. */
export interface ExportPreferences {
  destinations: Record<DestinationId, boolean>;
  formats: Record<ExportFormatId, boolean>;
}
