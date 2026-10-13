import { describeDbError, describeError } from '../describe-error.js';
import { AI_PRO_DAILY_LIMIT, PROMPT_VERSION, VERTEX_CONFIG } from './constants.js';
import { logUsageDebug } from './debug/debugLogger.js';

const { REGION, MODEL } = VERTEX_CONFIG;

async function reserveUsageSlot(supabase, { userId, requestType }) {
  const { data, error } = await supabase.rpc('reserve_ai_usage', {
    p_user_id: userId,
    p_limit: AI_PRO_DAILY_LIMIT,
    p_request_type: requestType,
  });

  if (error) {
    logUsageDebug(`ERROR: AI_USAGE_RESERVE_FAILED for user: ${userId}`, error);
    throw new Error(`AI_USAGE_RESERVE_FAILED: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const reservationId = row?.reservation_id || null;
  logUsageDebug(`Reservation for user ${userId}`, {
    requestType,
    reserved: Boolean(reservationId),
    proRequestsToday: Number(row?.pro_requests_today || 0),
  });
  return reservationId;
}

async function settleUsageRow(supabase, { reservationId, userId, usage, details, model }) {
  const { error } = await supabase
    .from('usage_logs')
    .update({
      tokens_input: usage.tokens_input,
      tokens_output: usage.tokens_output,
      model_used: model,
      details: { region: REGION, prompt_version: PROMPT_VERSION, ...details },
      pending_until: null,
    })
    .eq('id', reservationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`USAGE_LOG_INSERT_FAILED: ${error.message}`);
  }
}

async function releaseUsageSlot(supabase, { reservationId, userId }) {
  try {
    // Pending only: a settle that applied but lost its response stays billed.
    const { error } = await supabase
      .from('usage_logs')
      .delete()
      .eq('id', reservationId)
      .eq('user_id', userId)
      .not('pending_until', 'is', null);
    if (error) console.error('[Usage] Releasing a slot was rejected:', describeDbError(error));
  } catch (err) {
    console.error('[Usage] Releasing a slot failed:', describeError(err));
  }
}

/**
 * The allowance slots one job holds. One `usage_logs` row is one slot — the
 * count sums no column — reserved before the call it pays for, settled after
 * that call succeeds, released otherwise (`.claude/rules/database.md`).
 *
 * - `reserve(requestType)` → reservation id, or `null` when the day is spent;
 *   throws `AI_USAGE_RESERVE_FAILED`.
 * - `settle(id, { usage, details, model? })` → throws `USAGE_LOG_INSERT_FAILED`,
 *   and the slot stays held.
 * - `release(id)` and `releaseAll()` never throw; a failed release leaves the
 *   slot held until its reservation expires.
 */
export function createUsageHold(supabase, userId) {
  const held = new Set();
  const release = async (reservationId) => {
    held.delete(reservationId);
    await releaseUsageSlot(supabase, { reservationId, userId });
  };

  // Closures, not `this`: `releaseAll` must not throw even when passed unbound.
  return {
    async reserve(requestType) {
      const reservationId = await reserveUsageSlot(supabase, { userId, requestType });
      if (reservationId) held.add(reservationId);
      return reservationId;
    },
    async settle(reservationId, { usage, details, model = MODEL }) {
      await settleUsageRow(supabase, { reservationId, userId, usage, details, model });
      held.delete(reservationId);
    },
    release,
    async releaseAll() {
      for (const reservationId of [...held]) await release(reservationId);
    },
  };
}
