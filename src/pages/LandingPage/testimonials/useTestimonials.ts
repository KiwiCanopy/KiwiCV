import { type RefObject, useEffect, useState } from 'react';

import { useNearViewport } from '@/hooks/useNearViewport';
import {
  type Testimonial,
  type TestimonialClaim,
  loadTestimonials,
} from '@/pages/LandingPage/testimonials/testimonials';

/** Far enough ahead that the quote has usually arrived before the visitor scrolls to it. */
const NEAR_VIEWPORT_MARGIN = '600px 0px';

export interface ClaimTestimonials {
  testimonials: Testimonial[];
  /** Picked at random once per page load, so each visit can open on a different quote. */
  startIndex: number;
}

const NONE: ClaimTestimonials = { testimonials: [], startIndex: 0 };

/**
 * The testimonials for `claim`, fetched only once `anchorRef` comes near the viewport — a
 * visitor who never scrolls there sends no request to Sanity. Empty until then, and for good
 * when the fetch fails or holds nothing for this claim.
 */
export function useTestimonials(
  claim: TestimonialClaim,
  anchorRef: RefObject<HTMLElement | null>,
): ClaimTestimonials {
  const [state, setState] = useState<ClaimTestimonials>(NONE);
  const near = useNearViewport(anchorRef, { margin: NEAR_VIEWPORT_MARGIN, once: true });

  useEffect(() => {
    if (!near) return;

    let active = true;
    void loadTestimonials().then((byClaim) => {
      const testimonials = byClaim[claim] ?? [];
      if (active && testimonials.length > 0) {
        setState({
          testimonials,
          startIndex: Math.floor(Math.random() * testimonials.length),
        });
      }
    });

    return () => {
      active = false;
    };
  }, [near, claim]);

  return state;
}
