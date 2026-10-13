import type { SanityImage, SanityTestimonial } from '@/lib/sanity';

/** The claims a placement can support; mirrors the Studio schema's `claim` options. */
export const TESTIMONIAL_CLAIMS = ['pricing', 'privacy'] as const;
export type TestimonialClaim = (typeof TESTIMONIAL_CLAIMS)[number];

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  credential: string;
  photo: { src: string; srcSet: string; alt: string };
  sourceUrl: string;
}

export type TestimonialsByClaim = Partial<Record<TestimonialClaim, Testimonial[]>>;

/** A slow CMS must not hold a placement open; past this the page simply has no quote. */
const FETCH_TIMEOUT_MS = 8000;

/** Rendered size in CSS px; the CDN serves this and its 2x, never the original upload. */
export const PHOTO_SIZE = 56;

type ImageUrl = (photo: SanityImage, size: number) => string;

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function isHttpsUrl(value: unknown): value is string {
  if (!isText(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Narrows a fetched document to a renderable one, or `null` when any required field is missing. */
export function toTestimonial(doc: SanityTestimonial, imageUrl: ImageUrl): Testimonial | null {
  const { photo } = doc;
  if (
    !isText(doc.quote) ||
    !isText(doc.name) ||
    !isText(doc.credential) ||
    !isHttpsUrl(doc.sourceUrl) ||
    !isText(photo?.asset?._ref) ||
    !isText(photo?.alt) ||
    !Array.isArray(doc.claim)
  ) {
    return null;
  }

  // The whole image object, not `asset->url`, so the editor's hotspot and crop apply.
  const { alt, ...image } = photo;
  let src: string, src2x: string;
  try {
    src = imageUrl(image, PHOTO_SIZE);
    src2x = imageUrl(image, PHOTO_SIZE * 2);
  } catch {
    // The builder throws on a malformed `_ref`; that skips this entry, not the whole batch.
    return null;
  }
  return {
    id: doc._id,
    // Verbatim: a real person's words are never trimmed, translated or re-punctuated.
    quote: doc.quote,
    name: doc.name,
    credential: doc.credential,
    photo: { src, srcSet: `${src} 1x, ${src2x} 2x`, alt },
    sourceUrl: doc.sourceUrl,
  };
}

/** Every valid entry per claim, in the order the query returned them. `claim` is an array. */
export function groupByClaim(docs: SanityTestimonial[], imageUrl: ImageUrl): TestimonialsByClaim {
  const grouped: TestimonialsByClaim = {};
  for (const doc of docs) {
    const testimonial = toTestimonial(doc, imageUrl);
    if (!testimonial) continue;
    for (const claim of TESTIMONIAL_CLAIMS) {
      if (doc.claim?.includes(claim)) (grouped[claim] ??= []).push(testimonial);
    }
  }
  return grouped;
}

let pending: Promise<TestimonialsByClaim> | null = null;

/**
 * One request per page load, shared by every placement. Never rejects: any failure resolves
 * to no testimonials, and is forgotten so a later visit to the page can try again.
 */
export function loadTestimonials(): Promise<TestimonialsByClaim> {
  // Imported here so the Sanity client stays out of the landing chunk until a placement nears view.
  pending ??= import('@/lib/sanity')
    .then(async ({ getTestimonials, urlFor }) => {
      // Older Safari lacks `AbortSignal.timeout`; there the fetch simply runs unbounded.
      const signal =
        typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
          : undefined;
      const docs = await getTestimonials(signal);
      const imageUrl: ImageUrl = (photo, size) =>
        urlFor(photo).width(size).height(size).fit('crop').auto('format').url();
      return groupByClaim(Array.isArray(docs) ? docs : [], imageUrl);
    })
    .catch(() => {
      pending = null;
      return {};
    });
  return pending;
}

export function resetTestimonialsForTests() {
  pending = null;
}
