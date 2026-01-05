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

function digitsOnly(v: string | null) {
  if (!v) return null;
  const d = String(v).replace(/\D/g, "");
  return d.length ? d : null;
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
      contentType: r.headers.get("content-type"),
      requestedUrl: url,
      responsePreview: json ?? text.slice(0, 700),
      debug: { sentHeaders },
    };
  }

  return { ok: true as const, data: json, debug: { sentHeaders } };
}

async function getCustomerInfo(params: {
  customerId: string;
  accessToken: string;
  developerToken: string;
  loginCustomerId?: string | null;
}) {
  const q = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.manager
    FROM customer
    LIMIT 1
  `.trim();

  return googleAdsSearch({
    customerId: params.customerId,
    accessToken: params.accessToken,
    developerToken: params.developerToken,
    loginCustomerId: params.loginCustomerId ?? null,
    query: q,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "MISSING_DATES" }, { status: 400 });
    }

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

    if (!conn.selectedCustomerId) {
      return NextResponse.json(
        { error: "NO_SELECTED_CUSTOMER" },
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

    const accessibleSet = new Set(acc.customerIds);

    const selectedId = digitsOnly(String(conn.selectedCustomerId))!;
    if (!accessibleSet.has(selectedId)) {
      return NextResponse.json(
        {
          error: "SELECTED_NOT_ACCESSIBLE",
          debug: { selectedId, accessibleCustomerIds: acc.customerIds },
        },
        { status: 400 }
      );
    }

    // noskaidrojam selected konta tipu
    const selectedInfo = await getCustomerInfo({
      customerId: selectedId,
      accessToken: tokenRes.accessToken,
      developerToken,
      loginCustomerId: null,
    });

    if (!selectedInfo.ok) {
      return NextResponse.json(
        {
          error: "SELECTED_CUSTOMER_LOOKUP_FAILED",
          ...selectedInfo,
        },
        { status: 400 }
      );
    }

    const selectedCustomer = selectedInfo.data?.results?.[0]?.customer ?? null;
    const selectedIsManager = Boolean(selectedCustomer?.manager);

    // Ja selected ir manager, jāatrod aktīvs client konts
    let targetCustomerId = selectedId;
    let loginCustomerId: string | null = null;

    if (selectedIsManager) {
      const clientFromQuery = digitsOnly(searchParams.get("clientCustomerId"));

      // 1) ja query norādīts, ņem to
      // 2) citādi mēģini atrast pirmo accessible kontu, kas nav selected
      const candidateIds = [
        ...(clientFromQuery ? [clientFromQuery] : []),
        ...acc.customerIds.filter((id) => id !== selectedId),
      ].filter(Boolean);

      // izvēlamies pirmo, kurš ir "manager=false" un pieejams
      let chosenClient: string | null = null;
      let lastFailure: any = null;

      for (const cid of candidateIds) {
        if (!accessibleSet.has(cid)) continue;

        const info = await getCustomerInfo({
          customerId: cid,
          accessToken: tokenRes.accessToken,
          developerToken,
          loginCustomerId: selectedId, // caur manager
        });

        if (!info.ok) {
          lastFailure = info;
          continue;
        }

        const c = info.data?.results?.[0]?.customer ?? null;
        if (c && c.manager === false) {
          chosenClient = cid;
          break;
        }
      }

      if (!chosenClient) {
        return NextResponse.json(
          {
            error: "NO_ENABLED_CLIENT_UNDER_MANAGER",
            message:
              "Izvēlētais konts ir manager (MCC), bet nav neviena aktīva klienta konta ar pieeju. Aktivizē klienta kontu Google Ads (billing/activation) vai pieslēdz citu klientu.",
            debug: {
              selectedId,
              selectedIsManager,
              accessibleCustomerIds: acc.customerIds,
              triedClientCustomerId: clientFromQuery ?? null,
              lastFailure,
              hintNext:
                "Atver /api/google-ads/customers un izvēlies kontu ar ok:true un manager:false",
            },
          },
          { status: 400 }
        );
      }

      targetCustomerId = chosenClient;
      loginCustomerId = selectedId;
    }

    // metrikas vaicājums
    const query = `
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.ctr,
        metrics.average_cpc
      FROM customer
      WHERE segments.date BETWEEN '${from}' AND '${to}'
    `.trim();

    const adsRes = await googleAdsSearch({
      customerId: targetCustomerId,
      accessToken: tokenRes.accessToken,
      developerToken,
      loginCustomerId,
      query,
    });

    if (!adsRes.ok) {
      return NextResponse.json(
        {
          error: "GOOGLE_ADS_API_ERROR",
          ...adsRes,
          debug: {
            ...adsRes.debug,
            selectedCustomerId: selectedId,
            selectedIsManager,
            targetCustomerId,
            loginCustomerIdUsed: loginCustomerId,
            accessibleCustomerIds: acc.customerIds,
          },
        },
        { status: 400 }
      );
    }

    const row = adsRes.data?.results?.[0]?.metrics ?? {};

    return NextResponse.json({
      metrics: {
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        costMicros: Number(row.costMicros ?? row.cost_micros ?? 0),
        conversions: Number(row.conversions ?? 0),
        ctr: row.ctr ?? null,
        averageCpc: row.averageCpc ?? row.average_cpc ?? null,
      },
      selectedCustomerId: selectedId,
      targetCustomerId,
      loginCustomerId,
      from,
      to,
      debug: {
        ...adsRes.debug,
        selectedIsManager,
        accessibleCustomerIds: acc.customerIds,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
