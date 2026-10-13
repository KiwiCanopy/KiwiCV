import { useEffect, useMemo, useRef, useState } from 'react';

import { useNearViewport } from '@/hooks/useNearViewport';
import { useTranslation } from '@/hooks/useTranslation';
import { getIntrinsicSize } from '@/pages/Blog/utils/media';
import { cn } from '@/utils/cn';

/** Start buffering video this far before it scrolls into view. */
const PRELOAD_MARGIN = '600px 0px';

interface OptimizedMediaProps {
  src: string;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  caption?: string;
  variant?: 'hero' | 'article';
}

/**
 * OptimizedMedia Component
 *
 * Handles GIFs and Videos with pre-decoding and intersection observer logic.
 * Ensures smooth playback by triggering loads before the element enters the viewport.
 * Uses hardware-accelerated video tags where appropriate for GIF-like content.
 * Load and error state belong to one `src`: render it with `key={src}`.
 */
export function OptimizedMedia({
  src,
  alt,
  className,
  autoPlay = true,
  caption,
  variant = 'article',
}: OptimizedMediaProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isNear = useNearViewport(containerRef, { margin: PRELOAD_MARGIN, once: true });
  const isVisible = useNearViewport(containerRef);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const isVideo = src.match(/\.(mp4|webm|ogg|mov)$/i);

  const intrinsic = useMemo(() => getIntrinsicSize(src), [src]);

  // Instant check for cached media
  useEffect(() => {
    if (isVideo) {
      if (videoRef.current && videoRef.current.readyState >= 3) {
        setIsLoading(false);
      }
    } else {
      if (imgRef.current?.complete) {
        setIsLoading(false);
      }
    }
  }, [src, isVideo]);

  // Playback follows actual visibility, so a clip scrolled past stops decoding and one scrolled
  // back to resumes. Buffering starts 600px ahead so the clip is ready when it arrives.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isVisible) {
      video.pause();
      return;
    }
    if (autoPlay) {
      video.play()?.catch((err) => {
        // Auto-play might be blocked by browser policy until interaction
        console.debug('Auto-play prevented:', err);
      });
    }
  }, [isVisible, autoPlay]);

  const handleLoaded = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative mx-auto my-12 transition duration-700 ease-out',
        variant === 'hero' ? 'w-fit max-w-full' : 'w-full max-w-full sm:max-w-[50%]',
        isLoading ? 'scale-[0.99] blur-sm' : 'blur-0 scale-100',
        className,
      )}
    >
      {/* Premium Shimmer / Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-[2rem]">
          <div className="via-primary-strong/5 h-full w-full animate-pulse bg-gradient-to-r from-transparent to-transparent" />
        </div>
      )}

      {/* Video Rendering (MP4, WebM, etc.) */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          title={alt}
          muted
          loop
          playsInline
          preload={isNear ? 'auto' : 'metadata'}
          onLoadedData={handleLoaded}
          onError={handleError}
          className={cn(
            'relative z-10 mx-auto block h-auto rounded-[2rem] shadow-lg transition-opacity duration-700',
            variant === 'hero' ? 'max-h-[500px] w-auto max-w-full' : 'w-full',
          )}
        />
      ) : (
        /* Image/GIF Rendering */
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={intrinsic?.width}
          height={intrinsic?.height}
          /* The hero is the LCP candidate on a post, so it must not be lazy.
             Everything below it is off-screen by definition. */
          loading={variant === 'hero' ? 'eager' : 'lazy'}
          onLoad={handleLoaded}
          onError={handleError}
          decoding="async"
          className={cn(
            'relative z-10 mx-auto block h-auto rounded-[2rem] shadow-lg transition-all duration-700 hover:scale-[1.01]',
            variant === 'hero' ? 'max-h-[500px] w-auto max-w-full' : 'w-full',
          )}
        />
      )}

      {/* Caption Overlay */}
      {caption && !isLoading && !isError && (
        <div className="mt-2 flex justify-center px-4">
          <p className="text-muted-foreground max-w-[90%] text-center text-xs leading-relaxed font-medium tracking-tight italic">
            {caption}
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {isError && (
        <div className="bg-muted/20 flex h-48 flex-col items-center justify-center gap-3 rounded-[2rem] p-6 text-center">
          <div className="bg-destructive/10 text-destructive rounded-full p-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm font-bold">{t('blog.media_error')}</p>
        </div>
      )}
    </div>
  );
}
