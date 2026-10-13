export interface ExportDraft {
  base: string;
  company: string;
  position: string;
}

/**
 * The name fields, held across a setup detour.
 *
 * `useUIStore.activeSyncModal` is a single enum, so opening the cloud gateway
 * unmounts the export dialog and the round trip back loses whatever was typed.
 * Module scope rather than a store: the value is per-tab, short-lived, and
 * nothing outside this dialog has any business reading it. It also survives the
 * Google OAuth redirect within the same tab.
 *
 * Cleared on a fully successful run and on an explicit Cancel — never on a
 * failed run, which is exactly when the typed values still matter.
 */
let draft: ExportDraft | null = null;

export const readExportDraft = (): ExportDraft | null => draft;

export const writeExportDraft = (next: ExportDraft): void => {
  draft = next;
};

export const clearExportDraft = (): void => {
  draft = null;
};
