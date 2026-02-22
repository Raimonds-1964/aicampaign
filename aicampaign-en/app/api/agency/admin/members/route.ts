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
  const email = session?.user?.email?.toLowerCase().trim() ?? "";
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  if (!email && !sessionUserId) return jsonError("UNAUTHORIZED", 401);

  const user = await prisma.user.findFirst({
    where: sessionUserId ? { id: sessionUserId } : { email },
    select: { id: true },
  });
  if (!user) return jsonError("USER_NOT_FOUND", 404);

  // ✅ admin workspace: owner OR ADMIN member
  const ownerWs = await prisma.agencyWorkspace.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });

  const adminMember = !ownerWs
    ? await prisma.agencyMember.findFirst({
        where: { userId: user.id, role: "ADMIN" },
        select: { workspaceId: true },
      })
    : null;

  const workspaceId = ownerWs?.id ?? adminMember?.workspaceId ?? null;
  if (!workspaceId) return jsonError("FORBIDDEN_NOT_ADMIN", 403);

  // ✅ VISI manageri šajā workspace
  const managers = await prisma.agencyMember.findMany({
    where: { workspaceId, role: "MANAGER" },
    select: {
      id: true,
      displayName: true,
      createdAt: true,
      user: { select: { email: true } },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  return NextResponse.json({
    ok: true,
    managers: managers.map((m) => ({
      id: m.id,
      name: m.displayName || m.user.email,
      email: m.user.email,
    })),
  });
}