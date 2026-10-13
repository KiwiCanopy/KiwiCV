import { type ResumeData } from '@/types/resume';

/**
 * Which deliverables a run produces.
 *
 * The project snapshot (`.json`) is deliberately absent: it is what makes an
 * export restorable, it costs nothing to produce, and every destination writes
 * it. It is locked on rather than representable as off.
 */
export interface ExportFormatSelection {
  pdf: boolean;
  html: boolean;
}

/**
 * Everything a destination needs to write, built once per run.
 *
 * The PDF compile, the HTML render and the JSON serialization used to be
 * written out three times — in the download workflow, in the GitHub push and in
 * the Drive push — and all three go through the same single Typst worker, which
 * handles one request at a time. That was invisible while only one of them ever
 * ran; a single trigger targeting ZIP + GitHub + Drive would have paid the slow
 * compile three times, serially.
 */
export interface ExportArtifacts {
  /** Folder and file base name: the ZIP name, the Drive folder, the repo folder. */
  folderName: string;
  /** The metadata-carrying backup filename, without extension. */
  backupFileName: string;
  /** The project snapshot. Always present. */
  json: string;
  /** `null` when the HTML format is switched off for this run. */
  html: string | null;
  /** `null` when the PDF format is switched off for this run. */
  pdf: Blob | null;
}

export interface BuildExportArtifactsParams {
  resume: ResumeData;
  /**
   * The metadata-carrying base name (`constructBackupFilename` output). Falls
   * back to the Settings filename pattern when absent.
   */
  projectName?: string;
  /** Omitted formats default to on. */
  formats?: Partial<ExportFormatSelection>;
}
