export const getStripeWebhookSecrets = (environment = process.env) => {
  const configuredSecrets = [
    environment.STRIPE_WEBHOOK_SECRET,
    environment.STRIPE_WEBHOOK_SECRET_KIWICV,
  ];

  return [...new Set(configuredSecrets.map((secret) => secret?.trim()).filter(Boolean))];
};

export const constructStripeWebhookEvent = ({ body, signature, secrets, constructEvent }) => {
  let verificationError;

  for (const secret of secrets) {
    try {
      return constructEvent(body, signature, secret);
    } catch (error) {
      verificationError = error;
    }
  }

  throw verificationError || new Error('No Stripe webhook signing secret is configured.');
};
