import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { plans, type PlanKey } from "@/lib/stripe/plans";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planKey = searchParams.get("planKey") as PlanKey | null;

    if (!planKey || !plans[planKey]) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL (or NEXTAUTH_URL)" },
        { status: 500 }
      );
    }

    const plan = plans[planKey];

    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    // 303 = pareizs redirect pēc “GET”
    return NextResponse.redirect(session.url!, 303);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
