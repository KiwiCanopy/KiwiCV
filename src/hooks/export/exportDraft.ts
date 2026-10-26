export interface ExportDraft {
  base?: string;
  company?: string;
  position?: string;
  /** As typed; `normalizePostingUrl` decides what is saved. */
  postingUrl?: string;
}

/**
 * The name fields, held across a setup detour.
 *
 * `useUIStore.activeSyncModal` is a single enum, so opening the cloud gateway
 * unmounts the export dialog and the round trip back loses whatever was typed.
 * Module scope rather than a store: the value is per-tab, short-lived, and
 * nothing outside this dialog has any business reading it. The Google OAuth
 * redirect reloads the page, so a sign-in detour loses it.
 *
 * Cleared on a fully successful run and on an explicit Cancel — never on a
 * failed run, which is exactly when the typed values still matter. A cloud
 * restore replaces it with the restored version's posting link (#54). A
 * sign-out or a different account signing in clears it too (#63).
 */
let draft: ExportDraft | null = null;

export const readExportDraft = (): ExportDraft | null => draft;

export const writeExportDraft = (next: ExportDraft): void => {
  draft = next;
};

export const clearExportDraft = (): void => {
  draft = null;
};
