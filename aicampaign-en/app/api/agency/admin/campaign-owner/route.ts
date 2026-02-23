import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return jsonError("UNAUTHORIZED", 401);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, plan: true },
  });
  if (!user) return jsonError("USER_NOT_FOUND", 404);
  if (user.plan !== "agency") return jsonError("NOT_AGENCY_PLAN", 403);

  const workspace = await prisma.agencyWorkspace.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });
  if (!workspace) return jsonError("NO_ADMIN_WORKSPACE", 404);

  const body = await req.json().catch(() => null);
  const campaignId = String(body?.campaignId ?? "").trim();
  if (!campaignId) return jsonError("CAMPAIGN_ID_REQUIRED", 400);

  const row = await prisma.agencyCampaignOwner.findFirst({
    where: { workspaceId: workspace.id, campaignId },
    select: { ownerMemberId: true },
  });

  return NextResponse.json({
    ok: true,
    ownerId: row?.ownerMemberId ?? null, // null = unassigned/admin pool
  });
}