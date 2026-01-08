import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { plans, type PlanKey } from "@/lib/stripe/plans";

export const runtime = "nodejs";

function getAppUrl(reqUrl: string) {
  // droši: production -> NEXT_PUBLIC_APP_URL, fallback -> NEXTAUTH_URL, pēdējais -> origin no request
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(reqUrl).origin
  );
}

async function createCheckout(planKey: PlanKey, reqUrl: string) {
  const plan = plans[planKey];
  const appUrl = getAppUrl(reqUrl);

  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session.url!;
}

// ✅ GET: lai var testēt pārlūkā: /api/stripe/checkout?planKey=easy
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planKey = searchParams.get("planKey") as PlanKey | null;

    if (!planKey || !plans[planKey]) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }

    const url = await createCheckout(planKey, req.url);
    return NextResponse.redirect(url, 303);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Checkout error" }, { status: 500 });
  }
}

// ✅ POST: ja tev pricing poga sūta POST ar JSON body { planKey: "easy" }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planKey = body?.planKey as PlanKey | undefined;

    if (!planKey || !plans[planKey]) {
      return NextResponse.json({ error: "Invalid planKey" }, { status: 400 });
    }

    const url = await createCheckout(planKey, req.url);
    // te var atgriezt JSON, ja frontend grib window.location = url
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Checkout error" }, { status: 500 });
  }
}
