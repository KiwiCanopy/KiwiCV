import { changelog } from '@/data/changelog';
import { HIGHLIGHT_STYLES } from '@/data/changelogHighlights';
import { en } from '@/locales/en/index';
import { describe, expect, it } from 'vitest';

describe('HIGHLIGHT_STYLES', () => {
  const usedIds = [
    ...new Set(changelog.flatMap((entry) => entry.highlights?.map((h) => h.id) ?? [])),
  ];

  it('has an entry for every highlight id used in changelog.ts', () => {
    const missing = usedIds.filter((id) => !(id in HIGHLIGHT_STYLES));
    expect(missing, `changelog highlight ids missing a style: ${missing.join(', ')}`).toEqual([]);
  });

  it('references at least one real highlight id (guards the test itself)', () => {
    expect(usedIds.length).toBeGreaterThan(0);
  });
});

/**
 * ⚠️ **The direction nothing checked, and it cost 4.4.0 its highlight.**
 *
 * Highlights are deliberately decoupled: the locale file holds the words under
 * `_highlights.<id>`, `changelog.ts` declares which highlights a version has,
 * and `changelogHighlights.ts` maps the id to an icon. The test above walks
 * registry -> styles. Nothing walked locales -> registry, so a highlight could
 * be written, translated into fifteen languages, folded into the version file
 * and shipped — while both surfaces that render it looked it up by an id the
 * registry never listed, found nothing, and drew nothing.
 *
 * That is exactly what happened: 4.4.0 shipped "Cover Letters, Written for You"
 * in the bundle, invisible in the What's New modal and the Changelog tab
 * (owner, 2026-09-08). `release.cjs` reconciles the registry once every
 * changelog source is folded, and reruns this file after its writes.
 */
describe('every highlight in the locales is registered', () => {
  // ⚠️ `changelog.entries`, not `changelog` — the latter is the tab's own UI
  // copy (`intro`, headings). Reading it found zero highlights and the orphan
  // check below passed vacuously, which is what the "guards the test itself"
  // case exists to catch.
  const localeHighlightIds = Object.entries(
    (en.changelog as unknown as { entries: Record<string, Record<string, unknown>> }).entries,
  ).flatMap(([versionId, entry]) => {
    const highlights = entry?._highlights as Record<string, unknown> | undefined;
    return Object.keys(highlights ?? {}).map((id) => ({ versionId, id }));
  });

  it('finds highlights to check at all (guards the test itself)', () => {
    expect(localeHighlightIds.length).toBeGreaterThan(0);
  });

  // Per version, not "registered anywhere": an id declared on some other
  // version's entry still renders nothing for this one.
  it("declares each of them on its own version's changelog.ts entry, or it renders nowhere", () => {
    const declaredByVersion = new Map(
      changelog.map((e) => [e.id, new Set(e.highlights?.map((h) => h.id) ?? [])]),
    );
    const orphaned = localeHighlightIds
      .filter(({ versionId, id }) => !declaredByVersion.get(versionId)?.has(id))
      .map(({ versionId, id }) => `${versionId}._highlights.${id}`);

    expect(
      orphaned,
      `written and translated, but not declared on that version's changelog.ts entry, so no surface renders it: ${orphaned.join(', ')}`,
    ).toEqual([]);
  });
});
