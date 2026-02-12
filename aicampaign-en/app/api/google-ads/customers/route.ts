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

    // No connection → return an empty list
    if (!conn) {
      return NextResponse.json({ ok: true, customers: [] });
    }

    // This endpoint will later call the Google Ads API
    // (e.g. listAccessibleCustomers, customer metadata, etc.).
    // For now, return a stub so the build and application flow remain unblocked.
    return NextResponse.json({
      ok: true,
      customers: [],
    });
  } catch (e) {
    console.error("google-ads customers error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
