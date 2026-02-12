"use client";

import { usePathname } from "next/navigation";
import { Container } from "./components/Container";
import { Footer } from "./components/Footer";
import { TopBar } from "./components/TopBar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTopBar = pathname.startsWith("/dashboard");

  const TOPBAR_HEIGHT = 92;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOPBAR – tikai ārpus dashboard */}
      {!hideTopBar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Container>
            <div style={{ paddingTop: 18, paddingBottom: 12 }}>
              <TopBar />
            </div>
          </Container>
        </div>
      )}

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          width: "100%",
          paddingTop: hideTopBar ? 0 : TOPBAR_HEIGHT,
        }}
      >
        <Container>{children}</Container>
      </main>

      {/* FOOTER – arī slēpjam dashboardā */}
      {!hideTopBar && (
        <footer style={{ width: "100%", background: "#ffffff" }}>
          <Container>
            <Footer />
          </Container>
        </footer>
      )}
    </div>
  );
}
