import { useMemo } from 'react';

import type { ChangelogData, Highlight } from '@/components/modals/version-update/types';
import { changelog } from '@/data/changelog';
import { TYPE_ORDER, parseChangelogEntry } from '@/features/extras/utils/changelog';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Collects everything the update modal shows across the versions a returning
 * user missed: the highlight cards, and the full changelog lines grouped by
 * type.
 */
export function useVersionUpdateContent(version: string, missedVersions: string[]) {
  const { tObject } = useTranslation();

  // Aggregate highlights from all missed versions
  const highlights = useMemo(() => {
    // If no missed versions provided (legacy or single), fallback to current version only
    const versionsToScan = missedVersions.length > 0 ? missedVersions : [version];

    const allHighlights: Highlight[] = [];

    versionsToScan.forEach((v) => {
      const vEntry = changelog.find((e) => e.version === v);
      if (!vEntry?.highlights) return;

      const vTranslationId = vEntry.id || `v_${v.replace(/\./g, '_')}`;
      const vTranslations = tObject<ChangelogData>(`changelog.entries.${vTranslationId}`) || {};
      const vHighlightsTranslations = vTranslations._highlights || {};

      vEntry.highlights.forEach((meta) => {
        // Prevent duplicates if same highlight ID appears in multiple versions
        if (allHighlights.some((h) => h.id === meta.id)) return;

        allHighlights.push({
          ...meta,
          ...(vHighlightsTranslations[meta.id] || {}),
        } as Highlight);
      });
    });

    return allHighlights;
  }, [missedVersions, version, tObject]);

  // Aggregate all detailed changelog entries from missed versions
  const allParsedEntries = useMemo(() => {
    const versionsToScan = missedVersions.length > 0 ? missedVersions : [version];
    const all: { type: string; content: string }[] = [];
    const seenContents = new Set<string>();

    versionsToScan.forEach((v) => {
      const vEntry = changelog.find((e) => e.version === v);
      const vId = vEntry?.id || `v_${v.replace(/\./g, '_')}`;
      const entries = tObject<ChangelogData>(`changelog.entries.${vId}`) || {};

      Object.entries(entries)
        .filter(([key]) => key !== '_highlights')
        .forEach(([key, val]) => {
          const parsed = parseChangelogEntry(key, String(val));
          // Avoid exact duplicates if they happen to exist across versions
          if (!seenContents.has(parsed.content)) {
            all.push(parsed as { type: string; content: string });
            seenContents.add(parsed.content);
          }
        });
    });

    return all;
  }, [missedVersions, version, tObject]);

  const grouped = allParsedEntries.reduce(
    (acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr.content);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const types = Object.keys(grouped).sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b));

  // Read once at render, deliberately without a resize listener: the modal is
  // opened at a fixed moment and does not re-flow its highlight set underneath
  // the reader.
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const visibleHighlights = highlights.filter((h) => !h.desktopOnly || isDesktop);

  return { highlights: visibleHighlights, allParsedEntries, grouped, types };
}
