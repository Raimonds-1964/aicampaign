import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

async function requireAdminWorkspace(userId: string) {
  const ownerWs = await prisma.agencyWorkspace.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  });

  if (ownerWs) return ownerWs.id;

  const adminMember = await prisma.agencyMember.findFirst({
    where: { userId, role: "ADMIN" },
    select: { workspaceId: true },
  });

  return adminMember?.workspaceId ?? null;
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim() ?? "";
    const sessionUserId = (session?.user as any)?.id as string | undefined;

    if (!email && !sessionUserId) return jsonError("UNAUTHORIZED", 401);

    const user = await prisma.user.findFirst({
      where: sessionUserId ? { id: sessionUserId } : { email },
      select: { id: true },
    });
    if (!user) return jsonError("USER_NOT_FOUND", 404);

    const workspaceId = await requireAdminWorkspace(user.id);
    if (!workspaceId) return jsonError("FORBIDDEN_NOT_ADMIN", 403);

    const { memberId } = await ctx.params;
    if (!memberId) return jsonError("MEMBER_ID_REQUIRED", 400);

    const member = await prisma.agencyMember.findFirst({
      where: { id: memberId, workspaceId },
      select: { id: true, role: true },
    });

    if (!member) return jsonError("MEMBER_NOT_FOUND", 404);
    if (member.role === "ADMIN") return jsonError("CANNOT_DELETE_ADMIN", 400);

    // ✅ “ar visiem kontiem” šajā sistēmā: noņem visus campaign-owner assignmentus šim managerim
    await prisma.agencyCampaignOwner.deleteMany({
      where: { workspaceId, ownerMemberId: memberId },
    });

    // ✅ izdzēš pašu member
    await prisma.agencyMember.delete({ where: { id: memberId } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("ADMIN_DELETE_MEMBER_ERROR", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError("PRISMA_KNOWN_ERROR", 500, {
        code: e.code,
        message: e.message,
        meta: e.meta,
      });
    }

    return jsonError("SERVER_ERROR", 500, { message: e?.message ?? String(e) });
  }
}