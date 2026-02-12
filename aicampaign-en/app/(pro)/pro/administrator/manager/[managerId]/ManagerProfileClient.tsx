"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const btn =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition";

export default function ManagerProfileClient() {
  const params = useParams();
  const managerId = String((params as any)?.managerId ?? "");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 text-lg font-semibold">Manager profile</div>
      <div className="text-sm text-white/60">ID: {managerId}</div>

      <div className="mt-4">
        <Link href="/pro/administrator/manager" className={btn}>
          ← Back
        </Link>
      </div>
    </div>
  );
}
