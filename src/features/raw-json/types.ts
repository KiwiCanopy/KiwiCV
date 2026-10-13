import type { ResumeData } from '@/types/resume';

export type RawJsonTabId = 'reduced' | 'standard' | 'full';

export interface RawJsonTab {
  id: RawJsonTabId;
  label: string;
  title: string;
  desc: string;
  data: ResumeData | Partial<ResumeData> | Record<string, unknown>;
  descColor: string;
  filename: string;
}

/** One kept top-level block of an imported file (`ResumeData.passthrough`). */
export interface PassthroughBlock {
  key: string;
  value: unknown;
  /** Serialized size in UTF-8 bytes, as the 256 KB cap counts it. */
  bytes: number;
}
