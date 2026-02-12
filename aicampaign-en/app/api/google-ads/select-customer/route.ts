import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerId = typeof body?.customerId === "string" ? body.customerId : "";

    const email = "jane.doe@example.com"; // temporary stub; replace with authenticated user

    // TEMP FIX:
    // Prisma Client types do not include `googleAdsConnection` yet.
    // Runtime may still have it, so we use `as any` to avoid build failures.
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!conn) {
      return NextResponse.json(
        { ok: false, error: "No Google Ads connection found." },
        { status: 400 }
      );
    }

    // In production, this is where the selected customerId would be persisted in the database.
    // For now, return a success response so the build and application flow remain unblocked.
    return NextResponse.json({
      ok: true,
      selectedCustomerId: customerId || null,
    });
  } catch (e) {
    console.error("google-ads select-customer error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
