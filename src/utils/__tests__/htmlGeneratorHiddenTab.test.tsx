// @vitest-environment jsdom
import { initialResumeState } from '@/types/resume';
import { generateThemedHTML } from '@/utils/html-generator';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `openHTMLPreview` opens the preview tab **before** it generates, so by the
 * time `generateThemedHTML` runs, the KiwiCV tab is in the background — and a
 * hidden document is not served animation frames at all. Waiting on two of them
 * therefore never resolved: on a phone that was every HTML preview, stuck on
 * "generating" with no error and no timeout, while the PDF beside it worked
 * because it never touches rAF.
 *
 * The test that matters is the one below with rAF stubbed out entirely. It is
 * the hidden-tab case; the visible one is the path that already worked.
 */

const stubSuspendedFrames = () => {
  // A hidden document does not run the callback — it does not merely delay it.
  // Returning a handle and never calling back is exactly that.
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  );
};

describe('generateThemedHTML in a hidden tab', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('still resolves when animation frames are never served', async () => {
    stubSuspendedFrames();

    const html = await generateThemedHTML(initialResumeState, 'probe');

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>probe</title>');
  });

  it('leaves no render container behind', async () => {
    stubSuspendedFrames();
    const before = document.body.childElementCount;

    await generateThemedHTML(initialResumeState, 'probe');

    expect(document.body.childElementCount).toBe(before);
  });

  it('resolves once, not twice, when frames do arrive as well', async () => {
    // Both paths firing must not produce a second read of a container that the
    // first one already unmounted and removed.
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      }),
    );

    const generating = generateThemedHTML(initialResumeState, 'probe');
    const html = await generating;

    // Drain the frames the browser would have delivered late. The callback has
    // already run via the timer; running them now must be a no-op rather than a
    // crash on a container that is gone.
    expect(() => frames.forEach((frame) => frame(0))).not.toThrow();
    expect(html).toContain('<!DOCTYPE html>');
  });
});
