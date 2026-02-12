"use client";

import React from "react";

type PlanKey =
  | "easy"
  | "basic_monthly"
  | "basic_yearly"
  | "pro_monthly"
  | "pro_yearly"
  | "agency_monthly"
  | "agency_yearly";

type Props = {
  planKey: PlanKey;
  label: string;
  className?: string;
};

export default function CTAButton({ planKey, label, className }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      const data: { url?: string; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Checkout request failed.");
      }

      if (!data?.url) {
        throw new Error("No Stripe Checkout URL returned.");
      }

      // Always redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ??
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90 disabled:opacity-60"
        }
      >
        {loading ? "Redirecting…" : label}
      </button>

      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
