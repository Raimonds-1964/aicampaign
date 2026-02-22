import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return jsonError("UNAUTHORIZED", 401);

  const userEmail = session.user.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true },
  });

  if (!user) return jsonError("USER_NOT_FOUND", 404);

  const member = await prisma.agencyMember.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      role: true,
      displayName: true,
      workspaceId: true,
      workspace: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!member) return jsonError("NOT_AGENCY_MEMBER", 403);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email },
    member: {
      id: member.id,
      role: member.role,
      displayName: member.displayName,
      workspaceId: member.workspaceId,
      workspaceName: member.workspace?.name ?? null,
    },
  });
}