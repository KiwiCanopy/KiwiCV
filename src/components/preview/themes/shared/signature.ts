import { escapeTypst, escapeTypstString } from '@/components/preview/themes/shared/typstUtils';

/**
 * The typed-signature faces. Each is a lazy Typst face (`lazy-font-info.json`)
 * and a lazy CSS face for the dialog, served from `public/fonts/`, never a CDN.
 *
 * `sizePt` is the Typst size at `fontScale` 1. The four faces' x-heights differ
 * a lot, so each has its own size, measured in the rendered PDF (#103).
 */
export const SIGNATURE_FACES = [
  {
    id: 'herr-von-muellerhoff',
    family: 'Herr Von Muellerhoff',
    file: 'herr-von-muellerhoff-regular.ttf',
    sizePt: 26,
  },
  { id: 'great-vibes', family: 'Great Vibes', file: 'great-vibes-regular.ttf', sizePt: 23 },
  { id: 'alex-brush', family: 'Alex Brush', file: 'alex-brush-regular.ttf', sizePt: 24 },
  { id: 'pinyon-script', family: 'Pinyon Script', file: 'pinyon-script-regular.ttf', sizePt: 23 },
] as const;

export type SignatureFace = (typeof SIGNATURE_FACES)[number];
export type SignatureFaceId = SignatureFace['id'];

export const DEFAULT_SIGNATURE_FACE: SignatureFaceId = 'herr-von-muellerhoff';

/**
 * The exact `font:` argument a typed signature emits. The worker prefetches a
 * lazy face only when the markup contains it, so both read this one function.
 */
export const signatureFontDirective = (face: Pick<SignatureFace, 'family'>): string =>
  `font: "${face.family}"`;

export const getSignatureFace = (id: string): SignatureFace | undefined =>
  SIGNATURE_FACES.find((face) => face.id === id);

/**
 * Pen ink, not a theme colour: the draw pad, the typed preview and the PDF all
 * use it, so what the user signs is what prints, in either app theme.
 */
export const SIGNATURE_INK = '#1c1f24';

/**
 * What a serializer needs to draw a signature. The image itself never enters
 * the markup: it reaches the compile as bytes mapped at `path`
 * (`signatureCompileImages`), because the signature lives outside `ResumeData`.
 */
export type TypstSignature =
  { kind: 'image'; path: string } | { kind: 'typed'; faceId: SignatureFaceId; text: string };

/**
 * Height of the mark, in pt before `fontScale`. It overlaps the 24pt signing
 * gap above the rule (`renderTypstSignatureFooter`) and takes no space of its own.
 */
export const SIGNATURE_MARK_HEIGHT = 28;

/** The signature mark alone, fitted to `width` (pt, already scaled). */
export function renderTypstSignatureMark(
  signature: TypstSignature,
  { width, fontScale, typedHeight }: { width: number; fontScale: number; typedHeight: number },
): string {
  if (signature.kind === 'image') {
    const height = SIGNATURE_MARK_HEIGHT * fontScale;
    return `#block(width: ${width}pt, height: ${height}pt)[#image("${escapeTypstString(signature.path)}", width: 100%, height: 100%, fit: "contain")]`;
  }

  const face = getSignatureFace(signature.faceId);
  const text = signature.text.trim();
  if (!face || !text) return '';

  // Measured by its ink bounds and scaled to fit the slot in both directions,
  // so no capital, accent or descender reaches the date line or the printed
  // name, and a long name shrinks rather than wrapping (two lines read as two
  // signatures). `sizePt` is the size before that fit.
  return `#block(width: ${width}pt, height: ${typedHeight}pt)[#align(center + bottom)[#context {
  let mark = text(${signatureFontDirective(face)}, size: ${face.sizePt * fontScale}pt, fill: rgb("${SIGNATURE_INK}"), fallback: false, top-edge: "bounds", bottom-edge: "bounds")[${escapeTypst(text)}]
  let size = measure(mark)
  let k = calc.min(1, ${width}pt / size.width, ${typedHeight}pt / size.height)
  scale(x: k * 100%, y: k * 100%, origin: bottom, reflow: true, mark)
}]]`;
}

/**
 * Inputs a serializer takes from outside `ResumeData`. Only the signature
 * today: it is device-only (#103), so it can never ride on the résumé.
 */
export interface SerializeContext {
  signature: TypstSignature | undefined;
}

export const NO_SIGNATURE: SerializeContext = { signature: undefined };
