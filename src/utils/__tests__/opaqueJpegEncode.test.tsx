// @vitest-environment jsdom
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useImageCropper } from '@/components/ui/image-cropper/useImageCropper';
import { REPO_ROOT, named, sourceFiles } from '@/test/sourceFiles';
import { encodeOpaqueJpeg, encodeOpaqueJpegBlob } from '@/utils/image';
import { reencodeAsJpeg } from '@/utils/imageReencode';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * JPEG has no alpha, so every canvas → JPEG encode must paint white under the
 * image or a transparent pixel encodes black.
 */

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

/** Every call made on the fake 2D context, in order. */
let calls: string[] = [];

function recordingContext() {
  const record =
    (name: string) =>
    (...args: unknown[]) =>
      calls.push(`${name}(${args.filter((a) => typeof a === 'number').join(',')})`);
  return {
    set fillStyle(value: string) {
      calls.push(`fillStyle=${value}`);
    },
    fillRect: record('fillRect'),
    drawImage: (..._args: unknown[]) => calls.push('drawImage'),
    scale: record('scale'),
    translate: record('translate'),
    rotate: record('rotate'),
    imageSmoothingQuality: 'low',
  } as unknown as CanvasRenderingContext2D;
}

/** The calls up to and including the first `drawImage`, transforms dropped. */
const paintOrder = () =>
  calls
    .slice(0, calls.indexOf('drawImage') + 1)
    .filter((c) => !/^(scale|translate|rotate)\(/.test(c));

let toDataURL: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  calls = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => recordingContext() as unknown as ReturnType<HTMLCanvasElement['getContext']>,
  );
  toDataURL = vi
    .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockReturnValue('data:image/jpeg;base64,AAAA');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('encodeOpaqueJpeg', () => {
  it('fills the whole canvas white, draws, then encodes', () => {
    const encoded = encodeOpaqueJpeg(40, 30, (ctx) => ctx.drawImage(new Image(), 0, 0), 0.7);

    expect(calls).toEqual(['fillStyle=#fff', 'fillRect(0,0,40,30)', 'drawImage']);
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7);
    expect(encoded).toBe('data:image/jpeg;base64,AAAA');
  });

  it('returns null without drawing when there is no 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const draw = vi.fn();

    expect(encodeOpaqueJpeg(10, 10, draw, 0.7)).toBeNull();
    expect(draw).not.toHaveBeenCalled();
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it('returns null when the canvas yields no JPEG, as an oversized one does', () => {
    toDataURL.mockReturnValue('data:,');

    expect(encodeOpaqueJpeg(10, 10, () => {}, 0.7)).toBeNull();
  });
});

describe('encodeOpaqueJpegBlob', () => {
  it('fills white, draws, then encodes a JPEG blob', async () => {
    const jpeg = new Blob(['x'], { type: 'image/jpeg' });
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((callback) => callback(jpeg));

    const result = await encodeOpaqueJpegBlob(
      8,
      6,
      (ctx) => ctx.drawImage(new Image(), 0, 0),
      0.92,
    );

    expect(calls).toEqual(['fillStyle=#fff', 'fillRect(0,0,8,6)', 'drawImage']);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.92);
    expect(result).toBe(jpeg);
  });

  it('resolves null when the encode fails', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
      callback(null),
    );

    await expect(encodeOpaqueJpegBlob(8, 6, () => {}, 0.92)).resolves.toBeNull();
  });
});

describe('every JPEG encode site paints white first', () => {
  it('reencodeAsJpeg', async () => {
    class LoadingImage {
      width = 20;
      height = 10;
      private onLoad?: () => void;
      addEventListener(type: string, listener: () => void) {
        if (type === 'load') this.onLoad = listener;
      }
      setAttribute() {}
      set src(_value: string) {
        queueMicrotask(() => this.onLoad?.());
      }
    }
    vi.stubGlobal('Image', LoadingImage);

    await reencodeAsJpeg('data:image/png;base64,AAAA');

    expect(paintOrder()).toEqual(['fillStyle=#fff', 'fillRect(0,0,20,10)', 'drawImage']);
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.9);
  });

  it('the photo cropper', async () => {
    const onCropComplete = vi.fn();
    const { result } = renderHook(() =>
      useImageCropper({ imageSrc: 'data:image/png;base64,AAAA', onCropComplete }),
    );
    result.current.imgRef.current = {
      naturalWidth: 200,
      naturalHeight: 200,
      width: 200,
      height: 200,
    } as HTMLImageElement;
    act(() => {
      result.current.setCompletedCrop({ unit: 'px', x: 0, y: 0, width: 100, height: 100 });
      result.current.setZoom(1.5);
    });

    await act(() => result.current.createCroppedImage());

    expect(paintOrder()).toEqual(['fillStyle=#fff', 'fillRect(0,0,100,100)', 'drawImage']);
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.85);
    expect(onCropComplete).toHaveBeenCalledWith('data:image/jpeg;base64,AAAA', 'square');
  });

  it('the avatar cache', () => {
    render(<UserAvatar url="https://cdn.test/avatar.png" name="Ada" />);

    fireEvent.load(screen.getByRole('img'));

    expect(paintOrder()).toEqual(['fillStyle=#fff', 'fillRect(0,0,128,128)', 'drawImage']);
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
  });

  /**
   * No canvas encode outside `src/utils/image.ts`, whatever its MIME. Encodes
   * inside a dependency are out of its reach: PhotoEditor's heic-to fallback encodes
   * its JPEG inside that library.
   */
  it('no source file but src/utils/image.ts calls a canvas encoder', () => {
    const encoderCall = /\b(toDataURL|toBlob|convertToBlob)\s*\(/;
    const files = sourceFiles(join(REPO_ROOT, 'src'), {
      extensions: ['.ts', '.tsx'],
      skip: [named('__tests__'), /\.test\.tsx?$/],
    });
    const encoders = files
      .filter((file) => encoderCall.test(readFileSync(file, 'utf8')))
      .map((file) => relative(REPO_ROOT, file).split(sep).join('/'));

    expect(encoders).toEqual(['src/utils/image.ts']);
  });
});
