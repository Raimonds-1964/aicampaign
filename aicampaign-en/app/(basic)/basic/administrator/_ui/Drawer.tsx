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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // Body scroll lock
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop: clicking here closes the drawer */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel: stop click propagation so it doesn't close on mobile */}
      <div
        className="absolute right-0 top-0 h-full w-full max-w-[920px] overflow-hidden rounded-none border-l border-white/10 bg-[#0b0f16] shadow-2xl md:rounded-l-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="text-base font-semibold text-white">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-52px)] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
