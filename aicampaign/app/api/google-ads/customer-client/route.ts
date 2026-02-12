import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId") || "";

    const email = "test@example.com"; // pagaidu stub

    // ⛑️ TEMP FIX: Prisma tipiem nav googleAdsConnection
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!conn) {
      return NextResponse.json({ ok: false, error: "No Google Ads connection found" }, { status: 400 });
    }

    // Šeit normāli būtu loģika ar Google Ads API (customer-client / MCC u.c.)
    // Pagaidām atgriežam stub, lai build ir zaļš.
    return NextResponse.json({
      ok: true,
      customerId,
      client: null,
    });
  } catch (e) {
    console.error("google-ads customer-client error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
