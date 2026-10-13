import Stripe from 'stripe';

import { BRAND_ORIGIN } from './lib/brand-config.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error(
    '[Create Checkout] Configuration Error: Missing STRIPE_SECRET_KEY environment variable.',
  );
}
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    console.warn('[Create Checkout] Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { lookupKey, userId, returnPath } = JSON.parse(event.body);

    if (!lookupKey || !userId) {
      console.warn(
        '[Create Checkout] Missing parameters. lookupKey:',
        lookupKey,
        'userId:',
        userId,
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing lookupKey or userId' }),
      };
    }

    // fallback if no returnPath is provided
    const baseReturnPath = returnPath || '/account';

    // Identify current price from Lookup Key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      console.warn('[Create Checkout] Price not found for lookup key:', lookupKey);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Price not found for lookup key' }),
      };
    }

    const price = prices.data[0];

    // Determine metadata based on lookup key (robust strategy as recommended).
    // Time passes are the only product; an unrecognised key is rejected here
    // rather than creating a session that fulfillment could never complete.
    if (!lookupKey.startsWith('pro_')) {
      console.warn('[Create Checkout] Unsupported lookup key:', lookupKey);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unsupported lookup key' }),
      };
    }

    const metadata = {
      userId,
      type: 'timepass',
      days: lookupKey.split('_')[1],
    };

    // Helper to append params to returnPath
    const constructUrl = (path, params) => {
      // 1. Determine Base URL dynamically
      // We prioritize origin/referer so that deploy previews and custom domains work
      let baseUrl = event.headers.origin || event.headers.referer;

      if (baseUrl) {
        // Strip trailing slash if present to avoid double slashes
        baseUrl = baseUrl.replace(/\/$/, '');
        // If it's a referer, it might have the full path, we only want the origin
        try {
          const urlObj = new URL(baseUrl);
          baseUrl = urlObj.origin;
        } catch (e) {
          // fallback if URL parsing fails
        }
      }

      // 2. Final fallback to process.env.URL if headers are missing
      if (!baseUrl || baseUrl === 'null') {
        baseUrl = process.env.URL || BRAND_ORIGIN;
      }

      const separator = path.includes('?') ? '&' : '?';
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;

      return `${baseUrl}${normalizedPath}${separator}${params}`;
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      // Metadata on the session itself and also passed to the payment intent/line items if needed
      // But mainly we fetch it from the Price object or Session in the webhook.
      // Stripe Checkout Sessions also have metadata.
      metadata: metadata,
      success_url: constructUrl(
        baseReturnPath,
        'session_id={CHECKOUT_SESSION_ID}&success=true&type=passes',
      ),
      cancel_url: constructUrl(baseReturnPath, 'canceled=true'),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
