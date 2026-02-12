import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "test@example.com"; // pagaidu stub, jo endpoint nav vēl aktīvs

    // ⛑️ TEMP FIX:
    // PrismaClient tipiem šis modelis vēl nav zināms,
    // bet runtime tas strādā. Build nedrīkst krist.
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
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
