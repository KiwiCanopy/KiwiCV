import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// An open-source fork copies `.env.example`, which leaves the project ID empty.
// The timeout covers the first, uncached transform of `@sanity/client`.
describe('sanity without a project ID', { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SANITY_PROJECT_ID', '');
    vi.stubEnv('VITE_SANITY_DATASET', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('imports without throwing', async () => {
    await expect(import('@/lib/sanity')).resolves.toBeDefined();
  });

  it('returns no content and never touches the network', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { getPosts, getPostBySlug, getTestimonials } = await import('@/lib/sanity');

    await expect(getPosts('de')).resolves.toEqual([]);
    await expect(getPostBySlug('any-slug')).resolves.toBeNull();
    await expect(getTestimonials()).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('builds an image URL without throwing', async () => {
    const { urlFor } = await import('@/lib/sanity');
    const image = {
      _type: 'image' as const,
      asset: { _ref: 'image-abc123-100x100-png', _type: 'reference' as const },
    };

    expect(() => urlFor(image).width(50).url()).not.toThrow();
  });
});
