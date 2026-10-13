import type { ResumeData } from '@/types/resume';
import { reencodeIfUnparseable } from '@/utils/image-processing';

/** Photos with a re-encode in flight, so a second rehydrate cannot start another. */
const inFlight = new Set<string>();

/**
 * Re-encodes a stored `basics.image` the synchronous stripper cannot parse
 * (GIF, AVIF, HEIC, SVG…) to a metadata-free JPEG after rehydrate; a photo that decodes is done
 * after one pass, an undecodable one is retried on each load.
 * Writes through `updateBasics` only if the photo is still the one it read. An
 * undecodable photo is kept and warned about: dropping is for imports only.
 * `getStore` is called only after the first await, so it may close over a store
 * still being created.
 */
export async function reencodeStoredPhoto(
  image: unknown,
  getStore: () => {
    resume: ResumeData;
    updateBasics: (basics: Partial<ResumeData['basics']>) => void;
  },
): Promise<void> {
  if (typeof image !== 'string' || inFlight.has(image)) return;

  inFlight.add(image);
  try {
    const reencoded = await reencodeIfUnparseable(image);
    if (reencoded === undefined) return;
    if (reencoded === null) {
      console.warn('Stored photo could not be decoded; kept with its metadata.');
      return;
    }
    const store = getStore();
    if (store.resume.basics.image === image) store.updateBasics({ image: reencoded });
  } finally {
    inFlight.delete(image);
  }
}
