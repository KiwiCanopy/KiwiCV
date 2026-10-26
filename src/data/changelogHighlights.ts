import type { InfoCardColor } from '@/components/ui/InfoCard';
import {
  CalendarClock,
  Cloud,
  Code,
  Download,
  FolderOpen,
  Globe,
  GripVertical,
  Home,
  LayoutTemplate,
  Link,
  ListPlus,
  type LucideIcon,
  Newspaper,
  ScrollText,
  Sparkles,
} from 'lucide-react';

/**
 * Single source of truth for how a changelog highlight id is rendered.
 *
 * Two surfaces show highlights — the "What's New" modal
 * (`VersionUpdateHighlights`) and the Changelog tab (`ChangelogTab`) — and they
 * used to keep their own icon maps. The maps drifted: ids present in
 * `changelog.ts` were missing from one or both, and because each lookup fell
 * back silently, badges vanished with nothing failing (v3.2.0/v3.3.0 in the
 * tab, v4.0.0's `kiwicv-rebrand` in both).
 *
 * `token` is an `InfoCardColor`, not raw classes, so both surfaces resolve it
 * through their own styling. A release note is not a status, so every current
 * highlight is `brand`; reach for a status role only if a highlight ever
 * *means* success/caution/failure. Icons are lucide-only — the modal's two
 * `react-icons` glyphs were swapped for lucide equivalents here.
 */
export interface HighlightStyle {
  icon: LucideIcon;
  token: InfoCardColor;
}

/** Used when a highlight id has no entry below, so an unknown id degrades. */
export const HIGHLIGHT_FALLBACK: HighlightStyle = {
  icon: Sparkles,
  token: 'brand',
};

/**
 * Every highlight id used in `src/data/changelog.ts` must appear here — a test
 * asserts this so a missing id fails loudly instead of rendering `Sparkles`.
 */
export const HIGHLIGHT_STYLES: Record<string, HighlightStyle> = {
  // Sparkles because this highlight *means* AI, and `renderWithIcons` draws the
  // same glyph for `{wardsymbol}` in the release copy right beside it.
  'ai-import': { icon: Sparkles, token: 'brand' },
  'google-drive': { icon: Cloud, token: 'brand' },
  webhosting: { icon: Globe, token: 'brand' },
  'dashboard-view': { icon: LayoutTemplate, token: 'brand' },
  'cv-management': { icon: FolderOpen, token: 'brand' },
  'unified-export': { icon: Download, token: 'brand' },
  'resizable-dashboard': { icon: GripVertical, token: 'brand' },
  blog: { icon: Newspaper, token: 'brand' },
  landing: { icon: Home, token: 'brand' },
  'kiwicv-rebrand': { icon: Sparkles, token: 'brand' },
  'matching-cover-letters': { icon: ScrollText, token: 'brand' },
  // Sparkles, not ScrollText: the badge reads "AI" and the news is that KiwiCV
  // WRITES the letter, following `ai-import` above. `.claude/rules/ui.md` makes
  // Sparkles the AI glyph everywhere. ScrollText stays the cover-letter object,
  // which is what `matching-cover-letters` is about.
  ai_cover_letters: { icon: Sparkles, token: 'brand' },
  // ListPlus echoes the Plus on the rail's "Add section" row (4.5.0).
  custom_sections: { icon: ListPlus, token: 'brand' },
  // Code, not the GitHub mark: lucide-react dropped brand icons, and the news is that the source is public.
  open_source: { icon: Code, token: 'brand' },
  // CalendarClock: the news is a pass measured in a single day.
  one_day_pass: { icon: CalendarClock, token: 'brand' },
  // Link: the news is the posting link saved with each backup.
  job_posting_link: { icon: Link, token: 'brand' },
};

export const getHighlightStyle = (id: string): HighlightStyle =>
  HIGHLIGHT_STYLES[id] ?? HIGHLIGHT_FALLBACK;
