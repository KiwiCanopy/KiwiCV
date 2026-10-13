export interface IntrinsicSize {
  width: number;
  height: number;
}

/**
 * Recovers an image's intrinsic size from a Sanity CDN URL.
 *
 * Sanity encodes the asset's real dimensions in the filename
 * (`…-926x997.jpg`), so `width`/`height` are available data rather than
 * something that has to be measured after the bytes land. Emitting them
 * reserves the box up front, which is what stops an article reflowing as each
 * image arrives.
 *
 * Returns `null` for any URL that does not carry the pattern — a
 * markdown-embedded image from another host, say — so the caller omits the
 * attributes rather than guessing at them.
 */
/** `?w=` from a URL that may not parse — a markdown src is arbitrary text. */
function readRequestedWidth(src: string): number {
  try {
    return Number(new URL(src, 'https://cdn.sanity.io').searchParams.get('w')) || 0;
  } catch {
    return 0;
  }
}

export function getIntrinsicSize(src: string): IntrinsicSize | null {
  const match = src.match(/-(\d+)x(\d+)\.[a-z0-9]+(?:\?|$)/i);
  if (!match) return null;

  const naturalWidth = Number(match[1]);
  const naturalHeight = Number(match[2]);
  if (!naturalWidth || !naturalHeight) return null;

  // `?w=` is the width actually served. Scale the height to match so the ratio
  // stays true even though both numbers shrink; a wrong ratio here would
  // reserve the wrong box and cause the very shift this prevents.
  const requested = readRequestedWidth(src);
  const width = requested > 0 && requested < naturalWidth ? requested : naturalWidth;

  return { width, height: Math.round((naturalHeight / naturalWidth) * width) };
}
