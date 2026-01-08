import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "test@example.com"; // pagaidu stub

    // ⛑️ TEMP FIX: Prisma tipiem nav googleAdsConnection
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      connection: conn ?? null,
    });
  } catch (e) {
    console.error("google-ads debug-connection error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
