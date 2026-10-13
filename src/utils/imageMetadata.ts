/**
 * Strips camera and editing metadata — EXIF (GPS included), XMP, IPTC, C2PA,
 * comments, text chunks and data appended after the image — from a JPEG, PNG
 * or WebP data URL, keeping the pixels, the colour profile and a JPEG's
 * orientation. Each format keeps an allow list, so an unknown block is dropped,
 * not kept. Synchronous, so the sanitizer can call it on rehydrate.
 * Fails open: anything it cannot parse, and other formats, come back unchanged —
 * import re-encodes them first (`preProcessResumeData`), and rehydrate
 * re-encodes stored ones afterwards (`reencodeStoredPhoto`).
 */
export function stripImageMetadata(dataUrl: string): string {
  return stripImageMetadataOrNull(dataUrl) ?? dataUrl;
}

/**
 * `stripImageMetadata`, but `null` when the bytes are not a JPEG, PNG or WebP it
 * could parse — the caller then knows the metadata is still there.
 */
export function stripImageMetadataOrNull(dataUrl: string): string | null {
  const match = /^data:(image\/[\w.+-]+)(?:;[^,;]*)*;base64,(.*)$/is.exec(dataUrl);
  if (!match) return null;

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(match[2].trim()), (char) => char.charCodeAt(0));
  } catch {
    return null;
  }

  // The bytes decide the format, not the label.
  const stripped = isJpeg(bytes)
    ? stripJpeg(bytes)
    : isPng(bytes)
      ? stripPng(bytes)
      : isWebp(bytes)
        ? stripWebp(bytes)
        : null;
  if (!stripped) return null;
  if (equalBytes(stripped, bytes)) return dataUrl;

  let binary = '';
  for (let i = 0; i < stripped.length; i += 0x8000) {
    binary += String.fromCharCode(...stripped.subarray(i, i + 0x8000));
  }
  return `data:${match[1].toLowerCase()};base64,${btoa(binary)}`;
}

const equalBytes = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((byte, i) => byte === b[i]);

const concat = (parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const ascii = (bytes: Uint8Array, at: number, length: number) =>
  String.fromCharCode(...bytes.subarray(at, at + length));

const isJpeg = (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8;
const isPng = (bytes: Uint8Array) => ascii(bytes, 1, 3) === 'PNG' && bytes[0] === 0x89;
const isWebp = (bytes: Uint8Array) =>
  ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP';

/**
 * A JPEG keeps APP0 (JFIF), APP2 only when it is the ICC profile, APP14
 * (Adobe colour transform) and every non-APP marker; every other APPn and COM
 * goes. The scan is copied up to the first end-of-image marker, so a trailer —
 * a second JPEG with its own EXIF, a motion-photo video — goes too.
 */
function stripJpeg(bytes: Uint8Array): Uint8Array | null {
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let orientation = 1;
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    // Fill bytes before a marker.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xda) {
      // Entropy-coded data stuffs FF00, and restart markers are FFD0-FFD7, so
      // the first FFD9 is the end of the image.
      let eoi = offset + 2;
      while (eoi + 1 < bytes.length && !(bytes[eoi] === 0xff && bytes[eoi + 1] === 0xd9)) eoi += 1;
      if (eoi + 1 >= bytes.length) return null;
      if (orientation !== 1) parts.splice(1, 0, orientationSegment(orientation));
      parts.push(bytes.subarray(offset, eoi + 2));
      return concat(parts);
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + length;
    if (length < 2 || end > bytes.length) return null;

    const isApp = marker >= 0xe0 && marker <= 0xef;
    const keep =
      marker === 0xfe
        ? false
        : !isApp ||
          marker === 0xe0 ||
          marker === 0xee ||
          (marker === 0xe2 && ascii(bytes, offset + 4, 12) === 'ICC_PROFILE\0');
    if (marker === 0xe1)
      orientation = readOrientation(bytes.subarray(offset + 4, end)) ?? orientation;
    if (keep) parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  return null;
}

/** EXIF Orientation (tag 0x0112) from an APP1 payload, when it is EXIF. */
function readOrientation(payload: Uint8Array): number | null {
  if (ascii(payload, 0, 6) !== 'Exif\0\0') return null;
  const tiff = payload.subarray(6);
  const little = ascii(tiff, 0, 2) === 'II';
  if (!little && ascii(tiff, 0, 2) !== 'MM') return null;
  const u16 = (at: number) =>
    little ? tiff[at] | (tiff[at + 1] << 8) : (tiff[at] << 8) | tiff[at + 1];
  const u32 = (at: number) =>
    little
      ? (tiff[at] | (tiff[at + 1] << 8) | (tiff[at + 2] << 16) | (tiff[at + 3] << 24)) >>> 0
      : ((tiff[at] << 24) | (tiff[at + 1] << 16) | (tiff[at + 2] << 8) | tiff[at + 3]) >>> 0;
  const ifd = u32(4);
  if (ifd + 2 > tiff.length) return null;
  const count = u16(ifd);
  for (let i = 0; i < count; i += 1) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > tiff.length) return null;
    if (u16(entry) === 0x0112) {
      const value = u16(entry + 8);
      return value >= 1 && value <= 8 ? value : null;
    }
  }
  return null;
}

/**
 * A minimal APP1 carrying only the orientation, so a rotated phone photo still
 * displays upright once its EXIF is gone.
 */
function orientationSegment(orientation: number): Uint8Array {
  // prettier-ignore
  const payload = [
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // Exif\0\0
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, // II*, IFD0 at 8
    0x01, 0x00, // one entry
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00, // Orientation SHORT
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ];
  const length = payload.length + 2;
  return Uint8Array.from([0xff, 0xe1, length >> 8, length & 0xff, ...payload]);
}

/** Critical chunks plus the ancillary ones that change how the pixels render. */
const PNG_KEPT = new Set([
  'IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT',
  'bKGD', 'pHYs', 'cICP', 'mDCv', 'cLLi', 'acTL', 'fcTL', 'fdAT',
]); // prettier-ignore

function stripPng(bytes: Uint8Array): Uint8Array | null {
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length =
      ((bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]) >>>
      0;
    const type = ascii(bytes, offset + 4, 4);
    const end = offset + 12 + length;
    if (end > bytes.length) return null;
    if (PNG_KEPT.has(type)) parts.push(bytes.subarray(offset, end));
    offset = end;
    if (type === 'IEND') return concat(parts);
  }
  return null;
}

const WEBP_KEPT = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF', 'ICCP']);

function stripWebp(bytes: Uint8Array): Uint8Array | null {
  const chunks: Uint8Array[] = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const size =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>>
      0;
    if (offset + 8 + size > bytes.length) return null;
    const end = Math.min(offset + 8 + size + (size % 2), bytes.length);
    if (WEBP_KEPT.has(type)) {
      const chunk = bytes.slice(offset, end);
      // VP8X flags announce the chunks: clear EXIF (bit 3) and XMP (bit 2).
      if (type === 'VP8X') chunk[8] &= ~0x0c;
      chunks.push(chunk);
    }
    offset = end;
  }
  const body = concat(chunks);
  const header = bytes.slice(0, 12);
  const riffSize = body.length + 4;
  header[4] = riffSize & 0xff;
  header[5] = (riffSize >> 8) & 0xff;
  header[6] = (riffSize >> 16) & 0xff;
  header[7] = (riffSize >> 24) & 0xff;
  return concat([header, body]);
}

let lastInput: string | undefined;
let lastOutput: string | null = null;

/**
 * `stripImageMetadataOrNull`, remembering the last photo: the sanitizer runs on
 * every edit and the rehydrate pass re-checks the same photo on load, and the
 * photo is the one large value that almost never changes.
 */
export function stripImageMetadataOrNullCached(dataUrl: string): string | null {
  if (dataUrl !== lastInput) {
    lastInput = dataUrl;
    lastOutput = stripImageMetadataOrNull(dataUrl);
  }
  return lastOutput;
}

/** `stripImageMetadata` through the same one-photo cache. */
export function stripImageMetadataCached(dataUrl: string): string {
  return stripImageMetadataOrNullCached(dataUrl) ?? dataUrl;
}
