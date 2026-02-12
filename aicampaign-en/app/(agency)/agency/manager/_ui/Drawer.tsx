"use client";

import React, { useEffect } from "react";

export default function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay (click outside closes) */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* Panel (clicking inside does NOT close) */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-3xl bg-[#0F1320]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0F1320] px-4 py-3">
          <div className="text-sm font-semibold text-white">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
          >
            Close
          </button>
        </div>

        <div className="h-full overflow-auto p-4 text-white">{children}</div>
      </div>
    </div>
  );
}
