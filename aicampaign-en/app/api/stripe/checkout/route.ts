import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { plans, type PlanKey } from "@/lib/stripe/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAppUrl(reqUrl: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(reqUrl).origin
  );
}

function isPlanKey(v: string | null): v is PlanKey {
  return Boolean(v && v in plans);
}

async function createCheckout(planKey: PlanKey, reqUrl: string) {
  const plan = plans[planKey];
  const appUrl = getAppUrl(reqUrl);

  // Metadata is used by Stripe webhooks to identify the purchased plan
  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      planKey: plan.key,
      userPlan: plan.userPlan,
    },
  });

  if (!session.url) {
    throw new Error("Stripe checkout session URL is missing.");
  }

  return session.url;
}

// GET: /api/stripe/checkout?planKey=easy
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planKey = searchParams.get("planKey");

    if (!isPlanKey(planKey)) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }

    const url = await createCheckout(planKey, req.url);
    return NextResponse.redirect(url, 303);
  } catch (e: any) {
    // Important: return a meaningful error for logs instead of a generic 500
    const message = e?.message || "Stripe checkout error.";
    const status = message.startsWith("Missing env ") ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

// POST: accepts JSON body { planKey: "easy" }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planKey = (body?.planKey as string | undefined) ?? null;

    if (!isPlanKey(planKey)) {
      return NextResponse.json(
        { ok: false, error: "Invalid planKey." },
        { status: 400 }
      );
    }

    const url = await createCheckout(planKey, req.url);
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    const message = e?.message || "Stripe checkout error.";
    const status = message.startsWith("Missing env ") ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
