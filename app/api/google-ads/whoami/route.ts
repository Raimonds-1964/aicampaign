import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function pickEnv(name: string) {
  const v = process.env[name];
  return v && v.trim().length ? v.trim() : null;
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = pickEnv("GOOGLE_CLIENT_ID");
  const clientSecret = pickEnv("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return { ok: false as const, error: "MISSING_GOOGLE_OAUTH_ENV" };
  }

  const form = new URLSearchParams();
  form.set("client_id", clientId);
  form.set("client_secret", clientSecret);
  form.set("refresh_token", refreshToken);
  form.set("grant_type", "refresh_token");

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const text = await r.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  if (!r.ok) {
    return {
      ok: false as const,
      error: "TOKEN_REFRESH_FAILED",
      status: r.status,
      responsePreview: json ?? text.slice(0, 400),
    };
  }

  return { ok: true as const, accessToken: json.access_token as string };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const appEmail = session?.user?.email;

    if (!appEmail) {
      return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const conn = await prisma.googleAdsConnection.findFirst({
      where: { userEmail: appEmail },
      orderBy: { createdAt: "desc" },
    });

    if (!conn || !conn.refreshToken || conn.refreshToken === "PENDING_OAUTH") {
      return NextResponse.json(
        { error: "NOT_CONNECTED_TO_GOOGLE_ADS" },
        { status: 400 }
      );
    }

    const tokenRes = await refreshAccessToken(conn.refreshToken);
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "ACCESS_TOKEN_ERROR", details: tokenRes },
        { status: 400 }
      );
    }

    // Noskaidrojam Google konta e-pastu no access token
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.accessToken}` },
      cache: "no-store",
    });

    const text = await r.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}

    if (!r.ok) {
      return NextResponse.json(
        {
          error: "GOOGLE_USERINFO_ERROR",
          status: r.status,
          responsePreview: json ?? text.slice(0, 500),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      appSessionEmail: appEmail,
      googleOauthEmail: json?.email ?? null,
      googleSub: json?.sub ?? null,
      selectedCustomerId: conn.selectedCustomerId ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
