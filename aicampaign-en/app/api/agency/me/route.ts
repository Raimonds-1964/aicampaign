// app/api/agency/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  const sessionEmail = session?.user?.email?.toLowerCase().trim() ?? "";
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  if (!sessionEmail && !sessionUserId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Atrodam user pēc id (ja ir), citādi pēc email
  const user = await prisma.user.findFirst({
    where: sessionUserId ? { id: sessionUserId } : { email: sessionEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  // Šeit “member” = AgencyMember ieraksts (MANAGER/ADMIN)
  const member = await prisma.agencyMember.findFirst({
    where: {
      userId: user.id,
      role: { in: ["ADMIN", "MANAGER"] },
    },
    select: {
      id: true,
      role: true,
      displayName: true,
      workspaceId: true,
      workspace: { select: { name: true } },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: "NOT_AN_AGENCY_MEMBER" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email },
    member: {
      id: member.id,
      role: member.role,
      displayName: member.displayName ?? null,
      workspaceId: member.workspaceId,
      workspaceName: member.workspace?.name ?? null,
    },
  });
}