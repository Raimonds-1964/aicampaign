import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
}) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const body = new URLSearchParams();
  body.set("code", params.code);
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("redirect_uri", params.redirectUri);
  body.set("grant_type", "authorization_code");

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await r.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch {}

  return { ok: r.ok, status: r.status, text, json };
}

function baseUrlFromReq(req: Request) {
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || null;

    if (!email) {
      return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "MISSING_GOOGLE_OAUTH_ENV", need: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
        { status: 500 }
      );
    }

    const url = new URL(req.url);

    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      return NextResponse.json(
        { error: "OAUTH_ERROR", oauthError },
        { status: 400 }
      );
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code) {
      return NextResponse.json(
        { error: "MISSING_PARAMS", need: ["code"] },
        { status: 400 }
      );
    }

    // state pārbaude
    const cookieState = (req.headers.get("cookie") || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("google_ads_oauth_state="))
      ?.split("=")[1];

    if (!cookieState || !state || cookieState !== state) {
      return NextResponse.json(
        { error: "BAD_OAUTH_STATE" },
        { status: 400 }
      );
    }

    const redirectUri =
      process.env.GOOGLE_OAUTH_REDIRECT_URI ||
      `${process.env.NEXTAUTH_URL || baseUrlFromReq(req)}/api/google-ads/callback`;

    const ex = await exchangeCodeForTokens({ code, redirectUri });
    if (!ex.ok) {
      return NextResponse.json(
        {
          error: "TOKEN_EXCHANGE_FAILED",
          status: ex.status,
          responsePreview: ex.json || ex.text?.slice(0, 400),
        },
        { status: 400 }
      );
    }

    const refreshToken = ex.json?.refresh_token || null;

    const existing = await prisma.googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!refreshToken) {
      // Ja refresh_token neatnāca, bet DB jau ir — turpinām ar esošo.
      if (existing?.refreshToken && existing.refreshToken !== "PENDING_OAUTH") {
        const res = NextResponse.redirect("http://localhost:3000/dashboard/customers");
        res.cookies.set("google_ads_oauth_state", "", { path: "/", maxAge: 0 });
        return res;
      }

      return NextResponse.json(
        {
          error: "NO_REFRESH_TOKEN",
          message:
            "Google neatdeva refresh_token. Parasti jāizdara revoke un jāpiespiež consent. Atver https://myaccount.google.com/permissions -> noņem AI Google Ads piekļuvi un mēģini Connect vēlreiz.",
        },
        { status: 400 }
      );
    }

    if (existing) {
      await prisma.googleAdsConnection.update({
        where: { id: existing.id },
        data: { refreshToken },
      });
    } else {
      await prisma.googleAdsConnection.create({
        data: { userEmail: email, refreshToken, selectedCustomerId: null },
      });
    }

    const res = NextResponse.redirect("http://localhost:3000/dashboard/customers");
    res.cookies.set("google_ads_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
