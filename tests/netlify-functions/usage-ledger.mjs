/**
 * `usage_logs` and `reserve_ai_usage` as the workers reach them over PostgREST,
 * for suites that stub `fetch`. Not a suite: the name does not match `*.test.mjs`.
 *
 * A reservation is a pending row, counted at once; a PATCH that clears
 * `pending_until` settles it; a DELETE removes only a pending one. Each
 * request is handled to completion before the next, which is the atomicity
 * the advisory lock gives the real function — so what a suite proves with it
 * is that the worker asks for its slot before the call it pays for.
 */
import { AI_PRO_DAILY_LIMIT } from '../../netlify/functions/lib/ai/constants.js';

const reservationId = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const eqParam = (url, name) => new URL(url).searchParams.get(name)?.replace(/^eq\./, '') ?? null;

/**
 * @param {{ requestsToday?: number, failSettleFor?: string | null, loseSettleFor?: string | null }} [options]
 *   `requestsToday` settled rows already on the day; `failSettleFor` a
 *   `request_type` whose settling PATCH answers 503 unapplied; `loseSettleFor`
 *   one whose PATCH applies and then answers 503, a response lost in transit.
 */
export function usageLedger({
  requestsToday = 0,
  failSettleFor = null,
  loseSettleFor = null,
} = {}) {
  /** Rows this run wrote. `pending` until settled. */
  const rows = [];
  let issued = 0;

  const counted = () => requestsToday + rows.length;

  const ledger = {
    rows,
    reservations: 0,
    refusals: 0,
    /** Settled rows, in the shape the workers' old post-success insert had. */
    billed: () =>
      rows
        .filter((row) => !row.pending)
        .map((row) => {
          const copy = { ...row };
          delete copy.pending;
          delete copy.id;
          return copy;
        }),
    /** Rows still holding a slot unsettled. */
    held: () => rows.filter((row) => row.pending),

    /**
     * Answers a `usage_logs` or `reserve_ai_usage` request as `[status, body]`,
     * or `null` for anything else.
     */
    respond(url, method, body) {
      if (url.includes('/rest/v1/rpc/reserve_ai_usage')) {
        const limit = body?.p_limit ?? AI_PRO_DAILY_LIMIT;
        if (counted() >= limit) {
          ledger.refusals += 1;
          return [200, [{ reservation_id: null, pro_requests_today: counted() }]];
        }
        issued += 1;
        ledger.reservations += 1;
        rows.push({
          id: reservationId(issued),
          user_id: body.p_user_id,
          request_type: body.p_request_type,
          package_used: 'pro',
          pending: true,
        });
        return [200, [{ reservation_id: reservationId(issued), pro_requests_today: counted() }]];
      }

      if (!url.includes('/rest/v1/usage_logs')) return null;
      const row = rows.find(
        (entry) => entry.id === eqParam(url, 'id') && entry.user_id === eqParam(url, 'user_id'),
      );

      if (method === 'PATCH') {
        if (row && failSettleFor && row.request_type === failSettleFor) {
          return [503, { message: 'service unavailable' }];
        }
        if (row) {
          const { pending_until: pendingUntil, ...fields } = body;
          Object.assign(row, fields, { pending: pendingUntil !== null && row.pending });
        }
        if (row && loseSettleFor && row.request_type === loseSettleFor) {
          return [503, { message: 'upstream timed out' }];
        }
        return [204, null];
      }
      if (method === 'DELETE') {
        const onlyPending = new URL(url).searchParams.get('pending_until') === 'not.is.null';
        if (row && (row.pending || !onlyPending)) rows.splice(rows.indexOf(row), 1);
        return [204, null];
      }
      return [405, { message: `unexpected ${method} on usage_logs` }];
    },
  };

  return ledger;
}
