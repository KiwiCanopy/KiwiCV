import Stripe from 'stripe';

import { fulfillOrder } from './lib/stripe-fulfillment.mjs';
import { supabaseAdmin } from './lib/supabase-admin.mjs';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error(
    '[Verify Session] Configuration Error: Missing STRIPE_SECRET_KEY environment variable.',
  );
}
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const handler = async (event) => {
  // 1. Method Validation
  if (event.httpMethod !== 'POST') {
    console.warn('[Verify Session] Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { sessionId } = JSON.parse(event.body || '{}');

    if (!sessionId) {
      console.warn('[Verify Session] Missing sessionId in request body.');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing sessionId' }) };
    }

    // 2. Authentication (Optional but recommended for security)
    const authHeader = event.headers.authorization;
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    console.log(`[Verify Session] Checking session ${sessionId} for user ${userId || 'anonymous'}`);

    // 3. Fetch Session from Stripe (Source of Truth)
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      console.warn('[Verify Session] Session not found in Stripe:', sessionId);
      return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) };
    }

    // 4. Verification Logic
    // a) Payment status must be 'paid'
    if (session.payment_status !== 'paid') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          status: session.payment_status,
          message: 'Payment not yet confirmed by Stripe.',
        }),
      };
    }

    // b) Security: Match session metadata with current user
    // We only enforce this if userId is available. For anonymous checkouts (if allowed),
    // we rely on the metadata itself.
    const sessionUserId = session.metadata?.userId;
    if (userId && sessionUserId && userId !== sessionUserId) {
      console.warn(
        `[Verify Session] Security Alert: Session user (${sessionUserId}) does not match current user (${userId})`,
      );
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Unauthorized: Session belongs to another user.' }),
      };
    }

    // 5. Trigger Fulfillment (Idempotent)
    console.log(`[Verify Session] Session ${sessionId} is PAID. Triggering fulfillment...`);
    const result = await fulfillOrder(session);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: 'Order fulfilled successfully.',
        type: session.metadata?.type,
      }),
    };
  } catch (error) {
    console.error('[Verify Session] Error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
