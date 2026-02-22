"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useAdminStore,
  adminSelectors,
  type Manager,
} from "@/app/(agency)/agency/administrator/_data/store";

const card =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm overflow-hidden";
const btn =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition";
const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";

export default function ManagerClient() {
  const s = useAdminStore();

  const managers = useMemo(() => adminSelectors.managers(s), [s]);
  const freeCampaignsCount = useMemo(
    () => adminSelectors.freeCampaigns(s).length,
    [s]
  );

  const [managerName, setManagerName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  async function createInvite() {
    const email = inviteEmail.trim();
    const name = managerName.trim();

    if (!email) return;

    setInviteBusy(true);
    setInviteError(null);
    setInviteUrl(null);
    setCopied(false);

    try {
      const res = await fetch("/api/agency/invites/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          managerName: name || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setInviteError(data?.error ?? "UNKNOWN_ERROR");
        return;
      }

      setInviteUrl(data?.inviteUrl ?? null);
    } catch {
      setInviteError("NETWORK_ERROR");
    } finally {
      setInviteBusy(false);
    }
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-2xl font-semibold text-white">Managers</div>
          <div className="mt-2 text-white/60">
            Administrator profile + full manager directory.
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-white/55">Administrator</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              Administrator
            </div>
            <div className="mt-2 text-white/70">
              Unassigned campaigns:{" "}
              <span className="font-semibold text-white">
                {freeCampaignsCount}
              </span>
            </div>
          </div>

          <Link className={btn} href="/agency/administrator/managers/admin">
            Open
          </Link>
        </div>
      </div>

      <div className="h-6" />

      <div className={card}>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">
              Invite manager access
            </div>
            <div className="mt-1 text-white/55">
              Create a link for a manager’s Google email to grant access to the
              Manager panel.
            </div>
            <div className="mt-1 text-xs text-white/45">
              ⚠️ Invite pieņemšanai managerim jāielogojas ar tieši to pašu e-pastu, kuru tu ievadi šeit.
            </div>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className={input}
              placeholder="Manager name"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />
            <input
              className={input}
              placeholder="manager@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button
              className={btn}
              type="button"
              disabled={inviteBusy}
              onClick={createInvite}
            >
              {inviteBusy ? "Creating…" : "Create link"}
            </button>
          </div>
        </div>

        {inviteUrl ? (
          <div className="border-t border-white/10 px-6 py-4">
            <div className="text-sm text-white/60">Invite link</div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="break-all rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white/80">
                {inviteUrl}
              </div>

              <div className="relative">
                <button className={btn} type="button" onClick={copyInvite}>
                  Copy
                </button>

                {copied ? (
                  <div className="pointer-events-none absolute right-0 top-[-38px] rounded-lg border border-white/15 bg-black/80 px-3 py-1.5 text-xs text-white">
                    Copied
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {inviteError ? (
          <div className="border-t border-white/10 px-6 py-4">
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
              Error: <span className="font-mono">{inviteError}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="h-6" />

      <div className={card}>
        <div className="border-b border-white/10 p-6">
          <div className="text-lg font-semibold text-white">All managers</div>
          <div className="mt-1 text-sm text-white/55">
            This list is loaded from the database (same in every browser/device).
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="text-white/60">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {managers.map((m: Manager) => (
                <tr key={m.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="mt-1 font-mono text-xs text-white/45">{m.id}</div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link className={btn} href={`/agency/administrator/managers/${m.id}`}>
                        Open
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {managers.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-white/60" colSpan={2}>
                    No managers.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}