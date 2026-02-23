"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAdminStore,
  adminSelectors,
  ADMIN_OWNER_ID,
} from "@/app/(agency)/agency/administrator/_data/store";

import CampaignDetails from "@/app/(agency)/agency/shared/ui/CampaignDetails";

type OwnerResp =
  | { ok: true; ownerId: string | null }
  | { error: string; details?: unknown };

export default function Client() {
  const params = useParams<{ accountId: string; campaignId: string }>();
  const accountId = params?.accountId ?? "";
  const campaignId = params?.campaignId ?? "";

  const router = useRouter();
  const s = useAdminStore();

  const account = useMemo(
    () => adminSelectors.accountById(s, accountId),
    [s, accountId]
  );

  const campaign = useMemo(
    () => adminSelectors.campaignById(s, campaignId),
    [s, campaignId]
  );

  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/agency/admin/campaign-owner", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ campaignId }),
          cache: "no-store",
        });
        const data = (await r.json()) as OwnerResp;
        if (!alive) return;
        if ("ok" in data && data.ok) setOwnerId(data.ownerId);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [campaignId]);

  const fallbackHref = `/agency/administrator/accounts/${encodeURIComponent(
    accountId
  )}/campaigns`;

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

  const topRightLabel =
    ownerId && ownerId !== ADMIN_OWNER_ID ? (
      <a
        className="text-sm font-semibold text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
        href={`/agency/manager/campaigns?managerId=${encodeURIComponent(ownerId)}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        View as manager ↗
      </a>
    ) : null;

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
      topRightLabel={topRightLabel}
    />
  );
}