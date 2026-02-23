"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  useManagerStore,
  managerSelectors,
  type Campaign,
} from "@/app/(agency)/agency/manager/_data/store";

import CampaignDetails from "@/app/(agency)/agency/shared/ui/CampaignDetails";

type MeResponse =
  | {
      ok: true;
      member: {
        id: string;
        role: "ADMIN" | "MANAGER";
        displayName: string | null;
        workspaceId: string;
        workspaceName: string | null;
      };
      user: { id: string; email: string };
    }
  | { error: string; details?: unknown };

export default function Client() {
  const params = useParams<{ accountId: string; campaignId: string }>();
  const accountId = params?.accountId ?? "";
  const campaignId = params?.campaignId ?? "";

  const router = useRouter();
  const s = useManagerStore();

  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch("/api/agency/me", { cache: "no-store" });
        const data = (await r.json()) as MeResponse;
        if (!alive) return;
        setMe(data);
      } catch (e) {
        if (!alive) return;
        setMe({ error: "ME_FETCH_FAILED", details: String(e) });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const account = useMemo(() => {
    const accounts = (managerSelectors as any).accounts?.(s) ?? [];
    return accounts.find((a: any) => String(a?.id) === String(accountId)) ?? null;
  }, [s, accountId]);

  const campaign = useMemo<Campaign | any>(() => {
    const byId = (managerSelectors as any).campaignById?.(s, campaignId);
    if (byId) return byId;

    const all = (managerSelectors as any).campaigns?.(s) ?? [];
    return (
      all.find(
        (c: any) =>
          String(c?.id) === String(campaignId) &&
          String(c?.accountId) === String(accountId)
      ) ?? null
    );
  }, [s, accountId, campaignId]);

  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  const fallbackHref = "/agency/manager/campaigns";

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router]);

  // Ja nav member -> nav piekļuves (nevis demo)
  if (me && "error" in me) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xl font-semibold">Nav piekļuves manager panelim</div>
          <div className="mt-2 text-white/60">
            Kļūda: <span className="font-mono">{me.error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CampaignDetails
      titlePrefix="Campaign details"
      accountId={accountId}
      campaignId={campaignId}
      campaign={campaign ?? null}
      accountName={account?.name ?? accountId}
      backHref="#"
      onBack={handleBack as any}
      googleAdsHref={googleAdsHref}
      topRightLabel={null}
    />
  );
}