import { createImage, encodeTransparentPng } from '@/utils/image';

/**
 * The signature image pipeline: every drawn, uploaded or pasted signature ends
 * as a trimmed PNG with a transparent background. Local pixel math only — no
 * upload, no model (#103).
 */

/** Longest side a source is reduced to before keying, so a 3456 px paste stays fast. */
const WORK_MAX_SIDE = 1600;
/** Stored size cap: about 3× the printed 180 × 34 pt mark at 72 dpi, so it prints sharp. */
export const SIGNATURE_MAX_WIDTH = 900;
export const SIGNATURE_MAX_HEIGHT = 300;

/**
 * Luminance at or above `PAPER` is paper and turns fully transparent; at or
 * below `INK` it stays opaque. In between fades linearly, which keeps the
 * anti-aliased edge of a pen stroke smooth instead of jagged.
 */
const PAPER = 225;
const INK = 150;
/** A pixel this transparent or more counts as empty when trimming. */
const TRIM_ALPHA = 24;
const TRIM_PAD = 6;

/**
 * Keys out near-white paper in place, multiplying into any alpha the source
 * already has, and returns the bounding box of what remains, or `null` when
 * nothing does.
 */
export function keyOutPaper(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { x: number; y: number; width: number; height: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      const keep = Math.min(1, Math.max(0, (PAPER - luminance) / (PAPER - INK)));
      const alpha = Math.round(data[i + 3] * keep);
      data[i + 3] = alpha;
      if (alpha >= TRIM_ALPHA) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return null;
  const x = Math.max(0, minX - TRIM_PAD);
  const y = Math.max(0, minY - TRIM_PAD);
  return {
    x,
    y,
    width: Math.min(width, maxX + TRIM_PAD + 1) - x,
    height: Math.min(height, maxY + TRIM_PAD + 1) - y,
  };
}

/** Scale that fits `width` × `height` inside the box, never enlarging. */
export function fitScale(width: number, height: number, maxWidth: number, maxHeight: number) {
  return Math.min(1, maxWidth / width, maxHeight / height);
}

export type SignatureImageResult =
  { ok: true; dataUrl: string } | { ok: false; reason: 'empty' | 'unreadable' };

function newCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

/** Keys, trims and downscales any drawable source to the stored PNG. */
export function toSignaturePng(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
): SignatureImageResult {
  if (!sourceWidth || !sourceHeight) return { ok: false, reason: 'unreadable' };

  const workScale = fitScale(sourceWidth, sourceHeight, WORK_MAX_SIDE, WORK_MAX_SIDE);
  const work = newCanvas(sourceWidth * workScale, sourceHeight * workScale);
  const ctx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { ok: false, reason: 'unreadable' };
  ctx.drawImage(source, 0, 0, work.width, work.height);

  const pixels = ctx.getImageData(0, 0, work.width, work.height);
  const box = keyOutPaper(pixels.data, work.width, work.height);
  if (!box) return { ok: false, reason: 'empty' };
  ctx.putImageData(pixels, 0, 0);

  const outScale = fitScale(box.width, box.height, SIGNATURE_MAX_WIDTH, SIGNATURE_MAX_HEIGHT);
  const out = newCanvas(box.width * outScale, box.height * outScale);
  const outCtx = out.getContext('2d');
  if (!outCtx) return { ok: false, reason: 'unreadable' };
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(work, box.x, box.y, box.width, box.height, 0, 0, out.width, out.height);

  const dataUrl = encodeTransparentPng(out);
  return dataUrl ? { ok: true, dataUrl } : { ok: false, reason: 'unreadable' };
}

/**
 * Decodes an uploaded or pasted file to a PNG data URL for the cropper,
 * reduced to the working size so a full-screen paste stays responsive.
 */
export async function fileToWorkingDataUrl(
  file: Blob,
): Promise<{ ok: true; dataUrl: string } | { ok: false; reason: 'unreadable' }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
  try {
    const scale = fitScale(bitmap.width, bitmap.height, WORK_MAX_SIDE, WORK_MAX_SIDE);
    const canvas = newCanvas(bitmap.width * scale, bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, reason: 'unreadable' };
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = encodeTransparentPng(canvas);
    return dataUrl ? { ok: true, dataUrl } : { ok: false, reason: 'unreadable' };
  } finally {
    bitmap.close();
  }
}

/** Keys and trims the cropper's output into the stored PNG. */
export async function dataUrlToSignaturePng(dataUrl: string): Promise<SignatureImageResult> {
  try {
    const image = await createImage(dataUrl);
    return toSignaturePng(image, image.naturalWidth, image.naturalHeight);
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
}
