import { type ExportArtifacts } from '@/hooks/export/types';
import { type ResumeData } from '@/types/resume';

export type SyncVariant = 'standard' | 'full' | 'hosting' | 'config';

export interface SyncResult {
  service: string;
  success: boolean;
  error?: string;
  folderName?: string;
  alreadySynced?: boolean;
}

export interface SyncParams {
  resume: ResumeData;
  variant: SyncVariant;
  mode: 'sync' | 'push';
  lang: string;
  t: (key: string, options?: Record<string, string | number>) => string;
  currentHash: string;
  includeBackup: boolean;
  projectName?: string;
  /**
   * The deliverables for a `full` export, built once by the caller.
   *
   * Provided by `useCloudSync` so GitHub and Drive share one PDF compile
   * instead of each driving the single Typst worker. Absent for the variants
   * that write no deliverables (`standard`, `config`, `hosting`); a `full` sync
   * builds its own as a fallback.
   */
  artifacts?: ExportArtifacts;
  /**
   * Normalized job posting link for a `full` export's snapshot (#54). Never
   * written to a repository anyone else can read.
   */
  postingUrl?: string | null;
}
