import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function pickEnv(name: string) {
  const v = process.env[name];
  return v && v.trim().length ? v.trim() : null;
}

function maskToken(v: string | null) {
  if (!v) return null;
  const s = String(v);
  if (s.length <= 6) return "***";
  return `${s.slice(0, 2)}***${s.slice(-2)}`;
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

async function googleAdsSearch(params: {
  customerId: string; // šeit būs MCC CID, jo mēs vaicājam customer_client no managera skatpunkta
  accessToken: string;
  developerToken: string;
  loginCustomerId?: string | null;
  query: string;
}) {
  const { customerId, accessToken, developerToken, loginCustomerId, query } =
    params;

  const url = `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };

  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;

  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  const text = await r.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  const sentHeaders = {
    "developer-token": maskToken(developerToken),
    "login-customer-id": headers["login-customer-id"] ?? null,
    "Content-Type": headers["Content-Type"] ?? null,
  };

  if (!r.ok) {
    return {
      ok: false as const,
      status: r.status,
      requestedUrl: url,
      responsePreview: json ?? text.slice(0, 700),
      debug: { sentHeaders },
    };
  }

  return { ok: true as const, data: json, debug: { sentHeaders } };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // clientCustomerId = tas pats, ko tu mēģini lietot summary endpointā
    const clientCustomerIdRaw = searchParams.get("clientCustomerId");
    const loginCustomerIdRaw = searchParams.get("loginCustomerId");

    if (!clientCustomerIdRaw) {
      return NextResponse.json(
        { error: "MISSING_clientCustomerId" },
        { status: 400 }
      );
    }
    if (!loginCustomerIdRaw) {
      return NextResponse.json(
        { error: "MISSING_loginCustomerId" },
        { status: 400 }
      );
    }

    const clientCustomerId = String(clientCustomerIdRaw).replace(/\D/g, "");
    const loginCustomerId = String(loginCustomerIdRaw).replace(/\D/g, "");

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const conn = await prisma.googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!conn || !conn.refreshToken || conn.refreshToken === "PENDING_OAUTH") {
      return NextResponse.json(
        { error: "NOT_CONNECTED_TO_GOOGLE_ADS" },
        { status: 400 }
      );
    }

    const developerToken = pickEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!developerToken) {
      return NextResponse.json(
        { error: "MISSING_DEVELOPER_TOKEN" },
        { status: 500 }
      );
    }

    const tokenRes = await refreshAccessToken(conn.refreshToken);
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "ACCESS_TOKEN_ERROR", details: tokenRes },
        { status: 400 }
      );
    }

    // Šeit VAICĀJAM uz MCC pašu (customerId = loginCustomerId),
    // un headerī arī liekam login-customer-id = loginCustomerId.
    // Tas ļauj redzēt managera customer_client sarakstu.
    const query = `
      SELECT
        customer_client.client_customer,
        customer_client.level,
        customer_client.manager,
        customer_client.descriptive_name,
        customer_client.id
      FROM customer_client
      WHERE customer_client.client_customer = 'customers/${clientCustomerId}'
      LIMIT 1
    `.trim();

    const res = await googleAdsSearch({
      customerId: loginCustomerId,
      accessToken: tokenRes.accessToken,
      developerToken,
      loginCustomerId,
      query,
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "GOOGLE_ADS_API_ERROR",
          ...res,
          debug: {
            ...res.debug,
            loginCustomerId,
            clientCustomerId,
          },
        },
        { status: 400 }
      );
    }

    const row = res.data?.results?.[0]?.customerClient ?? null;

    return NextResponse.json({
      ok: true,
      found: Boolean(row),
      row,
      debug: {
        ...res.debug,
        loginCustomerId,
        clientCustomerId,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
