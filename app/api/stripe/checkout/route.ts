import Stripe from "stripe";
import { NextResponse } from "next/server";

type Plan = "easy" | "basic" | "pro" | "agency";
type Mode = "payment" | "subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const PRICE_BY_PLAN: Record<Plan, string | undefined> = {
  easy: process.env.STRIPE_PRICE_EASY,
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  agency: process.env.STRIPE_PRICE_AGENCY,
};

function jsonError(error: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error, message, details }, { status });
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return jsonError("STRIPE_NOT_CONFIGURED", "Nav iestatīts STRIPE_SECRET_KEY.");
    }

    const body = (await req.json().catch(() => null)) as { plan?: Plan; mode?: Mode } | null;

    const plan = body?.plan;
    const mode = body?.mode ?? "subscription";

    if (!plan || !["easy", "basic", "pro", "agency"].includes(plan)) {
      return jsonError("INVALID_PLAN", `Nederīgs plāns. Atļauts: easy | basic | pro | agency.`);
    }

    if (!["payment", "subscription"].includes(mode)) {
      return jsonError("INVALID_MODE", `Nederīgs režīms. Atļauts: payment | subscription.`);
    }

    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId || !priceId.startsWith("price_")) {
      return jsonError(
        "MISSING_PRICE_ID",
        `Plānam "${plan}" nav derīga Stripe cena (jābūt price_...). Pārbaudi .env.local STRIPE_PRICE_${plan.toUpperCase()}.`,
        400,
        { plan, envKey: `STRIPE_PRICE_${plan.toUpperCase()}`, value: priceId }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // ✅ pēc apmaksas ejam uz success lapu (tā tālāk nosūtīs uz /dashboard/ai?success=1)
    const successUrl = `${appUrl}/pricing/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/pricing?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    return jsonError("STRIPE_CREATE_SESSION_FAILED", "Neizdevās izveidot Stripe Checkout sesiju.", 400, {
      message: e?.message,
      type: e?.type,
      code: e?.code,
      raw: e?.raw,
    });
  }
}
