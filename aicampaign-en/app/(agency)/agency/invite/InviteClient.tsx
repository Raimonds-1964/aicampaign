"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const card =
  "mx-auto mt-10 w-[min(680px,calc(100vw-24px))] rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-sm";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const muted = "text-white/60";

export default function InviteClient() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") ?? "", [sp]);

  const { status } = useSession();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (status !== "authenticated") return;

    (async () => {
      setBusy(true);
      setError(null);

      try {
        const res = await fetch("/api/agency/invites/accept", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "UNKNOWN_ERROR");
          setBusy(false);
          return;
        }

        window.location.href = "/agency/manager/accounts";
      } catch (e: any) {
        setError(e?.message ?? "NETWORK_ERROR");
        setBusy(false);
      }
    })();
  }, [token, status]);

  if (!token) {
    return (
      <div className={card}>
        <div className="text-xl font-semibold">Invalid invite link</div>
        <div className={`mt-2 ${muted}`}>Missing token.</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    const callbackUrl = `/agency/invite?token=${encodeURIComponent(token)}`;

    return (
      <div className={card}>
        <div className="text-xl font-semibold">Accept invite</div>
        <div className={`mt-2 ${muted}`}>
          Sign in to accept this invite.
        </div>

        <div className="mt-5">
          <button
            className={btn}
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={card}>
      <div className="text-xl font-semibold">Accept invite</div>
      <div className={`mt-2 ${muted}`}>{busy ? "Checking your invite…" : "Ready."}</div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
          Error: <span className="font-mono">{error}</span>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="mt-4 text-sm text-white/60">Loading session…</div>
      ) : null}
    </div>
  );
}