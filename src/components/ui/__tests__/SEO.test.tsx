// @vitest-environment jsdom
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SEO } from '@/components/ui/SEO';
import { useSeoOverride } from '@/hooks/useSeoOverride';
import { useSeoStore } from '@/store/ui/useSeoStore';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ORIGIN = 'https://kiwicv.kiwicanopy.com';

const head = () => ({
  titles: [...document.querySelectorAll('title')].map((node) => node.textContent),
  canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map((node) =>
    node.getAttribute('href'),
  ),
  alternates: [...document.querySelectorAll('link[rel="alternate"]')].map((node) => ({
    hrefLang: node.getAttribute('hreflang'),
    href: node.getAttribute('href'),
  })),
  robots: [...document.querySelectorAll('meta[name="robots"]')].map((node) =>
    node.getAttribute('content'),
  ),
  ogTitle: [...document.querySelectorAll('meta[property="og:title"]')].map((node) =>
    node.getAttribute('content'),
  ),
  ogImage: [...document.querySelectorAll('meta[property="og:image"]')].map((node) =>
    node.getAttribute('content'),
  ),
  description: [...document.querySelectorAll('meta[name="description"]')].map((node) =>
    node.getAttribute('content'),
  ),
});

/** Stands in for a page that publishes its own metadata, as BlogPost does. */
function PublishingPage({ value }: { value: Parameters<typeof useSeoOverride>[0] }) {
  useSeoOverride(value);
  return null;
}

function renderAt(path: string, page?: React.ReactNode) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <SEO />
        <Routes>
          <Route path="/:lang/*" element={page ?? null} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('SEO', () => {
  beforeEach(() => {
    useSeoStore.setState({ override: null });
  });

  afterEach(() => {
    document.head.querySelectorAll('[data-rh]').forEach((node) => node.remove());
  });

  it('emits the localized seo.*.title, not the common.pages nav label', async () => {
    renderAt('/');

    await waitFor(() => {
      expect(head().titles).toEqual(['KiwiCV - Your Path to the Job Interview | Resume Builder']);
    });
  });

  it('serves English unprefixed and prefixes every other locale', async () => {
    renderAt('/blog');

    await waitFor(() => {
      const { canonicals, alternates } = head();
      expect(canonicals).toEqual([`${ORIGIN}/blog`]);
      // x-default plus all 15 locales. English carries no prefix; the rest do.
      expect(alternates).toHaveLength(16);
      expect(alternates[0]).toEqual({ hrefLang: 'x-default', href: `${ORIGIN}/blog` });
      expect(alternates).toContainEqual({ hrefLang: 'en', href: `${ORIGIN}/blog` });
      expect(alternates).toContainEqual({ hrefLang: 'de', href: `${ORIGIN}/de/blog` });
    });
  });

  it('emits exactly one of every tag when a page publishes an override', async () => {
    renderAt(
      '/blog/kiwicv-origin',
      <PublishingPage
        value={{
          title: 'How Hundreds of Rejections Became a Mission | KiwiCV Blog',
          description: 'The story behind the editor.',
          pathWithoutLang: '/blog/kiwicv-origin',
          image: 'https://cdn.sanity.io/images/post.jpg',
          alternates: false,
        }}
      />,
    );

    await waitFor(() => {
      const { titles, canonicals, alternates, ogTitle, ogImage, description } = head();
      expect(titles).toEqual(['How Hundreds of Rejections Became a Mission | KiwiCV Blog']);
      expect(canonicals).toEqual([`${ORIGIN}/blog/kiwicv-origin`]);
      expect(ogTitle).toEqual(['How Hundreds of Rejections Became a Mission | KiwiCV Blog']);
      expect(ogImage).toEqual(['https://cdn.sanity.io/images/post.jpg']);
      expect(description).toEqual(['The story behind the editor.']);
      // A fallback view suppresses the set because it canonicalizes elsewhere,
      // not because no set exists — see the two cases below.
      expect(alternates).toEqual([]);
    });
  });

  it('publishes an explicit alternate set rather than deriving one per locale', async () => {
    // A blog post's variants have unrelated slugs, so the set cannot be built by
    // prefixing one path with each locale — and it names only the two languages
    // that exist, never the 15-locale registry.
    renderAt(
      '/blog/kiwicv-origin',
      <PublishingPage
        value={{
          pathWithoutLang: '/blog/kiwicv-origin',
          canonicalLang: 'en',
          alternates: [
            { lang: 'en', pathWithoutLang: '/blog/kiwicv-origin' },
            { lang: 'de', pathWithoutLang: '/blog/kiwicv-ursprung' },
          ],
        }}
      />,
    );

    await waitFor(() => {
      const { alternates } = head();
      expect(alternates).toHaveLength(3);
      expect(alternates).toContainEqual({ hrefLang: 'en', href: `${ORIGIN}/blog/kiwicv-origin` });
      expect(alternates).toContainEqual({
        hrefLang: 'de',
        href: `${ORIGIN}/de/blog/kiwicv-ursprung`,
      });
      // x-default names the default-language member of the set.
      expect(alternates).toContainEqual({
        hrefLang: 'x-default',
        href: `${ORIGIN}/blog/kiwicv-origin`,
      });
      // Reciprocity: the set contains the page publishing it.
      expect(alternates.map((a) => a.href)).toContain(`${ORIGIN}/blog/kiwicv-origin`);
    });
  });

  it('pins the canonical to the content language on a cross-locale fallback view', async () => {
    // `/fr/blog/<en-slug>` serves the English article, because `getPosts` falls
    // back to English for locales with no posts. It must canonicalize to the
    // English URL instead of claiming to be an independent copy, and publish no
    // hreflang, since a set on a non-canonical page is ignored.
    renderAt(
      '/fr/blog/kiwicv-origin',
      <PublishingPage
        value={{
          pathWithoutLang: '/blog/kiwicv-origin',
          canonicalLang: 'en',
          alternates: false,
        }}
      />,
    );

    await waitFor(() => {
      const { canonicals, alternates } = head();
      expect(canonicals).toEqual([`${ORIGIN}/blog/kiwicv-origin`]);
      expect(canonicals).not.toContain(`${ORIGIN}/fr/blog/kiwicv-origin`);
      expect(alternates).toEqual([]);
    });
  });

  it('emits robots noindex only when the route asks for it', async () => {
    const { unmount } = renderAt(
      '/nope',
      <PublishingPage value={{ title: 'Page not found', noindex: true, alternates: false }} />,
    );

    await waitFor(() => {
      expect(head().robots).toEqual(['noindex, follow']);
    });

    unmount();
    useSeoStore.setState({ override: null });
    renderAt('/');

    await waitFor(() => {
      expect(head().robots).toEqual([]);
    });
  });

  it('ignores an override published for a different path', async () => {
    useSeoStore.setState({
      override: { pathname: '/blog/some-other-post', title: 'A stale title' },
    });

    renderAt('/');

    await waitFor(() => {
      expect(head().titles).toEqual(['KiwiCV - Your Path to the Job Interview | Resume Builder']);
    });
  });
});
