import "./globals.css";
import type { Metadata } from "next";
import SiteChrome from "./components/SiteChrome";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "AI Google Ads",
  description: "From a website URL to a structured Google Ads campaign.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // ✅ inline: applied before CSS loads
      style={{ backgroundColor: "#000", colorScheme: "dark" }}
    >
      <body
        // ✅ inline: applied before CSS loads
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
