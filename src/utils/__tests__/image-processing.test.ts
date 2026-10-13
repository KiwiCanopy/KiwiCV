// @vitest-environment jsdom
import type { ResumeData } from '@/types/resume';
import { preProcessResumeData } from '@/utils/image-processing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `preProcessResumeData` runs on every import path — JSON file
 * (`ImportModal.tsx`), AI import (`useAIImportJob.ts`) and cloud restore
 * (`useCloudRestoreAction.ts`) — and inlines a remote `basics.image` as a data
 * URL so the PDF compiler never has to fetch it. Every failure mode resolves
 * with the original URL rather than rejecting, so an unreachable avatar can
 * never block an import. That is the property worth pinning; it had no tests.
 */

/** The `src` each fake `Image` was given, in order. */
let requestedSrcs: string[] = [];
/** How the next constructed `Image` should settle. */
let imageOutcome: 'load' | 'error' = 'load';

class FakeImage {
  private listeners: Record<string, (() => void)[]> = {};
  width = 100;
  height = 100;

  addEventListener(type: string, listener: () => void) {
    (this.listeners[type] ??= []).push(listener);
  }

  setAttribute() {}

  set src(value: string) {
    requestedSrcs.push(value);
    // The real `Image` settles asynchronously; a microtask is enough here.
    queueMicrotask(() => {
      for (const listener of this.listeners[imageOutcome] ?? []) listener();
    });
  }
}

const DATA_URL = 'data:image/jpeg;base64,AAAA';

function withImage(image: unknown): Partial<ResumeData> {
  return { basics: { name: 'Ada', image } as ResumeData['basics'] };
}

const preProcess = async (data: Partial<ResumeData>) => (await preProcessResumeData(data)).data;

beforeEach(() => {
  requestedSrcs = [];
  imageOutcome = 'load';
  vi.stubGlobal('Image', FakeImage);
  // `src/test/setup.ts` pins `getContext` to null for jsdom; give each test a
  // working 2D context by default so the conversion path is the one under test.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(DATA_URL);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('preProcessResumeData — inputs it leaves alone', () => {
  it('returns an empty object for missing data', async () => {
    expect(await preProcessResumeData(undefined as unknown as Partial<ResumeData>)).toEqual({
      data: {},
      warnings: [],
    });
  });

  it.each([
    ['a relative path', '/avatar.png'],
    ['an empty string', ''],
    ['a non-string value', 42],
  ])('does not touch %s', async (_label, image) => {
    const data = withImage(image);

    expect(await preProcess(data)).toEqual(data);
    expect(requestedSrcs).toEqual([]);
  });

  it('passes through a resume with no basics block at all', async () => {
    const data = { work: [] } as Partial<ResumeData>;

    expect(await preProcess(data)).toEqual(data);
    expect(requestedSrcs).toEqual([]);
  });
});

describe('preProcessResumeData — remote images', () => {
  it('converts an http URL to a data URL', async () => {
    const result = await preProcess(withImage('http://cdn.test/a.png'));

    expect(requestedSrcs).toEqual(['http://cdn.test/a.png']);
    expect(result.basics?.image).toBe(DATA_URL);
  });

  it('converts an https URL to a data URL', async () => {
    const result = await preProcess(withImage('https://cdn.test/a.png'));

    expect(result.basics?.image).toBe(DATA_URL);
  });

  /** A protocol-relative URL is not loadable as-is outside a page context. */
  it('upgrades a protocol-relative URL to https before loading it', async () => {
    const result = await preProcess(withImage('//cdn.test/a.png'));

    expect(requestedSrcs).toEqual(['https://cdn.test/a.png']);
    expect(result.basics?.image).toBe(DATA_URL);
  });

  it('keeps the rest of basics intact', async () => {
    const result = await preProcess(withImage('https://cdn.test/a.png'));

    expect(result.basics?.name).toBe('Ada');
  });

  it('does not mutate the input', async () => {
    const data = withImage('https://cdn.test/a.png');
    await preProcess(data);

    expect(data.basics?.image).toBe('https://cdn.test/a.png');
  });
});

describe('preProcessResumeData — every failure keeps a loadable URL', () => {
  it('falls back when the image fails to load', async () => {
    imageOutcome = 'error';
    const result = await preProcess(withImage('https://cdn.test/gone.png'));

    expect(result.basics?.image).toBe('https://cdn.test/gone.png');
  });

  it('falls back when no 2D canvas context is available', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const result = await preProcess(withImage('https://cdn.test/a.png'));

    expect(result.basics?.image).toBe('https://cdn.test/a.png');
  });

  /**
   * The one case where "the original URL" is not literally what comes back: the
   * `//` → `https:` upgrade happens before the load, so a failure resolves with
   * the upgraded URL. Harmless — `https:` is what a browser would have resolved
   * `//` to anyway — but it does mean a failed import rewrites the stored value,
   * so it is pinned rather than left to be discovered.
   */
  it('keeps the https-upgraded form of a protocol-relative URL', async () => {
    imageOutcome = 'error';
    const result = await preProcess(withImage('//cdn.test/gone.png'));

    expect(result.basics?.image).toBe('https://cdn.test/gone.png');
  });

  /** A cross-origin image without CORS headers taints the canvas. */
  it('falls back when toDataURL throws on a tainted canvas', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => {
      throw new Error('SecurityError: tainted canvas');
    });
    const result = await preProcess(withImage('https://cdn.test/a.png'));

    expect(result.basics?.image).toBe('https://cdn.test/a.png');
  });
});

describe('preProcessResumeData — a data: photo the stripper cannot parse', () => {
  const GIF = `data:image/gif;base64,${btoa('GIF89a\x01\x00\x01\x00')}`;

  it('redraws it on a canvas as a JPEG at 0.9', async () => {
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');
    const result = await preProcess(withImage(GIF));

    expect(requestedSrcs).toEqual([GIF]);
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.9);
    expect(result.basics?.image).toBe(DATA_URL);
  });

  it('drops it when it cannot be decoded', async () => {
    imageOutcome = 'error';
    const result = await preProcess(withImage(GIF));

    expect(result.basics?.image).toBe('');
  });
});
