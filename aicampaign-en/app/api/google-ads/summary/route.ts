import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "jane.doe@example.com"; // temporary stub; replace with authenticated user

    // TEMP FIX:
    // Prisma Client types do not include `googleAdsConnection` yet.
    // Runtime may still have it, so we use `as any` to avoid build failures.
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!conn) {
      return NextResponse.json({
        ok: true,
        summary: {
          connected: false,
          note: "No Google Ads connection found.",
        },
      });
    }

    // This endpoint will later return a real summary from the Google Ads API.
    // For now, return a stub so the build and application flow remain unblocked.
    return NextResponse.json({
      ok: true,
      summary: {
        connected: true,
        note: "Google Ads connection exists.",
      },
    });
  } catch (e) {
    console.error("google-ads summary error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
