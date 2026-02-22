import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EasyStartPage() {
  const session = await getServerSession(authOptions);

  // 1) Not logged in → redirect to next-auth Google sign-in
  if (!session?.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/easy/start");
  }

  // 2) Logged in → redirect to Stripe checkout
  redirect("/api/stripe/checkout?planKey=easy");
}
