"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type VerifyResponse =
  | { ok: true; ready: true; plan?: string }
  | { ok: true; ready: false }
  | { ok: false; error?: string };

export default function PricingSuccessClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const plan = useMemo(() => sp.get("plan") ?? "pro", [sp]);
  const sessionId = useMemo(() => sp.get("session_id") ?? "", [sp]);

  const [status, setStatus] = useState<"processing" | "ready" | "error">("processing");
  const [msg, setMsg] = useState<string>("Finalizing your access…");

  useEffect(() => {
    let alive = true;

    async function go() {
      // Ja nav session_id, turpinām kā iepriekš (fallback)
      if (!sessionId) {
        setTimeout(() => {
          if (!alive) return;
          router.replace(`/dashboard?success=1&plan=${encodeURIComponent(plan)}`);
        }, 900);
        return;
      }

      // Poll 20s max
      const started = Date.now();
      const maxMs = 20_000;

      while (alive && Date.now() - started < maxMs) {
        try {
          const res = await fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`, {
            cache: "no-store",
          });

          const data = (await res.json()) as VerifyResponse;

          if (data.ok && data.ready) {
            setStatus("ready");
            setMsg("✅ Done. Redirecting…");
            // replace, lai back poga neved atpakaļ uz success
            router.replace(`/dashboard?success=1&plan=${encodeURIComponent(plan)}`);
            return;
          }

          if (!data.ok) {
            setStatus("error");
            setMsg(data.error || "We received your payment, but setup is still processing.");
            // Ne-crash, tikai UI
            return;
          }

          // ok but not ready
          setMsg("Finalizing your access…");
        } catch (e: any) {
          setStatus("error");
          setMsg("We received your payment, but setup is still processing. Please refresh in a moment.");
          return;
        }

        // pagaidām 1s
        await new Promise((r) => setTimeout(r, 1000));
      }

      // timeout fallback — joprojām ne-crash
      setStatus("error");
      setMsg("We received your payment. Setup is still processing. Please open Dashboard or refresh shortly.");
    }

    go();
    return () => {
      alive = false;
    };
  }, [router, plan, sessionId]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white/90">✅ Payment successful</h1>
        <p className="mt-2 text-white/70">{msg}</p>

        {status === "error" ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black"
              onClick={() => router.replace(`/dashboard?success=1&plan=${encodeURIComponent(plan)}`)}
            >
              Open dashboard
            </button>
            <button
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        ) : null}

        {sessionId ? (
          <div className="mt-4 text-xs text-white/40 break-all">session_id: {sessionId}</div>
        ) : null}
      </div>
    </main>
  );
}
