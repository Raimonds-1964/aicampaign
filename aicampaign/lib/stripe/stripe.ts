import Stripe from "stripe";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Izmantojam Node runtime (nevis Edge), jo Stripe SDK prasa Node API.
export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  // Apzināti neliekam apiVersion, lai neiekrītam TS mismatch starp Stripe pakotnēm/projektu.
});
