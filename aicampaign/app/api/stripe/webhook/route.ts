import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Stripe init (Node)
const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));

function toUserPlan(v: unknown): "easy" | "basic" | "pro" | "agency" {
  const s = String(v ?? "").toLowerCase();
  if (s === "basic") return "basic";
  if (s === "pro") return "pro";
  if (s === "agency") return "agency";
  return "easy";
}

function unixToDate(unixSeconds: unknown): Date | null {
  const n = Number(unixSeconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000);
}

async function upsertUserByEmail(args: {
  email: string;
  stripeCustomerId?: string | null;
  plan?: "easy" | "basic" | "pro" | "agency";
}) {
  const { email, stripeCustomerId, plan } = args;

  return prisma.user.upsert({
    where: { email },
    update: {
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
      ...(plan ? { plan } : {}),
    },
    create: {
      email,
      stripeCustomerId: stripeCustomerId ?? null,
      plan: plan ?? "easy",
    },
  });
}

async function upsertSubscription(args: {
  email: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodEnd: Date | null;
}) {
  // Atrodam user pēc email (šo mēs garantējam ar upsertUserByEmail)
  const user = await prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) throw new Error(`User not found for email ${args.email}`);

  return prisma.subscription.upsert({
    where: { stripeSubscriptionId: args.stripeSubscriptionId },
    update: {
      stripePriceId: args.stripePriceId,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
    },
  });
}

export async function POST(req: Request) {
  const hdrs = await headers();
  const sig = hdrs.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? null;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err?.message || err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email =
          session.customer_details?.email ||
          session.customer_email ||
          (session.metadata?.email as string | undefined) ||
          "";

        if (!email) {
          console.warn("checkout.session.completed without email");
          break;
        }

        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;

        const userPlan = toUserPlan(
          session.metadata?.userPlan ?? session.metadata?.planKey
        );

        await upsertUserByEmail({
          email,
          stripeCustomerId,
          plan: userPlan,
        });

        // Ja šis ir subscription checkout, session.subscription būs id
        const subId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (subId) {
          // TS-safe: Stripe SDK dažreiz tipizē Response wrapper; izvairāmies no current_period_end TS konflikta
          const sub = (await stripe.subscriptions.retrieve(subId)) as any;

          const stripePriceId =
            sub?.items?.data?.[0]?.price?.id ||
            sub?.plan?.id || // legacy fallback
            "";

          await upsertSubscription({
            email,
            stripeSubscriptionId: subId,
            stripePriceId: String(stripePriceId || ""),
            status: String(sub?.status || "unknown"),
            currentPeriodEnd: unixToDate(sub?.current_period_end),
          });
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;

        const customerId = String(sub?.customer || "");
        if (!customerId) break;

        // Atrodam lietotāju pēc stripeCustomerId (User modelī tas ir @unique)
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.warn("subscription event for unknown customer:", customerId);
          break;
        }

        const stripePriceId =
          sub?.items?.data?.[0]?.price?.id ||
          sub?.plan?.id ||
          "";

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: String(sub.id) },
          update: {
            stripePriceId: String(stripePriceId || ""),
            status: String(sub?.status || "unknown"),
            currentPeriodEnd: unixToDate(sub?.current_period_end),
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: String(sub.id),
            stripePriceId: String(stripePriceId || ""),
            status: String(sub?.status || "unknown"),
            currentPeriodEnd: unixToDate(sub?.current_period_end),
          },
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Stripe webhook handler error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook error" },
      { status: 500 }
    );
  }
}
