import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("UNAUTHORIZED", 401);

    const userEmail = session.user.email.toLowerCase().trim();

    const body = await req.json().catch(() => null);
    const rawToken = String(body?.token ?? "").trim();
    if (!rawToken) return jsonError("TOKEN_REQUIRED", 400);

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const invite = await prisma.agencyInvite.findUnique({
      where: { tokenHash },
    });

    if (!invite) return jsonError("INVITE_NOT_FOUND", 404);
    if (invite.usedAt) return jsonError("INVITE_ALREADY_USED", 409);
    if (invite.expiresAt.getTime() < Date.now()) return jsonError("INVITE_EXPIRED", 410);

    /**
     * ✅ FIX: NEKĀDA EMAIL_MISMATCH.
     * Invite pieņemšana notiek pēc tokena (tas ir slepenais pierādījums).
     * Pretējā gadījumā reāli dzīvē bieži ir Google aliasi / workspace konti / plus-tag,
     * un cilvēki iestrēgst.
     */
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail },
    });

    // ✅ ieliek vārdu no invite.managerName -> AgencyMember.displayName
    await prisma.agencyMember.upsert({
      where: {
        workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id },
      },
      update: {
        role: invite.role,
        displayName: invite.managerName ?? undefined,
      },
      create: {
        workspaceId: invite.workspaceId,
        userId: user.id,
        role: invite.role,
        displayName: invite.managerName ?? undefined,
      },
    });

    await prisma.agencyInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date(), acceptedByUserId: user.id },
    });

    return NextResponse.json({
      ok: true,
      acceptedAs: userEmail,
      workspaceId: invite.workspaceId,
      role: invite.role,
      managerName: invite.managerName,
    });
  } catch (e: any) {
    console.error("INVITE_ACCEPT_ERROR", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return jsonError("PRISMA_KNOWN_ERROR", 500, {
        code: e.code,
        message: e.message,
        meta: e.meta,
      });
    }

    return jsonError("SERVER_ERROR", 500, {
      message: e?.message ?? String(e),
    });
  }
}