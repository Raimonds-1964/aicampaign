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

async function listAccessibleCustomers(params: {
  accessToken: string;
  developerToken: string;
}) {
  const { accessToken, developerToken } = params;

  const r = await fetch(
    "https://googleads.googleapis.com/v22/customers:listAccessibleCustomers",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": developerToken,
      },
    }
  );

  const text = await r.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  if (!r.ok) {
    return {
      ok: false as const,
      status: r.status,
      responsePreview: json ?? text.slice(0, 700),
    };
  }

  const resourceNames: string[] = json?.resourceNames ?? [];
  const customerIds = resourceNames
    .map((rn) => rn.split("/")[1])
    .filter(Boolean);

  return { ok: true as const, customerIds, resourceNames };
}

async function googleAdsSearch(params: {
  customerId: string;
  accessToken: string;
  developerToken: string;
  query: string;
}) {
  const { customerId, accessToken, developerToken, query } = params;

  const url = `https://googleads.googleapis.com/v22/customers/${customerId}/googleAds:search`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await r.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}

  if (!r.ok) {
    return {
      ok: false as const,
      status: r.status,
      requestedUrl: url,
      responsePreview: json ?? text.slice(0, 700),
    };
  }

  return { ok: true as const, data: json };
}

export async function GET() {
  try {
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

    const acc = await listAccessibleCustomers({
      accessToken: tokenRes.accessToken,
      developerToken,
    });

    if (!acc.ok) {
      return NextResponse.json(
        { error: "ACCESSIBLE_CUSTOMERS_ERROR", details: acc },
        { status: 400 }
      );
    }

    // Par katru accessible customer pamēģinām nolasīt customer laukus.
    // Ja konts nav enabled, šis var atgriezt 403 CUSTOMER_NOT_ENABLED.
    const results: any[] = [];

    for (const id of acc.customerIds) {
      const q = `
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.manager
        FROM customer
        LIMIT 1
      `.trim();

      const res = await googleAdsSearch({
        customerId: id,
        accessToken: tokenRes.accessToken,
        developerToken,
        query: q,
      });

      if (!res.ok) {
        // saglabājam statusu un kļūdu (lai UI var parādīt)
        results.push({
          id,
          ok: false,
          status: res.status,
          error: res.responsePreview?.error?.details?.[0]?.errors?.[0]?.errorCode
            ? res.responsePreview.error.details[0].errors[0].errorCode
            : null,
          message: res.responsePreview?.error?.message ?? "UNKNOWN_ERROR",
        });
        continue;
      }

      const row = res.data?.results?.[0]?.customer ?? null;

      results.push({
        id,
        ok: true,
        customer: row,
      });
    }

    return NextResponse.json({
      ok: true,
      customers: results,
      selectedCustomerId: conn.selectedCustomerId ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
