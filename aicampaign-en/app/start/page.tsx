// app/start/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StartPage() {
  const session = await getServerSession(authOptions);

  // Not logged in -> Google sign-in -> back to /start
  if (!session?.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/start");
  }

  const email = session.user.email;

  // ✅ DO NOT auto-create paid access users
  const user = await prisma.user.findUnique({
    where: { email },
    select: { plan: true, stripeCustomerId: true },
  });

  // If user doesn't exist -> send to pricing
  if (!user) {
    redirect("/pricing");
  }

  // ✅ Require payment proof for any app access
  if (!user.stripeCustomerId) {
    redirect("/pricing");
  }

  // Route by plan
  if (user.plan === "agency") redirect("/agency/administrator/accounts");
  if (user.plan === "pro") redirect("/pro/administrator/accounts");
  if (user.plan === "basic") redirect("/basic/administrator/accounts");

  // easy
  redirect("/easy/ai-campaign");
}


