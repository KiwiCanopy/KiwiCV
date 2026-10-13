// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import type { SanityTestimonial } from '@/lib/sanity';
import { Pricing } from '@/pages/LandingPage/sections/Pricing';
import { Privacy } from '@/pages/LandingPage/sections/Privacy';
import { TestimonialPlacement } from '@/pages/LandingPage/testimonials/TestimonialQuote';
import {
  groupByClaim,
  resetTestimonialsForTests,
} from '@/pages/LandingPage/testimonials/testimonials';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getTestimonials = vi.hoisted(() => vi.fn());
const imageSources = vi.hoisted(() => [] as unknown[]);

vi.mock('@/lib/sanity', () => {
  // Records each builder call so the test can read the requested crop off the URL.
  const urlFor = (source: unknown) => {
    imageSources.push(source);
    const params: string[] = [];
    const chain = {
      width: (n: number) => (params.push(`w=${n}`), chain),
      height: (n: number) => (params.push(`h=${n}`), chain),
      fit: (v: string) => (params.push(`fit=${v}`), chain),
      auto: (v: string) => (params.push(`auto=${v}`), chain),
      url: () => `https://cdn.sanity.io/images/test/photo.png?${params.join('&')}`,
    };
    return chain;
  };
  return { getTestimonials, urlFor };
});

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, number>) =>
      vars ? `${key}:${vars.current}/${vars.total}` : key,
    language: 'en',
  }),
}));

vi.mock('@/pages/LandingPage/sections/pricing/usePricing', () => ({
  usePricing: () => ({ t: (key: string) => key, language: 'en' }),
}));
vi.mock('@/pages/LandingPage/sections/pricing/PricingPlans', () => ({ PassPlans: () => null }));

/** An observer the test fires by hand; jsdom has none and does no layout. */
const observers: Array<{
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  disconnected: boolean;
}> = [];
class ControlledObserver {
  record: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, options, disconnected: false };
    observers.push(this.record);
  }
  observe() {}
  disconnect() {
    this.record.disconnected = true;
  }
}

const scrollNear = async () => {
  await act(async () => {
    for (const { callback, disconnected } of observers) {
      if (!disconnected) {
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    }
  });
};

const doc = (overrides: Partial<SanityTestimonial> = {}): SanityTestimonial => ({
  _id: 'jane-pricing',
  // No final period, deliberately: the rendered text must not gain one.
  quote: 'Worth every cent , honestly  ',
  name: 'Jane Doe',
  credential: 'Product Designer | Example Co',
  photo: {
    _type: 'image',
    asset: { _ref: 'image-abc-800x800-png', _type: 'reference' },
    hotspot: { x: 0.4, y: 0.3, height: 0.5, width: 0.5 },
    crop: { top: 0.1, bottom: 0, left: 0, right: 0 },
    alt: 'Portrait of Jane Doe',
  },
  sourceUrl: 'https://example.com/posts/1',
  claim: ['pricing'],
  ...overrides,
});

beforeEach(() => {
  observers.length = 0;
  resetTestimonialsForTests();
  getTestimonials.mockReset();
  imageSources.length = 0;
  vi.stubGlobal('IntersectionObserver', ControlledObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const imageUrl = () => 'https://cdn.sanity.io/images/test/photo.png';

describe('groupByClaim', () => {
  it('keeps every valid entry per claim in query order, reading claim as an array', () => {
    const grouped = groupByClaim(
      [
        doc({ _id: 'a', claim: ['privacy'] }),
        doc({ _id: 'b', claim: ['pricing', 'privacy'] }),
        doc({ _id: 'c', claim: ['pricing'] }),
      ],
      imageUrl,
    );
    expect(grouped.privacy?.map((t) => t.id)).toEqual(['a', 'b']);
    expect(grouped.pricing?.map((t) => t.id)).toEqual(['b', 'c']);
  });

  it('places an entry tagged with both claims at both', () => {
    const grouped = groupByClaim([doc({ claim: ['pricing', 'privacy'] })], imageUrl);
    expect(grouped.pricing?.map((t) => t.id)).toEqual(['jane-pricing']);
    expect(grouped.privacy?.map((t) => t.id)).toEqual(['jane-pricing']);
  });

  it('skips an entry missing a required field', () => {
    const grouped = groupByClaim(
      [
        doc({ _id: 'no-alt', photo: { ...doc().photo!, alt: '' } }),
        doc({ _id: 'no-name', name: undefined }),
        doc({ _id: 'bad-url', sourceUrl: 'javascript:alert(1)' }),
        doc({ _id: 'string-claim', claim: 'pricing' as unknown as string[] }),
        doc({ _id: 'ok' }),
      ],
      imageUrl,
    );
    expect(grouped.pricing?.map((t) => t.id)).toEqual(['ok']);
  });
});

describe('TestimonialPlacement', () => {
  it('sends no request before the section nears the viewport', async () => {
    getTestimonials.mockResolvedValue([doc()]);
    render(<TestimonialPlacement claim="pricing" />);
    // The client arrives through a dynamic import, so a premature call lands a few ticks late.
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(getTestimonials).not.toHaveBeenCalled();
    expect(screen.queryByRole('figure')).toBeNull();
  });

  it('renders the stored quote byte-for-byte once near the viewport', async () => {
    getTestimonials.mockResolvedValue([doc()]);
    render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();

    const quote = document.querySelector('blockquote p');
    expect(quote?.textContent).toBe('Worth every cent , honestly  ');
    expect(quote?.closest('blockquote')?.getAttribute('lang')).toBe('en');
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Product Designer | Example Co')).toBeTruthy();
  });

  it('links the original post in a new tab and serves a cropped CDN photo', async () => {
    getTestimonials.mockResolvedValue([doc()]);
    render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();

    const link = screen.getByRole('link', { name: /landing\.testimonial\.source_link/ });
    expect(link.getAttribute('href')).toBe('https://example.com/posts/1');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');

    const img = screen.getByRole('img', { name: 'Portrait of Jane Doe' });
    expect(img.getAttribute('src')).toContain('w=56&h=56&fit=crop&auto=format');
    expect(img.getAttribute('srcset')).toContain('w=112&h=112&fit=crop&auto=format 2x');
    expect(img.getAttribute('width')).toBe('56');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('builds the photo from the whole image object, so hotspot and crop apply', async () => {
    getTestimonials.mockResolvedValue([doc()]);
    render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();

    const { alt: _alt, ...image } = doc().photo!;
    expect(imageSources).toEqual([image, image]);
  });

  it('skips an entry whose image the builder rejects, keeping the rest', () => {
    const throwing = (photo: { asset: { _ref: string } }) => {
      if (photo.asset._ref === 'broken') throw new Error('Malformed asset _ref');
      return 'https://cdn.sanity.io/images/test/photo.png';
    };
    const broken = doc({
      _id: 'broken',
      photo: { ...doc().photo!, asset: { _ref: 'broken', _type: 'reference' } },
    });
    expect(groupByClaim([broken, doc({ _id: 'ok' })], throwing).pricing?.map((t) => t.id)).toEqual([
      'ok',
    ]);
  });

  it('roots the observer on the scrolling ancestor, ahead of the fold', () => {
    getTestimonials.mockResolvedValue([]);
    // jsdom does no layout; this stands in for the shell's `<main>`, taller inside than out.
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperty(scroller, 'scrollHeight', { value: 2000 });
    Object.defineProperty(scroller, 'clientHeight', { value: 800 });
    document.body.append(scroller);
    render(<TestimonialPlacement claim="pricing" />, { container: scroller });

    const options = observers.at(-1)?.options;
    expect(options?.root).toBe(scroller);
    expect(options?.rootMargin).toBe('600px 0px');
    scroller.remove();
  });

  it('shares one request between both placements', async () => {
    getTestimonials.mockResolvedValue([
      doc({ _id: 'p', claim: ['pricing'] }),
      doc({ _id: 'q', claim: ['privacy'], quote: 'Refreshingly private' }),
    ]);
    render(
      <>
        <TestimonialPlacement claim="pricing" />
        <TestimonialPlacement claim="privacy" />
      </>,
    );
    await scrollNear();

    expect(getTestimonials).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('figure')).toHaveLength(2);
  });

  it.each([
    ['an empty result', () => getTestimonials.mockResolvedValue([])],
    ['a failed request', () => getTestimonials.mockRejectedValue(new Error('offline'))],
    [
      'a result with no entry for this claim',
      () => getTestimonials.mockResolvedValue([doc({ claim: ['privacy'] })]),
    ],
  ])('renders nothing, quietly, for %s', async (_label, arrange) => {
    arrange();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();

    expect(container.querySelector('figure')).toBeNull();
    expect(container.firstElementChild?.childElementCount).toBe(0);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});

describe('landing call sites', () => {
  it('places the pricing quote in the pricing section and the privacy quote in the privacy one', async () => {
    getTestimonials.mockResolvedValue([
      doc({ _id: 'p', claim: ['pricing'], quote: 'Pricing words' }),
      doc({ _id: 'q', claim: ['privacy'], quote: 'Privacy words' }),
    ]);
    const { container } = render(
      <MemoryRouter initialEntries={['/en/']}>
        <Privacy />
        <Pricing />
      </MemoryRouter>,
    );
    await scrollNear();

    expect(container.querySelector('#pricing blockquote p')?.textContent).toBe('Pricing words');
    expect(container.querySelector('#privacy blockquote p')?.textContent).toBe('Privacy words');
  });
});

describe('several testimonials per claim', () => {
  const three = () => [
    doc({ _id: 'a', quote: 'First words' }),
    doc({ _id: 'b', quote: 'Second words' }),
    doc({ _id: 'c', quote: 'Third words' }),
  ];
  const shownQuote = () => document.querySelector('blockquote p')?.textContent;

  it('shows no switcher for a single entry', async () => {
    getTestimonials.mockResolvedValue([doc()]);
    render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();

    expect(shownQuote()).toBe('Worth every cent , honestly  ');
    expect(screen.queryByRole('button', { name: 'landing.testimonial.next' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'landing.testimonial.previous' })).toBeNull();
    expect(document.querySelector('[aria-live]')).toBeNull();
  });

  it('opens on a random entry per visit', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    getTestimonials.mockResolvedValue(three());
    render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();

    expect(shownQuote()).toBe('Second words');
    expect(screen.getByText('landing.testimonial.position:2/3')).toBeTruthy();
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain('landing.testimonial.position_label:2/3');
    expect(live?.querySelector('blockquote')).toBeTruthy();
  });

  it('switches with previous and next, wrapping at both ends', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    getTestimonials.mockResolvedValue(three());
    render(<TestimonialPlacement claim="pricing" />);
    await scrollNear();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'landing.testimonial.previous' }));
    expect(shownQuote()).toBe('Third words');
    const next = screen.getByRole('button', { name: 'landing.testimonial.next' });
    await user.click(next);
    await user.click(next);
    expect(shownQuote()).toBe('Second words');
    expect(document.activeElement).toBe(next);
    expect(screen.getByText('landing.testimonial.position:2/3')).toBeTruthy();
    expect(getTestimonials).toHaveBeenCalledTimes(1);
  });
});
