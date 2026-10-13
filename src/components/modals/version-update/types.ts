/** A changelog highlight after its translated copy has been merged in. */
export interface Highlight {
  id: string;
  badge: string;
  title: string;
  content: string;
  desktopOnly?: boolean;
}

export interface TranslatedHighlight {
  badge?: string;
  title?: string;
  content?: string;
}

/**
 * One version's translation object: `_highlights` holds the per-highlight copy,
 * every other key is a single changelog line.
 */
export interface ChangelogData {
  _highlights?: Record<string, TranslatedHighlight>;
  [key: string]: string | Record<string, TranslatedHighlight> | undefined;
}
