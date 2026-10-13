/**
 * Purchase Service for KiwiCV
 * Handles communication with Netlify functions for Stripe Checkout.
 */

export const purchaseService = {
  /**
   * Initiates a purchase by calling the create-checkout Netlify function.
   * Redirects the user to the Stripe Checkout URL.
   */
  async purchasePackage(lookupKey: string, userId: string, returnPath: string) {
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lookupKey, userId, returnPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate purchase');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Purchase initiation failed:', error);
      throw error;
    }
  },
};
