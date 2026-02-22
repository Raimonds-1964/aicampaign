"use client";

/**
 * Admin campaign details:
 * uses the shared CampaignDetails UI component.
 *
 * ✅ "View as manager" tiek rādīts pēc DB owner (AgencyCampaignOwner) ja store ownerId nav pieejams.
 */

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

  const storeOwnerId = (campaign as any)?.ownerId as string | undefined;
  const googleAdsHref = (campaign as any)?.googleAdsUrl ?? null;

  // ✅ DB owner fallback
  const [dbOwnerId, setDbOwnerId] = useState<string | null>(null);

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

        const data = (await r.json().catch(() => null)) as OwnerResp | null;
        if (!alive) return;

        if (!r.ok || !data || !("ok" in data) || !data.ok) {
          setDbOwnerId(null);
          return;
        }

        setDbOwnerId(data.ownerId ?? null);
      } catch {
        if (!alive) return;
        setDbOwnerId(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [campaignId]);

  const effectiveOwnerId =
    storeOwnerId && storeOwnerId !== ADMIN_OWNER_ID
      ? storeOwnerId
      : dbOwnerId && dbOwnerId !== ADMIN_OWNER_ID
      ? dbOwnerId
      : null;

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

  // ✅ Adminā rādām "View as manager" tikai, ja ir reāls manager ownerId
  const topRightLabel = effectiveOwnerId ? (
    <a
      className="text-sm font-semibold text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
      href={`/agency/manager/campaigns?managerId=${encodeURIComponent(
        effectiveOwnerId
      )}`}
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