import assert from 'node:assert/strict';
import test from 'node:test';

import {
  constructStripeWebhookEvent,
  getStripeWebhookSecrets,
} from '../../netlify/functions/lib/stripe-webhook-signature.js';

test('keeps the legacy secret valid when no KiwiCV endpoint is configured', () => {
  assert.deepEqual(getStripeWebhookSecrets({ STRIPE_WEBHOOK_SECRET: 'whsec_legacy' }), [
    'whsec_legacy',
  ]);
});

test('deduplicates matching legacy and KiwiCV secrets', () => {
  assert.deepEqual(
    getStripeWebhookSecrets({
      STRIPE_WEBHOOK_SECRET: 'whsec_shared',
      STRIPE_WEBHOOK_SECRET_KIWICV: 'whsec_shared',
    }),
    ['whsec_shared'],
  );
});

test('accepts a signature from the KiwiCV endpoint after the legacy secret fails', () => {
  const attemptedSecrets = [];
  const expectedEvent = { id: 'evt_kiwicv' };

  const event = constructStripeWebhookEvent({
    body: '{"id":"evt_kiwicv"}',
    signature: 'stripe-signature',
    secrets: ['whsec_legacy', 'whsec_kiwicv'],
    constructEvent: (_body, _signature, secret) => {
      attemptedSecrets.push(secret);
      if (secret === 'whsec_legacy') throw new Error('Signature mismatch');
      return expectedEvent;
    },
  });

  assert.equal(event, expectedEvent);
  assert.deepEqual(attemptedSecrets, ['whsec_legacy', 'whsec_kiwicv']);
});

test('rejects a signature that matches neither configured endpoint', () => {
  assert.throws(
    () =>
      constructStripeWebhookEvent({
        body: '{}',
        signature: 'invalid-signature',
        secrets: ['whsec_legacy', 'whsec_kiwicv'],
        constructEvent: () => {
          throw new Error('Signature mismatch');
        },
      }),
    /Signature mismatch/,
  );
});
