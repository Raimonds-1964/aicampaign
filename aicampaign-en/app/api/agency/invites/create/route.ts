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

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3001"
  ).replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return jsonError("UNAUTHORIZED", 401);

    const userEmail = session.user.email.toLowerCase().trim();
    const body = await req.json().catch(() => null);

    const inviteEmail = String(body?.email ?? "").toLowerCase().trim();
    if (!inviteEmail) return jsonError("EMAIL_REQUIRED", 400);

    const managerName = String(body?.managerName ?? "").trim() || null;

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail },
      select: { id: true },
    });

    // ✅ Atrodam workspace, kur user ir owner VAI ADMIN member
    const workspace =
      (await prisma.agencyWorkspace.findFirst({
        where: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id, role: "ADMIN" } } },
          ],
        },
        select: { id: true },
      })) ?? null;

    if (!workspace) return jsonError("NO_ADMIN_WORKSPACE", 403);

    // raw token shown in URL, hashed token stored in DB
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const data: Prisma.AgencyInviteCreateInput = {
      workspace: { connect: { id: workspace.id } },
      email: inviteEmail,
      role: "MANAGER",
      tokenHash,
      expiresAt,
      managerName,
    };

    await prisma.agencyInvite.create({ data });

    const inviteUrl = `${baseUrl()}/agency/invite?token=${encodeURIComponent(rawToken)}`;
    return NextResponse.json({ inviteUrl });
  } catch (e: any) {
    console.error("INVITE_CREATE_ERROR", e);

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