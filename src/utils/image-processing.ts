import type { ResumeData } from '@/types/resume';
import { stripImageMetadataOrNullCached } from '@/utils/imageMetadata';
import { reencodeAsJpeg } from '@/utils/imageReencode';
import type { ImportWarning } from '@/utils/validation';

/**
 * The one test for "this photo still carries metadata the stripper cannot
 * remove": `undefined` when it is clean as-is (not `data:`, or parseable), the
 * re-encoded JPEG, or `null` when the browser cannot decode it. Import drops a
 * `null`; rehydrate keeps it.
 */
export async function reencodeIfUnparseable(image: string): Promise<string | null | undefined> {
  if (!image.startsWith('data:') || stripImageMetadataOrNullCached(image) !== null)
    return undefined;
  return reencodeAsJpeg(image);
}

/**
 * The imported photo, made safe to store: a remote URL inlined as a JPEG, a
 * `data:` image the synchronous stripper can parse left for it, and every other
 * `data:` image re-encoded as a JPEG — or dropped when the browser cannot decode
 * it, since keeping it would keep its metadata.
 */
async function processImage(image: string): Promise<{ image: string; dropped: boolean }> {
  if (image.startsWith('data:')) {
    const reencoded = await reencodeIfUnparseable(image);
    if (reencoded === undefined) return { image, dropped: false };
    return reencoded ? { image: reencoded, dropped: false } : { image: '', dropped: true };
  }

  // http, https and protocol-relative URLs; a failure keeps the URL loadable.
  if (image.startsWith('http') || image.startsWith('//')) {
    const url = image.startsWith('//') ? `https:${image}` : image;
    return { image: (await reencodeAsJpeg(url)) ?? url, dropped: false };
  }

  return { image, dropped: false };
}

/**
 * Pre-processes imported resume data before it reaches `setResume`, which takes
 * the returned `warnings` as `options.warnings`.
 */
export async function preProcessResumeData(
  data: Partial<ResumeData>,
): Promise<{ data: Partial<ResumeData>; warnings: ImportWarning[] }> {
  if (!data) return { data: {}, warnings: [] };

  const image = data.basics?.image;
  if (typeof image !== 'string' || !image) return { data, warnings: [] };

  const processed = await processImage(image);
  if (processed.image === image) return { data, warnings: [] };

  return {
    data: {
      ...data,
      basics: { ...data.basics, image: processed.image } as ResumeData['basics'],
    },
    warnings: processed.dropped
      ? [{ section: 'basics', field: 'image', message: 'editor.photo.conversion_failed' }]
      : [],
  };
}
