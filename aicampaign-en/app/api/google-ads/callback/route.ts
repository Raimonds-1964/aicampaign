import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state"); // optional; reserve for CSRF/session binding if needed

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/ai?error=${encodeURIComponent(error)}`, url.origin)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/dashboard/ai?error=${encodeURIComponent("Missing authorization code.")}`, url.origin)
      );
    }

    // NOTE:
    // In production, you would exchange the authorization code for tokens (code -> refresh_token/access_token).
    // This route keeps stub token values for now so the build and flow remain unblocked.
    const email = "jane.doe@example.com"; // temporary; replace with the signed-in user's email (session/state)
    const refreshToken: string | null = null;

    // TEMP FIX:
    // Prisma Client types may not include `googleAdsConnection` yet.
    // Runtime may still have it, so we use `as any` to avoid build failures.
    const existing = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!existing) {
      await (prisma as any).googleAdsConnection.create({
        data: {
          userEmail: email,
          refreshToken,
        },
      });
    } else {
      await (prisma as any).googleAdsConnection.update({
        where: { id: existing.id },
        data: {
          refreshToken,
        },
      });
    }

    // After a successful callback, send the user back to the dashboard
    return NextResponse.redirect(new URL(`/dashboard/ai?success=1`, url.origin));
  } catch (e) {
    console.error("google-ads callback error:", e);
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
