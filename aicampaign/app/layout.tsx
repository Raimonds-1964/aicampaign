import "./globals.css";
import type { Metadata } from "next";
import SiteChrome from "./components/SiteChrome";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "AI Google Ads",
  description: "No mājaslapas URL līdz strukturētai Google Ads kampaņai.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="lv"
      suppressHydrationWarning
      // ✅ inline: iedarbojas pirms CSS
      style={{ backgroundColor: "#000", colorScheme: "dark" }}
    >
      <body
        // ✅ inline: iedarbojas pirms CSS
        style={{ backgroundColor: "#000" }}
        className="min-h-screen"
      >
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
