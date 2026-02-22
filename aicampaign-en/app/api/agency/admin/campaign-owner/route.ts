import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

    const email = session?.user?.email?.toLowerCase().trim() ?? "";
    const sessionUserId = (session?.user as any)?.id as string | undefined;

    if (!email && !sessionUserId) return jsonError("UNAUTHORIZED", 401);

    const user = await prisma.user.findFirst({
      where: sessionUserId ? { id: sessionUserId } : { email },
      select: { id: true },
    });

    if (!user) return jsonError("USER_NOT_FOUND", 404);

    // ✅ admin tiesības: workspace owner vai AgencyMember ADMIN
    const adminWs =
      (await prisma.agencyWorkspace.findFirst({
        where: { ownerId: user.id },
        select: { id: true },
      })) ??
      (await prisma.agencyMember.findFirst({
        where: { userId: user.id, role: "ADMIN" },
        select: { workspaceId: true },
      })) ??
      null;

    const workspaceId =
      adminWs && "workspaceId" in adminWs
        ? (adminWs as { workspaceId: string }).workspaceId
        : (adminWs as { id: string } | null)?.id;

    if (!workspaceId) return jsonError("FORBIDDEN_NOT_ADMIN", 403);

    const body = (await req.json().catch(() => null)) as
      | { campaignId?: string; accountId?: string }
      | null;

    const campaignId = String(body?.campaignId ?? "").trim();
    if (!campaignId) return jsonError("CAMPAIGN_ID_REQUIRED", 400);

    // ✅ Meklējam owner ierakstu pēc (workspaceId + campaignId)
    // (Ja tev vēl nav ierakstu tabulā, atgriezīs ownerId=null)
    const row = await prisma.agencyCampaignOwner.findFirst({
      where: { workspaceId, campaignId },
      select: { ownerMemberId: true },
    });

    // Ja nav ieraksta, atgriežam ok ar null (tas nav “error” — vienkārši nav assignment)
    if (!row) {
      return NextResponse.json({ ok: true, ownerId: null });
    }

    return NextResponse.json({ ok: true, ownerId: row.ownerMemberId ?? null });
  } catch (e: any) {
    console.error("ADMIN_CAMPAIGN_OWNER_ERROR", e);

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