"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      style={{
        padding: "10px 16px",
        fontSize: 14,
        fontWeight: "bold",
        backgroundColor: "#111827",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Turpināt ar Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/pricing" })}
      style={{
        padding: "10px 16px",
        fontSize: 14,
        backgroundColor: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Iziet
    </button>
  );
}
