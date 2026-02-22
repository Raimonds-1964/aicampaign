import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));

function getAppUrl(reqUrl: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(reqUrl).origin
  );
}

// ✅ FIX: saprot gan "agency", gan "agency_monthly"/"agency_yearly"
function toPlanKey(v: unknown): "easy" | "basic" | "pro" | "agency" {
  const s = String(v ?? "").toLowerCase();

  if (s === "basic" || s.startsWith("basic_")) return "basic";
  if (s === "pro" || s.startsWith("pro_")) return "pro";
  if (s === "agency" || s.startsWith("agency_")) return "agency";

  return "easy";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const appUrl = getAppUrl(req.url);

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing?error=missing_session", appUrl), 303);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.redirect(new URL("/pricing?error=not_paid", appUrl), 303);
  }

  const email =
    (session.metadata?.userEmail as string | undefined) ||
    (session.metadata?.email as string | undefined) ||
    session.customer_details?.email ||
    session.customer_email ||
    "";

  if (!email) {
    return NextResponse.redirect(new URL("/pricing?error=no_email", appUrl), 303);
  }

  // ✅ FIX: prioritizē userPlan (vienmēr "easy|basic|pro|agency"), tikai tad planKey
  const planKey = toPlanKey(session.metadata?.userPlan ?? session.metadata?.planKey);

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;

  if (!stripeCustomerId) {
    return NextResponse.redirect(new URL("/pricing?error=no_customer_created", appUrl), 303);
  }

  await prisma.user.upsert({
    where: { email },
    update: { plan: planKey, stripeCustomerId },
    create: { email, plan: planKey, stripeCustomerId },
  });

  return NextResponse.redirect(new URL("/start?paid=1", appUrl), 303);
}