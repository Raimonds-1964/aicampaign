import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "jane.doe@example.com"; // temporary stub

    // TEMP FIX:
    // Prisma Client types do not include `googleAdsConnection` yet.
    // Runtime may still have it, so we use `as any` to avoid build failures.
    const connection = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    // If there is no connection, return an empty list
    if (!connection) {
      return NextResponse.json({ ok: true, campaigns: [] });
    }

    // This endpoint will later fetch campaigns from the Google Ads API.
    // For now, return a stub response so the build and product remain unblocked.
    return NextResponse.json({
      ok: true,
      campaigns: [],
    });
  } catch (e) {
    console.error("google-ads campaigns error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
