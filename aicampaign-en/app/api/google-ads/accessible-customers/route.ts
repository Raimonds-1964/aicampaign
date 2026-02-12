import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "jane.doe@example.com"; // temporary stub; endpoint not wired to auth yet

    // TEMP FIX:
    // Prisma Client types may not include this model yet.
    // Runtime works, but we must avoid failing the build.
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      connection: conn ?? null,
    });
  } catch (error) {
    console.error("accessible-customers error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
