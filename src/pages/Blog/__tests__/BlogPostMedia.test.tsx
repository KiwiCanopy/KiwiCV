// @vitest-environment jsdom
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';

import type { SanityImage, SanityPost } from '@/lib/sanity';
import { BlogPost } from '@/pages/Blog/BlogPost';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/useLanguage', () => ({ useLanguage: () => 'en' }));
vi.mock('@/hooks/useSeoOverride', () => ({ useSeoOverride: () => {} }));
vi.mock('@/services/analytics', () => ({
  analytics: { track: vi.fn() },
  ANALYTICS_EVENTS: {},
}));

const post = (slug: string): SanityPost => ({
  title: slug,
  slug,
  teaser: '',
  publishedAt: '2026-01-01',
  language: 'en',
  content: `![inline](/${slug}-inline.mp4)`,
  // The asset ref doubles as the URL, through the `urlFor` mock below.
  mainImage: { _type: 'image', asset: { _ref: `/${slug}.mp4`, _type: 'reference' } },
});

vi.mock('@/lib/sanity', () => ({
  getPostBySlug: async (slug: string) => post(slug),
  urlFor: (image: SanityImage) => ({ width: () => ({ url: () => image.asset._ref }) }),
}));

/** An observer the test fires by hand; jsdom has none and does no layout. */
const observers: Array<{
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  targets: Element[];
  disconnected: boolean;
}> = [];
class ControlledObserver {
  record: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, options, targets: [], disconnected: false };
    observers.push(this.record);
  }
  observe(target: Element) {
    this.record.targets.push(target);
  }
  disconnect() {
    this.record.disconnected = true;
  }
}

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', ControlledObserver);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BlogPost media', () => {
  it('starts each clip over when the next post swaps its src in place', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/blog/first']}>
        <Link to="/blog/second">next post</Link>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { level: 1, name: 'first' });
    for (const video of container.querySelectorAll('video')) fireEvent.error(video);
    expect(screen.queryAllByText('blog.media_error')).toHaveLength(2);

    fireEvent.click(screen.getByText('next post'));
    await screen.findByRole('heading', { level: 1, name: 'second' });
    const videos = [...container.querySelectorAll('video')];
    expect(videos.map((v) => v.getAttribute('src'))).toEqual(['/second.mp4', '/second-inline.mp4']);

    // Hero and inline clip alike: no stale error, loading again, observed afresh.
    expect(screen.queryAllByText('blog.media_error')).toEqual([]);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(2);
    expect(videos.map((v) => v.getAttribute('preload'))).toEqual(['metadata', 'metadata']);
    const live = observers.filter((o) => !o.disconnected);
    expect(live.map((o) => o.targets[0])).toEqual(
      videos.flatMap((v) => [v.parentElement, v.parentElement]),
    );
  });
});
