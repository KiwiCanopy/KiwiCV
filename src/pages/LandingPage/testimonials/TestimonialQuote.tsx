import { useRef, useState } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PHOTO_SIZE,
  type Testimonial,
  type TestimonialClaim,
} from '@/pages/LandingPage/testimonials/testimonials';
import { useTestimonials } from '@/pages/LandingPage/testimonials/useTestimonials';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialQuoteProps {
  testimonial: Testimonial;
}

/**
 * An attributed pull quote. The quote, name and credential render exactly as stored, in English
 * in every locale.
 */
export function TestimonialQuote({ testimonial }: TestimonialQuoteProps) {
  const { t } = useTranslation();

  return (
    <figure aria-label={t('landing.testimonial.label')}>
      <blockquote
        lang="en"
        className="text-foreground relative isolate text-lg leading-8 font-medium text-pretty sm:text-xl"
      >
        {/* The opening mark is a decorative watermark behind the first words; the stored text
            is never edited to carry quotation marks. */}
        <span
          aria-hidden="true"
          className="text-primary-strong pointer-events-none absolute -top-[0.2em] -left-[0.15em] -z-10 font-[Georgia,'Times_New_Roman',serif] text-[7rem] leading-none opacity-25 select-none sm:text-[9rem] dark:opacity-20"
        >
          {'\u201C'}
        </span>
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-4">
        <img
          src={testimonial.photo.src}
          srcSet={testimonial.photo.srcSet}
          alt={testimonial.photo.alt}
          width={PHOTO_SIZE}
          height={PHOTO_SIZE}
          loading="lazy"
          decoding="async"
          style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
          className="bg-secondary shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 text-sm leading-5">
          <p className="text-foreground font-semibold">{testimonial.name}</p>
          <p lang="en" className="text-muted-foreground">
            {testimonial.credential}
          </p>
          <a
            href={testimonial.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-strong decoration-mist mt-1 inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4"
          >
            {t('landing.testimonial.source_link')}{' '}
            <span className="sr-only">{t('landing.testimonial.new_tab')}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </figcaption>
    </figure>
  );
}

interface TestimonialPlacementProps {
  claim: TestimonialClaim;
  /** Applied only once a quote exists, so an absent quote leaves no spacing behind. */
  className?: string;
}

/**
 * The published testimonials for `claim`: one at a time, opening on a random one per visit, with
 * a previous/next switcher only when there is more than one. Nothing at all until there is one.
 */
export function TestimonialPlacement({ claim, className }: TestimonialPlacementProps) {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLDivElement>(null);
  const { testimonials, startIndex } = useTestimonials(claim, anchorRef);
  const [step, setStep] = useState(0);

  const total = testimonials.length;
  const index = total > 0 ? (((startIndex + step) % total) + total) % total : 0;
  const testimonial = testimonials[index];

  return (
    // An empty block, not `display: contents`: the observer needs a box to watch.
    <div ref={anchorRef}>
      {testimonial && (
        <div className={className}>
          {/* Above the quote, so quotes of different lengths never move the buttons. */}
          {total > 1 && (
            <div className="mb-4 flex items-center justify-end gap-1">
              <IconButton
                variant="quiet"
                className="rounded-full"
                label={t('landing.testimonial.previous')}
                onClick={() => setStep((current) => current - 1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </IconButton>
              <span
                aria-hidden="true"
                className="text-muted-foreground min-w-12 text-center text-sm tabular-nums"
              >
                {t('landing.testimonial.position', { current: index + 1, total })}
              </span>
              <IconButton
                variant="quiet"
                className="rounded-full"
                label={t('landing.testimonial.next')}
                onClick={() => setStep((current) => current + 1)}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            </div>
          )}
          {/* Polite, so a switch reads the new quote out; inserted with its content, so the
              first quote arriving is not announced over whatever the visitor is reading. */}
          <div aria-live={total > 1 ? 'polite' : undefined}>
            {total > 1 && (
              <span className="sr-only">
                {t('landing.testimonial.position_label', { current: index + 1, total })}
              </span>
            )}
            <TestimonialQuote testimonial={testimonial} />
          </div>
        </div>
      )}
    </div>
  );
}
