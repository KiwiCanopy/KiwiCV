export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

/**
 * Returns a `width`×`height` canvas filled white with `draw` painted over it,
 * or `null` when no 2D context is available. JPEG has no alpha, so a
 * transparent pixel would encode black without the fill.
 */
function drawOpaqueCanvas(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  draw(ctx);
  return canvas;
}

const JPEG_MIME = 'image/jpeg';

/**
 * Paints `draw` over white on a `width`×`height` canvas and encodes it as a JPEG
 * data URL; `null` without a 2D context or when the result is not a JPEG — an
 * oversized canvas yields `data:,`. With the blob variant below, the only canvas
 * encode in `src/` (`opaqueJpegEncode.test.tsx`). Throws what `toDataURL`
 * throws: a tainted canvas.
 */
export function encodeOpaqueJpeg(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  quality: number,
): string | null {
  const canvas = drawOpaqueCanvas(width, height, draw);
  const encoded = canvas?.toDataURL(JPEG_MIME, quality);
  return encoded?.startsWith(`data:${JPEG_MIME}`) ? encoded : null;
}

/** `encodeOpaqueJpeg` as a `Blob`; `null` without a 2D context or when the encode fails. */
export function encodeOpaqueJpegBlob(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  quality: number,
): Promise<Blob | null> {
  const canvas = drawOpaqueCanvas(width, height, draw);
  if (!canvas) return Promise.resolve(null);
  return new Promise((resolve) => canvas.toBlob(resolve, JPEG_MIME, quality));
}
