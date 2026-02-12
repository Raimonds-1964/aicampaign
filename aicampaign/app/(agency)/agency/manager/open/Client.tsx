"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Client() {
  const sp = useSearchParams();
  const to = sp.get("to");

  useEffect(() => {
    const target = to ? decodeURIComponent(to) : "/agency/manager/kampanas";
    // replace, lai "Atpakaļ" neved uz open lapu
    window.location.replace(target);
  }, [to]);

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
      <div className="opacity-80 text-sm">Atver manager paneli…</div>
    </div>
  );
}
