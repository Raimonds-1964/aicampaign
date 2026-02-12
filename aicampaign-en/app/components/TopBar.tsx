"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type ActiveKey = "home" | "pricing" | "how" | "other";

export function TopBar({ active = "other" }: { active?: ActiveKey }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

  const linkStyle = (isOn: boolean): React.CSSProperties => ({
    color: isOn ? "#2563eb" : "#334155",
    textDecoration: "none",
    fontWeight: isOn ? 900 : 800,
    padding: "10px 10px",
    borderRadius: 12,
    whiteSpace: "nowrap",
  });

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
              <Link
                key={item.href}
                href={item.href}
                style={linkStyle(isActive(item))}
              >
                {item.label}
              </Link>
            ))}
          </nav>

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
        {open && (
          <div className="md:hidden mt-3 rounded-2xl bg-white p-2 border border-slate-200">
            <div className="grid gap-1">
              {nav.map((item) => (
                <Link
                  key={`m-${item.href}`}
                  href={item.href}
                  style={{ ...linkStyle(isActive(item)), display: "block" }}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
