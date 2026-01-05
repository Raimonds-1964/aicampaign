import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { googleAdsFetch } from "@/lib/googleAdsFetch";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "MISSING_DATES" }, { status: 400 });
    }

    const connection = await prisma.googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!connection?.selectedCustomerId) {
      return NextResponse.json({ error: "NO_SELECTED_CUSTOMER" }, { status: 400 });
    }

    const version = process.env.GOOGLE_ADS_API_VERSION || "v22";
    const path = `/${version}/customers/${connection.selectedCustomerId}/googleAds:search`;

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${from}' AND '${to}'
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `;

    const result = await googleAdsFetch(path, {
      accessToken: connection.refreshToken,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      body: { query },
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "GOOGLE_ADS_API_ERROR", ...result },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (e) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e) },
      { status: 500 }
    );
  }
}

