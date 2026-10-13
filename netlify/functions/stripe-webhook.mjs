import Stripe from 'stripe';

import { fulfillOrder } from './lib/stripe-fulfillment.mjs';
import {
  constructStripeWebhookEvent,
  getStripeWebhookSecrets,
} from './lib/stripe-webhook-signature.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRETS = getStripeWebhookSecrets();

if (!STRIPE_SECRET_KEY || STRIPE_WEBHOOK_SECRETS.length === 0) {
  console.error(
    '[Stripe Webhook] Configuration Error: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET environment variables.',
  );
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    console.warn('[Stripe Webhook] Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!STRIPE_SECRET_KEY || STRIPE_WEBHOOK_SECRETS.length === 0) {
    console.error('[Stripe Webhook] Configuration Error: Webhook secrets are unavailable.');
    return { statusCode: 500, body: 'Internal Server Error' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = constructStripeWebhookEvent({
      body: event.body,
      signature: sig,
      secrets: STRIPE_WEBHOOK_SECRETS,
      constructEvent: (body, signature, secret) =>
        stripe.webhooks.constructEvent(body, signature, secret),
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const session = stripeEvent.data.object;

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        // Only fulfill if the payment is already 'paid'
        if (session.payment_status === 'paid') {
          await fulfillOrder(session);
        } else {
          console.log(
            `[Stripe Webhook] Session completed but payment pending. Waiting for async event.`,
          );
        }
        break;

      case 'checkout.session.async_payment_succeeded':
        await fulfillOrder(session);
        break;

      case 'checkout.session.async_payment_failed':
        console.warn(`[Stripe Webhook] Async payment failed for session ${session.id}`);
        // Optional: Notify the user via email here if needed
        break;

      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error('[Stripe Webhook] Error processing event:', err.message);
    return { statusCode: 500, body: `Internal Server Error: ${err.message}` };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
