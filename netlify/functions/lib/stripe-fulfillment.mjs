import { supabaseAdmin } from './supabase-admin.mjs';

/**
 * Handles the actual fulfillment logic using an atomic Supabase RPC.
 * This ensures that the payment logging and the pass extension happen in a single transaction.
 *
 * @param {Object} session - Stripe Checkout Session object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const fulfillOrder = async (session) => {
  const { userId, type, days } = session.metadata;
  const sessionId = session.id;

  // 1. Metadata Validation. `timepass` is the only fulfillment type; the
  // matching CHECK constraint on `processed_payments` would reject anything
  // else, so fail here with a readable message instead.
  if (!userId || type !== 'timepass' || !days) {
    const msg = 'Missing or unsupported metadata in session';
    console.error(`[Fulfillment] ${msg}:`, { userId, type, days });
    return { success: false, error: msg };
  }

  const fulfillmentValue = parseInt(days, 10);

  console.log(
    `[Fulfillment] Attempting atomic fulfillment for user ${userId} (${type}: ${fulfillmentValue})`,
  );

  // 2. Atomic RPC Call (Idempotency + Fulfillment)
  const { error } = await supabaseAdmin.rpc('fulfill_stripe_order', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_type: type,
    p_value: fulfillmentValue,
  });

  if (error) {
    console.error('[Fulfillment] RPC Error during fulfillment:', error.message);
    throw error; // Rethrow so the caller (webhook) can trigger a Stripe retry if needed
  }

  console.log(`[Fulfillment] Successfully processed payment session ${sessionId}`);
  return { success: true };
};
