import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAdminWorkspace } from "@/lib/agency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json({ error, details }, { status });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return jsonError("UNAUTHORIZED", 401);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, plan: true },
  });
  if (!user) return jsonError("USER_NOT_FOUND", 404);

  // ✅ Agency plan required
  if (user.plan !== "agency") return jsonError("NOT_AGENCY_PLAN", 403);

  // ✅ FIX: always ensure workspace exists
  const workspace = await ensureAdminWorkspace(user.id);

  // list MANAGER members in this workspace
  const managers = await prisma.agencyMember.findMany({
    where: { workspaceId: workspace.id, role: "MANAGER" },
    select: {
      id: true,
      displayName: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ok: true,
    managers: managers.map((m) => ({
      id: m.id,
      name: m.displayName ?? m.user.email ?? "Manager",
      email: m.user.email ?? "",
    })),
  });
}