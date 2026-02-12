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
      return NextResponse.json({
        ok: true,
        summary: {
          connected: false,
          note: "No connection",
        },
      });
    }

    // Šeit vēlāk būs reāls kopsavilkums no Google Ads API.
    // Pagaidām atgriežam stub, lai build ir zaļš.
    return NextResponse.json({
      ok: true,
      summary: {
        connected: true,
        note: "Connection exists",
      },
    });
  } catch (e) {
    console.error("google-ads summary error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
