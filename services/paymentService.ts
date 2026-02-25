
import { CONFIG } from '../config';

// This service interacts with your Cloudflare Worker backend
// which then communicates with the Stripe API.

export const createCheckoutSession = async (priceId: string, customerId?: string) => {
  if (!CONFIG.ENABLE_BILLING) {
    console.warn("Billing is disabled in config.");
    return null;
  }

  try {
    // In production, fetch from your Cloudflare Worker:
    // const response = await fetch(`${CONFIG.API_BASE_URL}/api/checkout`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priceId, customerId })
    // });
    // const { url } = await response.json();
    // window.location.href = url;

    // --- SIMULATION FOR DEMO ---
    console.log(`Creating Stripe Checkout Session for ${priceId}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(`【Stripeテストモード】\n決済画面へリダイレクトします。\nPlan: ${priceId}`);
        resolve(true); // Simulate success
      }, 1000);
    });

  } catch (error) {
    console.error("Payment Error:", error);
    throw error;
  }
};

export const portalSession = async (customerId: string) => {
  // Redirects to Stripe Customer Portal for managing subscriptions
  console.log("Redirecting to Customer Portal...");
};
