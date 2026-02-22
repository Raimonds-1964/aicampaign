// app/easy/ai-campaign/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Client from "./Client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/easy/ai-campaign");
  }

  const email = session.user.email;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { stripeCustomerId: true, plan: true },
  });

  // ✅ Must be paid (stripeCustomerId)
  if (!user?.stripeCustomerId) {
    redirect("/pricing?need=easy");
  }

  // (Optional) If you want ONLY easy users here:
  // if (user.plan !== "easy") redirect("/start");

  return <Client />;
}
