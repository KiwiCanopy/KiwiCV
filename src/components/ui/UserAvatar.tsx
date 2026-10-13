import React, { useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { clearAvatarCache, getCachedAvatar, setCachedAvatar } from '@/utils/avatar-cache';
import { cn } from '@/utils/cn';
import { encodeOpaqueJpeg } from '@/utils/image';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  url?: string | null;
  name?: string;
  className?: string; // Classes for the image or fallback container
}

/**
 * Load stages, tried in order until one succeeds:
 * - 'cached': Base64 copy from localStorage (instant, offline-safe)
 * - 'cors':   remote URL with crossOrigin so a successful load can be cached
 * - 'plain':  remote URL without crossOrigin (can't be cached, but still displays
 *             when the CDN rejects CORS requests, e.g. Google avatar 429s)
 * - 'none':   all attempts failed, show the fallback icon
 */
type Stage = 'cached' | 'cors' | 'plain' | 'none';

interface Attempt {
  stage: Stage;
  src: string | null;
}

function initialAttempt(url?: string | null): Attempt {
  if (!url) return { stage: 'none', src: null };
  const cached = getCachedAvatar(url);
  if (cached) return { stage: 'cached', src: cached };
  return { stage: 'cors', src: url };
}

/**
 * A "smart" avatar component that caches remote images in localStorage as Base64 strings.
 * This prevents repeated network requests to external CDNs and avoids 429 errors.
 * Falls back through cached → CORS → non-CORS loading before giving up.
 */
export function UserAvatar({ url, name, className }: UserAvatarProps) {
  const { t } = useTranslation();
  const [prevUrl, setPrevUrl] = useState(url);
  const [attempt, setAttempt] = useState<Attempt>(() => initialAttempt(url));

  // Sync state with url transitions
  if (url !== prevUrl) {
    setPrevUrl(url);
    setAttempt(initialAttempt(url));
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;

    // Only CORS-clean loads can be drawn to a canvas without tainting it,
    // and data URLs don't need caching.
    if (!url || attempt.stage !== 'cors' || url.startsWith('data:')) return;

    try {
      // Limit storage size to 128x128 as it's enough for UI components
      const size = 128;
      // Draw image to canvas (resizing it in the process) as a compressed JPEG data URL
      const base64 = encodeOpaqueJpeg(
        size,
        size,
        (ctx) => ctx.drawImage(img, 0, 0, size, size),
        0.8,
      );
      if (base64) setCachedAvatar(url, base64);
    } catch (_err) {
      // This can happen if the remote server doesn't support CORS or doesn't return correct headers
      // We silently fail; the image is already displayed, we just can't cache it
    }
  };

  const handleError = () => {
    switch (attempt.stage) {
      case 'cached':
        // Cached copy is corrupt: drop it and retry from the network
        clearAvatarCache();
        setAttempt({ stage: 'cors', src: url ?? null });
        break;
      case 'cors':
        // CDN rejected the CORS request: retry without crossOrigin so the
        // image still renders (we just can't cache it)
        setAttempt({ stage: 'plain', src: url ?? null });
        break;
      default:
        setAttempt({ stage: 'none', src: null });
    }
  };

  // Error or No URL: Show fallback icon
  if (!attempt.src || attempt.stage === 'none') {
    return (
      <div className={cn('flex h-full w-full items-center justify-center', className)}>
        <UserIcon className="h-1/2 w-1/2 opacity-60" />
      </div>
    );
  }

  // Normal image rendering. The key forces a remount between stages: changing
  // only the crossOrigin attribute would not re-trigger the load for the same src.
  return (
    <img
      key={attempt.stage}
      src={attempt.src}
      alt={name || t('common.avatar_alt')}
      className={cn('h-full w-full object-cover', className)}
      crossOrigin={attempt.stage === 'cors' ? 'anonymous' : undefined}
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
