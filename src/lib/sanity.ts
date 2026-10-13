import { isSupportedLanguage } from '@/utils/localeRouting';
import { type SanityClient, createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId: string = import.meta.env.VITE_SANITY_PROJECT_ID ?? '';
const dataset: string = import.meta.env.VITE_SANITY_DATASET ?? '';

let client: SanityClient | null = null;
let builder: ReturnType<typeof createImageUrlBuilder> | null = null;

/**
 * `null` without a project ID. `createClient` throws on one, and at module load that failed
 * every chunk importing this file, so an unconfigured fork gets an empty blog instead.
 */
function getClient(): SanityClient | null {
  if (!projectId) return null;
  client ??= createClient({
    projectId,
    dataset,
    useCdn: true, // `false` if you want to ensure fresh data
    apiVersion: '2024-03-11', // Use today's date or latest
  });
  return client;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  caption?: string;
  /** Editor-set focal point and crop; the URL builder applies both when given the whole object. */
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface SanityCategory {
  title: string;
  color: string;
}

/**
 * One language variant of a post, from the `translation.metadata` document that
 * `@sanity/document-internationalization` maintains.
 */
export interface SanityTranslation {
  language: string;
  slug: string;
}

export interface SanityPost {
  title: string;
  slug: string;
  teaser: string;
  mainImage: SanityImage;
  publishedAt: string;
  language: string;
  content?: string;
  readingTime?: number;
  categories?: SanityCategory[];
  seoTitle?: string;
  seoDescription?: string;
  /**
   * Every language this post exists in, including itself — so a set of length
   * one means "no translation linked", not "one translation".
   */
  translations?: SanityTranslation[];
}

/** A `testimonial` document as fetched — unvalidated, since it crosses an API boundary. */
export interface SanityTestimonial {
  _id: string;
  quote?: string;
  name?: string;
  credential?: string;
  photo?: SanityImage & { alt?: string };
  sourceUrl?: string;
  claim?: string[];
}

export function urlFor(source: SanityImage) {
  builder ??= createImageUrlBuilder({ projectId, dataset });
  return builder.image(source);
}

export async function getPosts(lang: string): Promise<SanityPost[]> {
  // Query posts for specific language
  const localizedQuery = `*[_type == "post" && language == $lang && defined(slug.current)] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    teaser,
    mainImage,
    publishedAt,
    language,
    readingTime,
    categories[]->{
      title,
      color
    }
  }`;

  const sanity = getClient();
  if (!sanity) return [];

  let posts = await sanity.fetch(localizedQuery, { lang });

  // Fallback to English if no posts found and lang is not EN
  if (posts.length === 0 && lang !== 'en') {
    posts = await sanity.fetch(localizedQuery, { lang: 'en' });
  }

  return posts;
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    teaser,
    content,
    mainImage,
    publishedAt,
    readingTime,
    language,
    seoTitle,
    seoDescription,
    categories[]->{
      title,
      color
    },
    "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
      language,
      "slug": value->slug.current
    }
  }`;

  const sanity = getClient();
  if (!sanity) return null;

  const post = await sanity.fetch(query, { slug });
  if (!post) return post;

  return {
    ...post,
    // ⚠️ Filtered here rather than in GROQ, because a dangling link survives
    // every filter that runs before the dereference. The plugin writes weak
    // references while the target is still a draft and strengthens them on
    // publish; a draft that is discarded instead leaves the reference pointing
    // at nothing. `defined(value)` is still true for those — the reference
    // object exists — and only `value->` reveals the miss as a null slug.
    // Three such orphans sat in this dataset from 2026-05-09 to 2026-08-30.
    translations: ((post.translations ?? []) as Partial<SanityTranslation>[]).filter(
      (translation): translation is SanityTranslation =>
        Boolean(translation?.language && translation?.slug) &&
        // ⚠️ The Studio's `supportedLanguages` lives in the KiwiCV-Sanity-Studio
        // repo, so nothing on this side can see it change. An editor adding
        // `pt-BR` there would otherwise reach `localizedUrl` and emit
        // `/pt-BR/blog/…` — a URL `netlify.toml`'s `/* -> /index.html` rewrite
        // answers with 200 rather than 404, so it would look alive while being
        // routed by nothing. Types cannot catch this: the value crosses an API
        // boundary at runtime, and a `LocaleCode` annotation on it would be an
        // assertion, not a check.
        isSupportedLanguage(translation.language),
    ),
  };
}

const TESTIMONIALS_QUERY = `*[_type == "testimonial" && published == true && !(_id in path("drafts.**"))]
  | order(order asc, _createdAt asc){ _id, quote, name, credential, photo, sourceUrl, claim }`;

export async function getTestimonials(signal?: AbortSignal): Promise<SanityTestimonial[]> {
  const sanity = getClient();
  if (!sanity) return [];
  return sanity.fetch(TESTIMONIALS_QUERY, {}, { signal });
}
