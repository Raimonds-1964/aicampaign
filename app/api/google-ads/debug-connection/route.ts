import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function mask(v: string | null | undefined) {
  if (!v) return null;
  if (v.length <= 6) return "***";
  return v.slice(0, 3) + "..." + v.slice(-3);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { error: "NOT_AUTHENTICATED", sessionPreview: session ?? null },
        { status: 401 }
      );
    }

    const conn = await prisma.googleAdsConnection.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: "desc" },
    });

    if (!conn) {
      return NextResponse.json(
        { error: "NOT_CONNECTED_TO_GOOGLE_ADS", email },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      email,
      connection: {
        id: conn.id,
        userEmail: conn.userEmail,
        createdAt: conn.createdAt,
        refreshToken_mask: mask(conn.refreshToken),
        selectedCustomerId: (conn as any).selectedCustomerId ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "SERVER_CRASH", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
