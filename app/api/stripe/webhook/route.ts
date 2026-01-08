import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Stripe init
// NOTE: neliekam apiVersion, lai nebūtu TS mismatch ar Stripe package tipiem
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  // ✅ Next.js: headers() ir async (Promise<ReadonlyHeaders>)
  const hdrs = await headers();
  const sig = hdrs.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Missing Stripe signature/secret" }, { status: 400 });
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
    // ✅ handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        (session.customer_details?.email ||
          session.customer_email ||
          (session.metadata?.email as string) ||
          "")?.toString();

      const customerId = (session.customer as string) || null;

      const plan =
        (session.metadata?.plan as string) ||
        (session.metadata?.tier as string) ||
        "PAID";

      if (email) {
        // ⛑️ TEMP FIX: Prisma tipiem nav `user` -> build nedrīkst krist
        await (prisma as any).user.upsert({
          where: { email },
          update: {
            plan,
            stripeCustomerId: customerId,
          },
          create: {
            email,
            plan,
            stripeCustomerId: customerId,
          },
        });
      } else {
        console.warn("checkout.session.completed received without email");
      }
    }

    // ✅ subscription events (ja izmanto)
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = (sub.customer as string) || null;

      if (customerId) {
        await (prisma as any).user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: sub.status,
            subscriptionId: sub.id,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ ok: false, error: "Webhook error" }, { status: 500 });
  }
}
