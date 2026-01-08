export type PlanKey =
  | "easy"
  | "basic_monthly"
  | "basic_yearly"
  | "pro_monthly"
  | "pro_yearly"
  | "agency_monthly"
  | "agency_yearly";

export type StripePlanConfig = {
  priceId: string;
  mode: "payment" | "subscription";
};

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

/**
 * Primārais objekts (ja tev jau kodā kaut kur ir PLANS).
 */
export const PLANS: Record<PlanKey, StripePlanConfig> = {
  easy: {
    priceId: requiredEnv("STRIPE_PRICE_EASY"),
    mode: "payment",
  },

  basic_monthly: {
    priceId: requiredEnv("STRIPE_PRICE_BASIC_MONTHLY"),
    mode: "subscription",
  },
  basic_yearly: {
    priceId: requiredEnv("STRIPE_PRICE_BASIC_YEARLY"),
    mode: "subscription",
  },

  pro_monthly: {
    priceId: requiredEnv("STRIPE_PRICE_PRO_MONTHLY"),
    mode: "subscription",
  },
  pro_yearly: {
    priceId: requiredEnv("STRIPE_PRICE_PRO_YEARLY"),
    mode: "subscription",
  },

  agency_monthly: {
    priceId: requiredEnv("STRIPE_PRICE_AGENCY_MONTHLY"),
    mode: "subscription",
  },
  agency_yearly: {
    priceId: requiredEnv("STRIPE_PRICE_AGENCY_YEARLY"),
    mode: "subscription",
  },
};

/**
 * Alias, lai var importēt kā `plans` (tavs checkout route tieši tā importē).
 */
export const plans = PLANS;
