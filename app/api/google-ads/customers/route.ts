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

    if (!conn) {
      return NextResponse.json({ ok: true, customers: [] });
    }

    // Šeit vēlāk būs Google Ads API calls (accessible customers u.c.)
    // Pagaidām atgriežam tukšu sarakstu, lai build ir zaļš.
    return NextResponse.json({
      ok: true,
      customers: [],
    });
  } catch (e) {
    console.error("google-ads customers error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
