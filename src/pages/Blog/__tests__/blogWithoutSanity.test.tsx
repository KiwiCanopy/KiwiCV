// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The real `@/lib/sanity`, unmocked, as a fork that copied `.env.example` loads it.
// The timeout covers the first, uncached transform of `@sanity/client`.
describe('blog routes without a Sanity project ID', { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SANITY_PROJECT_ID', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows the overview empty state', async () => {
    const { BlogOverview } = await import('@/pages/Blog/BlogOverview');
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <BlogOverview />
      </MemoryRouter>,
    );

    expect(await screen.findByText('No posts found.')).toBeTruthy();
  });

  it('shows the not-found page for a post', async () => {
    const { BlogPost } = await import('@/pages/Blog/BlogPost');
    render(
      <MemoryRouter initialEntries={['/blog/some-post']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'Post not found' })).toBeTruthy();
  });
});
