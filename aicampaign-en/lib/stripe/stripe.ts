import Stripe from "stripe";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Use Node runtime (not Edge), because the Stripe SDK
// relies on Node-specific APIs.
//
// This Stripe instance is used for billing the AI Google Ads product
// (plans, subscriptions, one-time payments), not for any single feature
// such as the campaign generator.
export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  // Intentionally omit apiVersion to avoid potential TypeScript
  // mismatches between Stripe SDK versions across environments.
});
