export type CharCapZone = 'ok' | 'near' | 'full';

/**
 * `near` from 90% of the cap, `full` at it — the one threshold `CharCounter`
 * colours by and any cap announcement speaks at.
 */
export const charCapZone = (length: number, limit: number): CharCapZone =>
  length >= limit ? 'full' : length >= limit * 0.9 ? 'near' : 'ok';
