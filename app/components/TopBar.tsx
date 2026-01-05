"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = useMemo(
    () => [
      { label: "Sākums", href: "/" },
      { label: "Cenas", href: "/pricing" },
      { label: "Par mums", href: "/par-mums" },
      { label: "Noteikumi", href: "/noteikumi" },
      { label: "Kontakti", href: "/kontakti" },
    ],
    []
  );

  const isActive = (href: string) => pathname === href;

  // ✅ novērš “lēkāšanu”, ja klikšķini uz tās pašas lapas
  const onNavClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    setOpen(false);
  };

  const linkStyle = (active: boolean): React.CSSProperties => ({
    color: active ? "#2563eb" : "#334155",
    textDecoration: "none",
    fontWeight: active ? 900 : 800,
    padding: "10px 10px",
    borderRadius: 12,
    whiteSpace: "nowrap",
  });

  return (
    <header style={{ marginBottom: 18 }}>
      {/* ✅ ŠĪ ir “kaste” (nav full width fona) */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: 22,
          padding: "14px 18px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <Link
            href="/"
            aria-label="Sākums"
            onClick={(e) => onNavClick(e, "/")}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flex: "0 0 240px",
              width: 240,
              minWidth: 240,
            }}
          >
            <Image
              src="/ai-google-ads-logo.png"
              alt="AI Google Ads"
              width={240}
              height={48}
              priority
              style={{ display: "block", width: 240, height: "auto" }}
            />
          </Link>

          <nav
            className="topbar-desktop"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => onNavClick(e, item.href)}
                style={linkStyle(isActive(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label={open ? "Aizvērt izvēlni" : "Atvērt izvēlni"}
            onClick={() => setOpen((v) => !v)}
            className="topbar-mobile"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: 0,
              background: "white",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
            }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open && (
          <div
            className="topbar-mobile"
            style={{
              marginTop: 10,
              borderRadius: 18,
              background: "white",
              padding: 10,
              boxShadow: "0 18px 50px rgba(15,23,42,0.10)",
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              {nav.map((item) => (
                <Link
                  key={`m-${item.href}`}
                  href={item.href}
                  onClick={(e) => onNavClick(e, item.href)}
                  style={{ ...linkStyle(isActive(item.href)), display: "block" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          .topbar-mobile {
            display: none;
          }
          .topbar-desktop {
            display: flex;
          }
          @media (max-width: 860px) {
            .topbar-desktop {
              display: none;
            }
            .topbar-mobile {
              display: block;
            }
          }
          @media (max-width: 420px) {
            a[aria-label="Sākums"] {
              flex: 0 0 180px !important;
              width: 180px !important;
              min-width: 180px !important;
            }
            a[aria-label="Sākums"] img {
              width: 180px !important;
            }
          }
        `}</style>
      </div>
    </header>
  );
}
