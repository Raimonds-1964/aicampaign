import { NextResponse } from "next/server";

async function getAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { ok: false as const, error: "MISSING_GOOGLE_CLIENT_ID_OR_SECRET" };
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const text = await res.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      ok: false as const,
      error: "TOKEN_NOT_JSON",
      status: res.status,
      responsePreview: text.slice(0, 300),
    };
  }

  if (!res.ok) {
    return {
      ok: false as const,
      error: "TOKEN_REFRESH_FAILED",
      status: res.status,
      response: json,
    };
  }

  return { ok: true as const, accessToken: json.access_token as string };
}

export async function GET() {
  try {
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const refreshToken = process.env.GOOGLE_DEBUG_REFRESH_TOKEN;

    if (!developerToken) {
      return NextResponse.json({ ok: false, error: "MISSING_DEVELOPER_TOKEN" }, { status: 400 });
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "MISSING_DEBUG_REFRESH_TOKEN",
          message: "Set GOOGLE_DEBUG_REFRESH_TOKEN in your environment variables (e.g., .env.local).",
        },
        { status: 400 }
      );
    }

    const token = await getAccessToken(refreshToken);

    if (!token.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "ACCESS_TOKEN_ERROR",
          details: token,
        },
        { status: 500 }
      );
    }

    const version = process.env.GOOGLE_ADS_API_VERSION || "v22";
    const url = `https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "developer-token": developerToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({}),
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "GOOGLE_ADS_API_CALL_FAILED",
          status: res.status,
          contentType,
          responsePreview: text.slice(0, 500),
        },
        { status: 500 }
      );
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "GOOGLE_RESPONSE_NOT_JSON",
          responsePreview: text.slice(0, 400),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      customers: json.resourceNames ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
