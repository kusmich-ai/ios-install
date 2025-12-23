import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility - use getStripe() in new code
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// Price IDs from environment - IOS Installer tiers
export const PRICE_IDS = {
  // Base Installer
  quarterly: process.env.STRIPE_PRICE_QUARTERLY || '',        // $447 / 3 months
  biannual: process.env.STRIPE_PRICE_BIANNUAL || '',          // $597 / 6 months
  annual: process.env.STRIPE_PRICE_ANNUAL || '',              // $697 / year
  // Installer + Coaching
  quarterly_coaching: process.env.STRIPE_PRICE_QUARTERLY_COACHING || '',  // $1,038 / 3 months
  biannual_coaching: process.env.STRIPE_PRICE_BIANNUAL_COACHING || '',    // $1,397 / 6 months
  annual_coaching: process.env.STRIPE_PRICE_ANNUAL_COACHING || '',        // $1,797 / year
};

export type PlanType = keyof typeof PRICE_IDS;

// Helper to check if subscription is active
export function isSubscriptionActive(status: string): boolean {
  return ['active', 'trialing'].includes(status);
}

// Helper to check if plan includes coaching
export function planIncludesCoaching(planId: string): boolean {
  return planId.includes('coaching') || 
    planId === PRICE_IDS.quarterly_coaching ||
    planId === PRICE_IDS.biannual_coaching ||
    planId === PRICE_IDS.annual_coaching;
}
