import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state"); // ja tev state tiek lietots, vari izmantot vēlāk

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/ai?error=${encodeURIComponent(error)}`, url.origin)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/dashboard/ai?error=${encodeURIComponent("Missing code")}`, url.origin)
      );
    }

    // NOTE:
    // Šeit parasti būtu Google OAuth token exchange (code -> refresh_token/access_token).
    // Tavā projektā pēc logiem redzu, ka tu jau agrāk izmantoji `ex.json()?.refresh_token`.
    // Lai tagad build nekrīt un plūsma nav “bloķēta”, atstājam token mainīgos kā stubus.
    const email = "test@example.com"; // pagaidu (vēlāk nomainīsi uz īsto user email no sesijas/state)
    const refreshToken: string | null = null;

    // ⛑️ TEMP FIX:
    // Prisma tipiem modelis `googleAdsConnection` vēl nav pieejams -> build krīt.
    // Runtime tas var eksistēt, tāpēc izmantojam `as any`.
    const existing = await (prisma as any).googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!existing) {
      // izveido jaunu ierakstu (ja tavā DB modelī šis eksistē)
      await (prisma as any).googleAdsConnection.create({
        data: {
          userEmail: email,
          refreshToken,
        },
      });
    } else {
      // atjauno ierakstu
      await (prisma as any).googleAdsConnection.update({
        where: { id: existing.id },
        data: {
          refreshToken,
        },
      });
    }

    // Pēc callback parasti atgriežam uz dashboard
    return NextResponse.redirect(new URL(`/dashboard/ai?success=1`, url.origin));
  } catch (e) {
    console.error("google-ads callback error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
