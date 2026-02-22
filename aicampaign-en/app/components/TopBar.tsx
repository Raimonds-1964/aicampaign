"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

type ActiveKey = "home" | "pricing" | "how" | "other";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export function TopBar({ active = "other" }: { active?: ActiveKey }) {
  const pathname = usePathname() ?? "/";
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false); // mobile nav
  const [accountOpen, setAccountOpen] = useState(false); // account dropdown

  const nav = useMemo(
    () => [
      { key: "home" as const, label: "Home", href: "/" },
      { key: "pricing" as const, label: "Pricing", href: "/pricing" },
      { key: "how" as const, label: "How It Works", href: "/how-it-works" },
      { key: "other" as const, label: "About", href: "/about" },
      { key: "other" as const, label: "Terms", href: "/terms" },
      { key: "other" as const, label: "Contact", href: "/contact" },
    ],
    []
  );

  const isActive = (item: { key: ActiveKey; href: string }) => {
    if (active !== "other") return active === item.key;
    return pathname === item.href;
  };

  async function doSignIn() {
    setOpen(false);
    setAccountOpen(false);

    // after login return to current page (or pricing if current is too deep)
    const cb = pathname?.startsWith("/") ? pathname : "/pricing";

    await signIn("google", { callbackUrl: cb });
  }

  async function doSignOut() {
    setOpen(false);
    setAccountOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  async function switchGoogleAccount() {
    setOpen(false);
    setAccountOpen(false);

    // 1) logout without redirect
    await signOut({ redirect: false });

    // 2) sign-in again forcing account picker
    const cb = pathname?.startsWith("/") ? pathname : "/pricing";
    await signIn("google", { callbackUrl: cb }, { prompt: "select_account" });
  }

  const linkClass = (on: boolean) =>
    cx(
      "rounded-xl px-3 py-2 text-sm font-extrabold transition whitespace-nowrap",
      on ? "text-blue-600" : "text-slate-700 hover:bg-slate-100"
    );

  const btnPrimary =
    "rounded-2xl bg-black px-4 py-2 text-sm font-black text-white hover:bg-black/90 transition";
  const btnGhost =
    "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50 transition";

  const isLoggedIn = !!session?.user?.email;

  return (
    <header className="w-full">
      <div className="w-full rounded-[22px] bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* LOGO */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/ai-google-ads-logo.png"
              alt="AI Google Ads"
              width={190}
              height={52}
              priority
              className="h-10 w-auto md:h-[52px]"
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(isActive(item))}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT SIDE (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {status === "loading" ? null : isLoggedIn ? (
              <>
                <Link href="/start" className={btnPrimary}>
                  Open app
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                  >
                    Account ▾
                  </button>

                  {accountOpen ? (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                      <div className="px-3 py-2 text-xs font-bold text-slate-500">
                        {session?.user?.email}
                      </div>

                      <button
                        type="button"
                        onClick={switchGoogleAccount}
                        className="w-full text-left rounded-xl px-3 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50"
                      >
                        Switch Google account
                      </button>

                      <button
                        type="button"
                        onClick={doSignOut}
                        className="w-full text-left rounded-xl px-3 py-2 text-sm font-bold text-slate-900 hover:bg-slate-50"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <button type="button" onClick={doSignIn} className={btnPrimary}>
                Sign in
              </button>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden grid place-items-center h-11 w-11 rounded-2xl border border-slate-200 bg-white font-black"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open ? (
          <div className="md:hidden mt-3 rounded-2xl bg-white p-2 border border-slate-200">
            <div className="grid gap-1">
              {nav.map((item) => (
                <Link
                  key={`m-${item.href}`}
                  href={item.href}
                  className={cx(linkClass(isActive(item)), "block")}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              {status === "loading" ? null : isLoggedIn ? (
                <div className="grid gap-2">
                  <Link href="/start" className={btnPrimary} onClick={() => setOpen(false)}>
                    Open app
                  </Link>

                  <button type="button" className={btnGhost} onClick={switchGoogleAccount}>
                    Switch Google account
                  </button>

                  <button type="button" className={btnGhost} onClick={doSignOut}>
                    Sign out
                  </button>
                </div>
              ) : (
                <button type="button" onClick={doSignIn} className={btnPrimary}>
                  Sign in
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
