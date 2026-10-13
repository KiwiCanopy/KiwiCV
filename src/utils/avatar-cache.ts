const AVATAR_CACHE_PREFIX = 'cv_canvas_avatar_';

/**
 * Retrieves a cached Base64 avatar from localStorage based on the original URL.
 */
export function getCachedAvatar(url: string): string | null {
  if (!url) return null;
  try {
    // We use a shortened base64 of the URL as the key
    const hash = btoa(encodeURIComponent(url)).substring(0, 32);
    return localStorage.getItem(`${AVATAR_CACHE_PREFIX}${hash}`);
  } catch {
    return null;
  }
}

/**
 * Stores a Base64 avatar in localStorage.
 * Also cleans up previous cached avatars to keep localStorage tidy.
 */
export function setCachedAvatar(url: string, base64: string): void {
  if (!url || !base64) return;
  try {
    const hash = btoa(encodeURIComponent(url)).substring(0, 32);

    // Cleanup: Remove any existing cached avatars to avoid filling up localStorage
    // Since we usually only care about the current user's profile picture.
    Object.keys(localStorage)
      .filter((key) => key.startsWith(AVATAR_CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));

    localStorage.setItem(`${AVATAR_CACHE_PREFIX}${hash}`, base64);
  } catch (_e) {
    // If localStorage is full, we silently fail but don't crash
  }
}

/**
 * Clears all cached avatars.
 */
export function clearAvatarCache(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(AVATAR_CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore
  }
}
