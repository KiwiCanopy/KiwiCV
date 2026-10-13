import { type SectionGroupId } from '@/data/sections';
import { type CustomSectionToken, type SectionMetadataKey } from '@/utils/layoutMetadata';

/**
 * Every row the editor rail can show. `SectionMetadataKey` already carries the
 * twelve content sections plus `basics` and `profiles`; the cover letter is the
 * one editor surface with no entry in `ResumeData`'s section inventory, so it is
 * added here rather than smuggled into that union.
 */
export type RailSectionKey = SectionMetadataKey | 'coverLetter';

/**
 * What `?section=` can select: a built-in rail row, or a custom section by its
 * layout token. Kept apart from `RailSectionKey` so the closed
 * `Record<RailSectionKey, …>` inventories stay closed.
 */
export type EditorSectionKey = RailSectionKey | CustomSectionToken;

export interface RailGroup {
  id: SectionGroupId | 'coverLetter';
  /** `null` for the trailing standalone row, which needs no heading of its own. */
  labelKey: string | null;
  sections: RailSectionKey[];
}

export interface RailRowState {
  /** ⚠️ Not `key`: these rows get spread into components, and React eats `key`. */
  sectionKey: EditorSectionKey;
  /** A custom section's title; built-in rows resolve theirs from `RAIL_LABEL_KEYS`. */
  label?: string;
  /** `undefined` where the section has no countable entries (Basics, Cover Letter). */
  entryCount?: number;
  proposalCount: number;
}
