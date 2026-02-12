"use client";

import Link from "next/link";

const btn =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition";

export default function AdminProfileClient() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 text-lg font-semibold">Administrator profils</div>

      <Link href="/pro/administrator/manager" className={btn}>
        ← Atpakaļ uz manageriem
      </Link>
    </div>
  );
}
