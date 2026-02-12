"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="px-4 py-2 rounded-md border"
      >
        Iziet
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="px-4 py-2 rounded-md border"
    >
      Ieiet ar Google
    </button>
  );
}
