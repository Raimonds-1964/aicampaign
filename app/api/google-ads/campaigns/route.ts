import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "test@example.com"; // pagaidu stub

    // ⛑️ TEMP FIX: Prisma tipiem nav googleAdsConnection
    const connection = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    // Ja nav savienojuma, atgriežam tukšu listi
    if (!connection) {
      return NextResponse.json({ ok: true, campaigns: [] });
    }

    // Šis endpoints, visticamāk, vēlāk vilks kampaņas no Google Ads API.
    // Pagaidām atgriežam stub, lai build un produkts dzīvo.
    return NextResponse.json({
      ok: true,
      campaigns: [],
    });
  } catch (e) {
    console.error("google-ads campaigns error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
