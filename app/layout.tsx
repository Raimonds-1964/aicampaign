import "./globals.css";
import { TopBar } from "./components/TopBar";
import { Footer } from "./components/Footer";

const MAX_W = 1200;
const GUTTER = 18; // sānu atstarpe (droši arī mobilajiem)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <head>
        {/* ✅ Drošs box-sizing fix (pat ja globals.css kādreiz neielādējas kā vajag) */}
        <style>{`
          html { box-sizing: border-box; }
          *, *::before, *::after { box-sizing: inherit; }
        `}</style>
      </head>

      <body style={{ margin: 0, background: "#fff", color: "#0f172a" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ✅ VIENS wrapperis visam, lai TopBar nekad nebūtu “īss” */}
          <div
            style={{
              maxWidth: MAX_W,
              margin: "0 auto",
              padding: `26px ${GUTTER}px 0`,
              width: "100%",
            }}
          >
            <TopBar />
          </div>

          {/* ✅ Arī saturs ir tajā pašā platumā */}
          <main
            style={{
              flex: 1,
              maxWidth: MAX_W,
              margin: "0 auto",
              padding: `0 ${GUTTER}px`,
              width: "100%",
            }}
          >
            {children}
          </main>

          {/* ✅ Un footer tajā pašā platumā */}
          <div
            style={{
              maxWidth: MAX_W,
              margin: "0 auto",
              padding: `0 ${GUTTER}px`,
              width: "100%",
            }}
          >
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
