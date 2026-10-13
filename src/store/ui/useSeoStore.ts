import { create } from 'zustand';

/**
 * One hreflang alternate: the locale, and the path its variant lives at.
 *
 * The path travels with the language because variants do not always share one.
 * Every non-blog route does share it, which is why the derived block in
 * `<SEO />` can still build its set from a single `pathWithoutLang`.
 */
export interface SeoAlternate {
  lang: string;
  /** Path after the language prefix, e.g. `/blog/kiwicv-ursprung`. */
  pathWithoutLang: string;
}

/**
 * Metadata a route pushes up to the single `<SEO />` instance.
 *
 * Only one `<SEO />` is mounted, globally, so a page that needs values the
 * route alone cannot supply — a blog post's headline, a 404's `noindex` —
 * publishes them here instead of mounting a second Helmet. Two instances under
 * one `HelmetProvider` emitted two of every tag and the later mount lost.
 */
export interface SeoOverride {
  /**
   * The pathname this override was published for. `<SEO />` ignores an
   * override whose pathname is no longer current, so the value cannot outlive
   * its route in the gap between the old page's cleanup and the new page's
   * effect.
   */
  pathname: string;
  title?: string;
  description?: string;
  /** Path after the language prefix, e.g. `/blog/kiwicv-origin`. */
  pathWithoutLang?: string;
  /** Absolute URL. Falls back to the shared social image. */
  image?: string;
  noindex?: boolean;
  /**
   * Three states, and only three: omitted derives the 15-locale set from the
   * path, `false` suppresses the block for routes whose variants are not
   * derivable, and an array publishes a set the route resolved itself. `true`
   * is deliberately not in the union — it was inhabited by nothing and meant
   * exactly what omitting the field means.
   *
   * A blog post needs the array form: its translations are separate Sanity
   * documents whose slugs differ per language (`kiwicv-origin` /
   * `kiwicv-ursprung`), so the set cannot be built by prefixing one path with
   * each locale the way every other route's can.
   */
  alternates?: false | SeoAlternate[];
  /**
   * Language the canonical is built for, when it differs from the language of
   * the URL that was served.
   *
   * Only content that exists at more than one locale prefix needs this. A blog
   * post does: `getPosts` falls back to English for locales with no posts of
   * their own, and the overview links what it lists, so the same English
   * article is reachable under 13 other prefixes. Each of those views pins its
   * canonical to the post's own language instead of claiming to be an
   * independent copy.
   */
  canonicalLang?: string;
}

interface SeoStore {
  override: SeoOverride | null;
  setOverride: (override: SeoOverride) => void;
  clearOverride: (pathname: string) => void;
}

export const useSeoStore = create<SeoStore>()((set) => ({
  override: null,
  setOverride: (override) => set({ override }),
  clearOverride: (pathname) =>
    // A page unmounting after its successor published must not wipe the newer
    // value, so only clear what this route owns.
    set((state) => (state.override?.pathname === pathname ? { override: null } : state)),
}));
