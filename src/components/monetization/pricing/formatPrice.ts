/**
 * A Pass price in euro cents, written the viewer's way ("13,99 €", "€13.99").
 * The amounts live once, in `catalog.tsx`; Stripe charges by lookup key.
 */
export function formatPrice(cents: number, locale: string): string {
  // `narrowSymbol`: uk's CLDR symbol for EUR is the letters "EUR".
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'narrowSymbol',
  }).format(cents / 100);
}

/**
 * The price divided by the Pass length, in the same format. A comparison
 * between KiwiCV's own Passes, never a crossed-out former price (PAngV §11).
 */
export function formatPerDay(cents: number, days: number, locale: string): string | null {
  if (days <= 0) return null;
  return formatPrice(Math.round(cents / days), locale);
}
