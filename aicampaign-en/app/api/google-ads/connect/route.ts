import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function baseUrlFromReq(req: Request) {
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

function randomState() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "MISSING_GOOGLE_CLIENT_ID" }, { status: 500 });
  }

  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL || baseUrlFromReq(req)}/api/google-ads/callback`;

  const state = randomState();

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/adwords",
  ].join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent"); // piespiež refresh_token (pirmajā reizē)
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("google_ads_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // localhost
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}
