/**
 * Detects if the current request is from a known crawler or social bot.
 * This is used to bypass mandatory landing page redirects for SEO and social previews.
 */
export const isBot = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent;

  // Specific list to avoid catching normal users while covering all major crawlers/social scrapers
  return /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu|duckduckbot|slurp|whatsapp|telegram|linkedin|facebookexternalhit|twitterbot/i.test(
    ua,
  );
};
