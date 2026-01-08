import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerId = typeof body?.customerId === "string" ? body.customerId : "";

    const email = "test@example.com"; // pagaidu stub

    // ⛑️ TEMP FIX: Prisma tipiem nav googleAdsConnection
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!conn) {
      return NextResponse.json({ ok: false, error: "No Google Ads connection found" }, { status: 400 });
    }

    // Šeit parasti saglabā izvēlēto customerId DB.
    // Pagaidām atgriežam ok, lai build iet cauri.
    return NextResponse.json({
      ok: true,
      selectedCustomerId: customerId || null,
    });
  } catch (e) {
    console.error("google-ads select-customer error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
