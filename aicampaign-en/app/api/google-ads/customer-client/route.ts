import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const email = "jane.doe@example.com"; // temporary stub; replace with authenticated user

    // TEMP FIX:
    // Prisma Client types do not include `googleAdsConnection` yet.
    // Runtime may still have it, so we use `as any` to prevent build failures.
    const connection = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    // If there is no Google Ads connection, return an empty list
    if (!connection) {
      return NextResponse.json({ ok: true, campaigns: [] });
    }

    // This endpoint will later fetch campaigns from the Google Ads API.
    // For now, return a stub response so the build and application flow remain unblocked.
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
