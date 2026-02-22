import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  return !!v && v in plans;
}

async function createCheckout(planKey: PlanKey, reqUrl: string, userEmail: string) {
  const plan = plans[planKey];
  const appUrl = getAppUrl(reqUrl);

  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",

    ...(plan.mode === "payment" ? { customer_creation: "always" as const } : {}),

    customer_email: userEmail,

    metadata: {
      planKey: plan.key,     // piemēram: agency_monthly
      userPlan: plan.userPlan, // piemēram: agency
      userEmail,
    },
  });

  if (!session.url) throw new Error("Stripe session.url is missing");
  return session.url;
}

// GET: /api/stripe/checkout?planKey=easy|basic_monthly|...|agency_yearly
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedPlanKey = searchParams.get("planKey");

    // Ja nav derīgs planKey, uz pricing
    if (!isPlanKey(requestedPlanKey)) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }

    const auth = await getServerSession(authOptions);
    const email = auth?.user?.email;

    // ✅ FIX: ja nav ielogojies, pēc login atgriezies uz to pašu checkout URL
    if (!email) {
      const appUrl = getAppUrl(req.url);
      const callbackUrl = `${appUrl}/api/stripe/checkout?planKey=${encodeURIComponent(
        requestedPlanKey
      )}`;

      return NextResponse.redirect(
        new URL(
          `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          req.url
        )
      );
    }

    const url = await createCheckout(requestedPlanKey, req.url, email);
    return NextResponse.redirect(url, 303);
  } catch (e: any) {
    const msg = e?.message || "Checkout error";
    const status = msg.startsWith("Missing env ") ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

// POST: frontend sends JSON { planKey: "agency_monthly" }
export async function POST(req: Request) {
  try {
    const auth = await getServerSession(authOptions);
    const email = auth?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const planKey = (body?.planKey as string | undefined) ?? null;

    if (!isPlanKey(planKey)) {
      return NextResponse.json({ ok: false, error: "Invalid planKey" }, { status: 400 });
    }

    const url = await createCheckout(planKey, req.url, email);
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    const msg = e?.message || "Checkout error";
    const status = msg.startsWith("Missing env ") ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}