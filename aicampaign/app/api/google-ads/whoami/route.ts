import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const appEmail = "test@example.com"; // pagaidu stub

    // ⛑️ TEMP FIX: Prisma tipiem nav googleAdsConnection
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: appEmail },
      orderBy: { createdAt: "desc" },
    });

    // whoami parasti atgriež info par savienojumu / useru
    return NextResponse.json({
      ok: true,
      userEmail: appEmail,
      connected: !!conn,
    });
  } catch (e) {
    console.error("google-ads whoami error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
