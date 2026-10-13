// @vitest-environment jsdom
import { initialResumeState } from '@/types/resume';
import { generateThemedHTML } from '@/utils/html-generator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The exported document's tab icon, in its own file on purpose.
 *
 * ⚠️ It first lived in a suite that also held the `<base href>` assertion, and
 * when an earlier icon was reverted the whole suite went with it — taking `<base>`,
 * which is unrelated and load-bearing for fonts. Separate files so a fourth
 * revert of the icon cannot delete an assertion about something else.
 *
 * The rule the icon obeys is `code/DESIGN_LANGUAGE.md` § "Exported documents
 * carry no KiwiCV mark". This asserts the shape of the fix; the wiki owns the
 * ruling.
 */
describe('the exported document declares a tab icon', () => {
  beforeEach(() => {
    // The generator waits on two animation frames; jsdom serves none by default.
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      }),
    );
  });

  const iconHrefs = (html: string): string[] =>
    [...html.matchAll(/<link\s+rel="icon"[^>]*href="([^"]+)"/g)].map((m) => m[1]);

  /**
   * ⚠️ A `blob:` document gets no `/favicon.ico` fallback — measured with Chrome
   * netlog: an identical blob export with an icon link fetches it five times, one
   * without requests nothing and keeps the browser's default glyph.
   */
  it('declares at least one icon, since a blob: document infers none', async () => {
    expect(iconHrefs(await generateThemedHTML(initialResumeState)).length).toBeGreaterThan(0);
  });

  /**
   * ⚠️ Two formats. SVG-only `rel="icon"` is ignored by some engines (Safari),
   * which would leave exactly the default glyph this exists to remove — for a
   * recruiter cohort the applicant cannot predict. The PNG is the floor.
   */
  it('offers a raster fallback for engines that ignore SVG favicons', async () => {
    const hrefs = iconHrefs(await generateThemedHTML(initialResumeState));
    expect(hrefs.some((h) => h.startsWith('data:image/svg+xml'))).toBe(true);
    expect(hrefs.some((h) => h.startsWith('data:image/png;base64,'))).toBe(true);
  });

  /**
   * ⚠️ Every icon is INLINE. A referenced path re-introduces the origin
   * dependency an earlier icon had, and is how a brand asset gets back in.
   */
  it('inlines every icon rather than referencing one', async () => {
    for (const href of iconHrefs(await generateThemedHTML(initialResumeState))) {
      expect(href.startsWith('data:'), `icon is not inline: ${href.slice(0, 40)}`).toBe(true);
    }
  });

  /**
   * ⚠️ Non-vacuity, and the reason the earlier version of this assertion was
   * weak: `startsWith('data:image/svg+xml')` also passes for the EMPTY payload
   * `data:image/svg+xml,` — an icon that renders nothing. Decode it.
   */
  it('carries a real SVG payload, not an empty data URI', async () => {
    const svg = iconHrefs(await generateThemedHTML(initialResumeState)).find((h) =>
      h.startsWith('data:image/svg+xml'),
    )!;
    const decoded = decodeURIComponent(svg.slice('data:image/svg+xml,'.length));

    expect(decoded).toMatch(/^<svg[\s\S]*<\/svg>$/);
    expect(decoded.length).toBeGreaterThan(60);
  });

  /**
   * ⚠️ The brand half, and it must decode to check. A KiwiCV mark inlined as a
   * data URI passes any test that only greps the encoded href — the payload is
   * percent-encoded, so `kiwi` never appears literally. This is the realistic
   * next regression now that the rule forces inlining.
   */
  it('carries no KiwiCV mark, hosted or inlined', async () => {
    for (const href of iconHrefs(await generateThemedHTML(initialResumeState))) {
      expect(href).not.toContain('/logos/');

      if (!href.startsWith('data:image/svg+xml,')) continue;
      const decoded = decodeURIComponent(href.slice('data:image/svg+xml,'.length)).toLowerCase();
      for (const mark of ['kiwi', 'canopy', '<image', 'xlink:href']) {
        expect(decoded, `the inlined icon contains "${mark}"`).not.toContain(mark);
      }
    }
  });
});
