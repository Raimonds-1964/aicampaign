import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";
import { plans, type PlanKey } from "@/lib/stripe/plans";

export const runtime = "nodejs";

type Body = {
  planKey?: PlanKey;
  plan?: string; // vecais variants (easy/basic/pro/agency)
  billing?: "monthly" | "yearly"; // ja kādreiz sūtīsi
};

function normalizePlanKey(body: Body): PlanKey | null {
  if (body.planKey) return body.planKey;

  // Backward compatible:
  // Ja atnāk tikai "easy" -> varam mapot precīzi.
  // Basic/Pro/Agency bez billing nevar droši noteikt monthly/yearly, tāpēc default uz monthly.
  if (!body.plan) return null;

  const p = body.plan.toLowerCase().trim();

  if (p === "easy") return "easy";
  if (p === "basic") return (body.billing === "yearly" ? "basic_yearly" : "basic_monthly");
  if (p === "pro") return (body.billing === "yearly" ? "pro_yearly" : "pro_monthly");
  if (p === "agency") return (body.billing === "yearly" ? "agency_yearly" : "agency_monthly");

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const planKey = normalizePlanKey(body);
    if (!planKey) {
      return NextResponse.json({ error: "Missing planKey" }, { status: 400 });
    }

    const plan = plans[planKey];
    if (!plan) {
      return NextResponse.json({ error: "Invalid planKey" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL / NEXTAUTH_URL" },
        { status: 500 }
      );
    }

    const successUrl = `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/pricing`;

    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const msg =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err?.message || "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
