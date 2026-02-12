export type PlanKey =
  | "easy"
  | "basic_monthly"
  | "basic_yearly"
  | "pro_monthly"
  | "pro_yearly"
  | "agency_monthly"
  | "agency_yearly";

type Plan = {
  key: PlanKey;

  // Stripe Checkout mode:
  // - "payment" = one-time purchase
  // - "subscription" = recurring billing
  mode: "payment" | "subscription";

  // Stripe Price ID (e.g. price_123)
  priceId: string;

  // User.plan value stored in DB (Prisma enum)
  // This represents the AI Google Ads product plan,
  // not a single feature like the campaign generator
  userPlan: "easy" | "basic" | "pro" | "agency";
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Stripe pricing configuration for AI Google Ads plans
export const plans: Record<PlanKey, Plan> = {
  easy: {
    key: "easy",
    mode: "payment",
    priceId: requireEnv("STRIPE_PRICE_EASY"),
    userPlan: "easy",
  },

  basic_monthly: {
    key: "basic_monthly",
    mode: "subscription",
    priceId: requireEnv("STRIPE_PRICE_BASIC_MONTHLY"),
    userPlan: "basic",
  },
  basic_yearly: {
    key: "basic_yearly",
    mode: "subscription",
    priceId: requireEnv("STRIPE_PRICE_BASIC_YEARLY"),
    userPlan: "basic",
  },

  pro_monthly: {
    key: "pro_monthly",
    mode: "subscription",
    priceId: requireEnv("STRIPE_PRICE_PRO_MONTHLY"),
    userPlan: "pro",
  },
  pro_yearly: {
    key: "pro_yearly",
    mode: "subscription",
    priceId: requireEnv("STRIPE_PRICE_PRO_YEARLY"),
    userPlan: "pro",
  },

  agency_monthly: {
    key: "agency_monthly",
    mode: "subscription",
    priceId: requireEnv("STRIPE_PRICE_AGENCY_MONTHLY"),
    userPlan: "agency",
  },
  agency_yearly: {
    key: "agency_yearly",
    mode: "subscription",
    priceId: requireEnv("STRIPE_PRICE_AGENCY_YEARLY"),
    userPlan: "agency",
  },
};
