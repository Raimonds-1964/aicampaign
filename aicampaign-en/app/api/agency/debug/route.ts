import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const workspace = await prisma.agencyWorkspace.findFirst({
    where: { ownerId: user.id },
    select: { id: true, ownerId: true, name: true },
  });

  const members = workspace
    ? await prisma.agencyMember.findMany({
        where: { workspaceId: workspace.id },
        select: {
          id: true,
          role: true,
          displayName: true,
          user: { select: { email: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const invites = workspace
    ? await prisma.agencyInvite.findMany({
        where: { workspaceId: workspace.id },
        select: {
          id: true,
          email: true,
          managerName: true,
          usedAt: true,
          acceptedByUserId: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return NextResponse.json({
    ok: true,
    user,
    workspace,
    membersCount: members.length,
    members,
    invitesCount: invites.length,
    invites,
  });
}