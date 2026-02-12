"use client";

import AdminTopBar from "./AdminTopBar";

export default function AdminTopBarShell() {
  // ✅ TopBar platums = tāds pats kā saturs (max-w-6xl)
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      <AdminTopBar />
    </div>
  );
}
