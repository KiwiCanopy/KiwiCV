import { createImage, encodeOpaqueJpeg } from '@/utils/image';

/** JPEG quality for an imported photo. */
export const IMPORT_JPEG_QUALITY = 0.9;

/**
 * Decodes an image URL (remote or `data:`) in the browser and redraws it on a
 * canvas as a JPEG data URL, which carries none of the source's metadata.
 * Resolves `null` when the image cannot be decoded or the canvas cannot be read
 * (no 2D context, or tainted by a cross-origin source without CORS). Never
 * rejects.
 */
export async function reencodeAsJpeg(src: string): Promise<string | null> {
  let img: HTMLImageElement;
  try {
    img = await createImage(src);
  } catch {
    return null;
  }
  if (!img.width || !img.height) return null;

  try {
    return encodeOpaqueJpeg(
      img.width,
      img.height,
      (ctx) => ctx.drawImage(img, 0, 0, img.width, img.height),
      IMPORT_JPEG_QUALITY,
    );
  } catch {
    return null;
  }
}
