"use client";

/**
 * Manager campaign details:
 * uses the shared CampaignDetails UI component.
 * Keeps Admin/Manager view synced.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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

  const sp = useSearchParams();
  const router = useRouter();
  const s = useManagerStore();

  const [me, setMe] = useState<MeResponse | null>(null);

  // Admin "View as manager" pārliek managerId URLā, lai detaļas saglabā kontekstu
  const managerIdFromUrl = sp.get("managerId") ?? "";

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

  // Try to resolve from manager store (robust even if selectors are minimal)
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

  /**
   * Browser-friendly back behavior with a safe fallback:
   * - if there's history: router.back()
   * - if opened directly:
   *    - ADMIN + ?managerId => back to campaigns with same ?managerId
   *    - MANAGER => back to normal manager campaigns
   */
  const fallbackHref = useMemo(() => {
    if (me && "ok" in me && me.ok && me.member.role === "ADMIN" && managerIdFromUrl) {
      return `/agency/manager/campaigns?managerId=${encodeURIComponent(managerIdFromUrl)}`;
    }
    return "/agency/manager/campaigns";
  }, [me, managerIdFromUrl]);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [router, fallbackHref]);

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
      // No topRightLabel needed in manager view (Admin has "View as manager")
      topRightLabel={null}
    />
  );
}