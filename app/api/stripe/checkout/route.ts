import Stripe from "stripe";
import { NextResponse } from "next/server";

type Plan = "easy" | "basic" | "pro" | "agency";
type Mode = "payment" | "subscription";

const PRICE_BY_PLAN: Record<Plan, string | undefined> = {
  easy: process.env.STRIPE_PRICE_EASY,
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  agency: process.env.STRIPE_PRICE_AGENCY,
};

function jsonError(error: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error, message, details }, { status });
}

function getAppUrl(req: Request) {
  // 1) Ja ir uzlikts publiskais URL env, izmantojam to
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // 2) Citādi mēģinām salikt no request headeriem (Vercel/Proxy gadījumā tas parasti strādā)
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`.replace(/\/$/, "");
}

export async function POST(req: Request) {
  try {
    // ✅ SVARĪGI: Stripe nedrīkst inicializēt ar tukšu atslēgu faila augšā,
    // jo Vercel build laikā tas var uzreiz uzsprāgt.
    const secretKey = process.env.STRIPE_SECRET_KEY;

    // Ja Stripe nav konfigurēts, NEKRITAM — vienkārši atgriežam saprotamu atbildi.
    if (!secretKey || !secretKey.startsWith("sk_")) {
      return jsonError(
        "STRIPE_NOT_CONFIGURED",
        "Stripe nav nokonfigurēts (STRIPE_SECRET_KEY nav uzlikts).",
        501
      );
    }

    const stripe = new Stripe(secretKey); // apiVersion var neuzstādīt — Stripe SDK pati tiks galā

    const body = (await req.json().catch(() => null)) as { plan?: Plan; mode?: Mode } | null;

    const plan = body?.plan;
    const mode = body?.mode ?? "subscription";

    if (!plan || !["easy", "basic", "pro", "agency"].includes(plan)) {
      return jsonError("INVALID_PLAN", "Nederīgs plāns. Atļauts: easy | basic | pro | agency.");
    }

    if (!["payment", "subscription"].includes(mode)) {
      return jsonError("INVALID_MODE", "Nederīgs režīms. Atļauts: payment | subscription.");
    }

    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId || !priceId.startsWith("price_")) {
      return jsonError(
        "MISSING_PRICE_ID",
        `Plānam "${plan}" nav derīga Stripe cena (jābūt price_...). Pārbaudi STRIPE_PRICE_${plan.toUpperCase()}.`,
        400,
        { plan, envKey: `STRIPE_PRICE_${plan.toUpperCase()}`, value: priceId }
      );
    }

    const appUrl = getAppUrl(req);

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
