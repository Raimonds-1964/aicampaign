import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../../../lib/stripe/stripe";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

type PlanKey = "easy" | "basic" | "pro" | "agency";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verify failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email || session.customer_email;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const plan = (session.metadata?.plan || "easy") as PlanKey;

      if (!email) {
        console.warn("⚠️ checkout.session.completed without email");
        return NextResponse.json({ received: true });
      }

      // 1) upsert User
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          plan,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
        create: {
          email,
          plan,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });

      // 2) ja subscription, saglabā Subscription tabulā
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (subscriptionId) {
        const sub = (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription;

        const stripePriceId =
          typeof sub.items?.data?.[0]?.price?.id === "string"
            ? sub.items.data[0].price.id
            : "unknown";

        const currentPeriodEndUnix = (sub as any).current_period_end;
const currentPeriodEnd =
  typeof currentPeriodEndUnix === "number"
    ? new Date(currentPeriodEndUnix * 1000)
    : null;

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscriptionId },
          update: {
            userId: user.id,
            stripePriceId,
            status: sub.status,
            currentPeriodEnd,
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: subscriptionId,
            stripePriceId,
            status: sub.status,
            currentPeriodEnd,
          },
        });
      }

      console.log("✅ Plan assigned:", { email, plan, subscriptionId });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook handler failed:", err?.message || err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
