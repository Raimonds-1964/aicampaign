import { NextResponse } from "next/server";

function mask(v?: string | null) {
  if (!v) return null;
  if (v.length <= 6) return v;
  return v.slice(0, 3) + "..." + v.slice(-3);
}

export async function GET() {
  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const rawLoginCid = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "";
  const loginCid = rawLoginCid.replace(/[^0-9]/g, "");

  return NextResponse.json({
    ok: true,
    env: {
      GOOGLE_ADS_DEVELOPER_TOKEN_mask: mask(devToken),
      GOOGLE_CLIENT_ID_mask: mask(clientId),
      GOOGLE_CLIENT_SECRET_mask: mask(clientSecret),
      GOOGLE_ADS_LOGIN_CUSTOMER_ID_raw: rawLoginCid || null,
      GOOGLE_ADS_LOGIN_CUSTOMER_ID_digits: loginCid || null,
    },
  });
}
