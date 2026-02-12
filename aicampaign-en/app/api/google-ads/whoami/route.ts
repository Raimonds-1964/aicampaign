import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const appEmail = "jane.doe@example.com"; // temporary stub; replace with authenticated user

    // TEMP FIX:
    // Prisma Client types do not include `googleAdsConnection` yet.
    // Runtime may still have it, so we use `as any` to avoid build failures.
    const conn = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: appEmail },
      orderBy: { createdAt: "desc" },
    });

    // "whoami" typically returns information about the current user and connection state
    return NextResponse.json({
      ok: true,
      userEmail: appEmail,
      connected: Boolean(conn),
    });
  } catch (e) {
    console.error("google-ads whoami error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
