// @vitest-environment jsdom
import { initialResumeState } from '@/types/resume';
import { generateThemedHTML } from '@/utils/html-generator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `<base href>` is the exported document's only route back to this origin, and
 * the fonts depend on it.
 *
 * `html-generator.tsx` carries no web-font `<link>` **on purpose**: the
 * style capture copies every `@font-face` the app declares, and their
 * `url('/fonts/…')` sources are root-relative, so `<base>` is what resolves them.
 * Drop the tag or make it relative and every exported CV silently loses its
 * typefaces — with `npm test` green, because nothing else in the repo matches
 * `<base`.
 *
 * ⚠️ This assertion previously lived in a suite about the export's favicon, and
 * went out with it when that was reverted for the brand rule. It has nothing to
 * do with the icon; it is here so the next revert cannot take it along.
 */
describe('the exported document keeps its <base>', () => {
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

  it('emits a <base href> the @font-face sources can resolve against', async () => {
    const html = await generateThemedHTML(initialResumeState);
    const href = html.match(/<base\s+href="([^"]+)"/)?.[1];

    expect(href, 'no <base href> in the exported head').toBeTruthy();
    // An origin, not a relative path — the export is opened from a `blob:` URL,
    // where a relative base resolves against the blob and reaches nothing.
    expect(href!.startsWith('http')).toBe(true);
  });

  /**
   * Non-vacuity. Every assertion above matches against a large string, and a
   * generator returning `''` — or a stubbed rAF that never resolves the real
   * template — would fail them for the wrong reason.
   */
  it('produced a real document rather than an empty string', async () => {
    const html = await generateThemedHTML(initialResumeState);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html.length).toBeGreaterThan(200);
  });
});
