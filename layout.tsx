import "./globals.css";
import type { Metadata } from "next";
import { Container } from "./components/Container";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "AI Google Ads",
  description: "No mājaslapas URL līdz strukturētai Google Ads kampaņai.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body style={{ margin: 0, background: "#ffffff", color: "#0f172a" }}>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>{children}</div>

          <Container>
            <Footer />
          </Container>
        </div>
      </body>
    </html>
  );
}
