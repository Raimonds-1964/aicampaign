export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ManagerShell from "./_ui/ManagerShell";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  if (!email && !sessionUserId) {
    redirect("/api/auth/signin?callbackUrl=%2Fagency%2Fmanager%2Faccounts");
  }

  const user = await prisma.user.findFirst({
    where: sessionUserId ? { id: sessionUserId } : { email: email! },
    select: { id: true },
  });

  if (!user) redirect("/pricing");

  // ✅ tikai īsts AgencyMember ar MANAGER/ADMIN
  const member = await prisma.agencyMember.findFirst({
    where: { userId: user.id, role: { in: ["MANAGER", "ADMIN"] } },
    select: { id: true },
  });

  if (!member) redirect("/agency/unauthorized");

  return (
    <Suspense fallback={null}>
      <ManagerShell>{children}</ManagerShell>
    </Suspense>
  );
}