import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

type PdfBody = {
  campaignName: string;
  input: {
    url: string;
    industry?: string;
    goal?: string;
    location?: string;
    language?: string;
    dailyBudget?: number | string;
    currency?: string; // optional override, defaults to USD
  };
  selected: {
    headlines: string[];
    descriptions: string[];
    keywords?: string[];
    negativeKeywords?: string[];
    sitelinks: { title: string; url: string }[];
  };
};

function clamp(value: unknown, max: number) {
  const v = String(value ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function wrap(text: string, maxChars = 92) {
  const out: string[] = [];
  let t = String(text ?? "").trim();

  while (t.length > maxChars) {
    let cut = t.lastIndexOf(" ", maxChars);
    if (cut < 30) cut = maxChars;
    out.push(t.slice(0, cut).trim());
    t = t.slice(cut).trim();
  }
  if (t) out.push(t);
  return out;
}

/**
 * pdf-lib StandardFonts.Helvetica uses WinAnsi encoding.
 * To avoid encoding errors, we normalize and strip unsupported characters.
 */
function toWinAnsiSafe(input: string) {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritic marks
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ""); // strip non-ASCII
}

function parseBudget(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  // allow "123", "123.45", "123,45", "$123.45"
  const normalized = raw.replace(/[$€£,\s]/g, (m) => (m === "," ? "." : ""));
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function formatDailyBudgetUSD(amount: number | null, currency: string) {
  if (amount == null) return "-";
  const iso = (currency || "USD").toUpperCase();

  // Prefer USD formatting for US market, but keep ISO fallback.
  if (iso === "USD") {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(amount) + "/day";
    } catch {
      return `$${amount.toFixed(2)}/day`;
    }
  }

  // Generic currency fallback
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: iso,
        maximumFractionDigits: 2,
      }).format(amount) + "/day"
    );
  } catch {
    return `${amount.toFixed(2)} ${iso}/day`;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PdfBody;

    const campaignName = clamp(body.campaignName || "Campaign", 120);
    const finalUrl = clamp(body.input?.url || "", 300);

    const industry = clamp(body.input?.industry || "", 80);
    const goal = clamp(body.input?.goal || "", 80);
    const location = clamp(body.input?.location || "", 80);
    const language = clamp(body.input?.language || "en-US", 10);

    const currency = clamp(body.input?.currency || "USD", 3);
    const dailyBudgetNum = parseBudget(body.input?.dailyBudget);
    const dailyBudgetLabel = formatDailyBudgetUSD(dailyBudgetNum, currency);

    const headlines = (body.selected?.headlines || [])
      .map((x) => clamp(x, 30))
      .slice(0, 6);

    const descriptions = (body.selected?.descriptions || [])
      .map((x) => clamp(x, 90))
      .slice(0, 4);

    const keywords = (body.selected?.keywords || [])
      .map((x) => clamp(x, 60))
      .slice(0, 25);

    const negativeKeywords = (body.selected?.negativeKeywords || [])
      .map((x) => clamp(x, 60))
      .slice(0, 25);

    const sitelinks = (body.selected?.sitelinks || [])
      .map((s) => ({ title: clamp(s?.title, 25), url: clamp(s?.url, 300) }))
      .slice(0, 4);

    const pdf = await PDFDocument.create();
    const helvetica = await pdf.embedFont(StandardFonts.Helvetica);

    const page = pdf.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const margin = 48;
    let y = height - margin;

    const titleSize = 18;
    const textSize = 11;
    const lineHeight = 14;

    const drawLine = (t: string, size = textSize, indent = 0) => {
      const safe = toWinAnsiSafe(t);
      page.drawText(safe, {
        x: margin + indent,
        y,
        size,
        font: helvetica,
        color: rgb(0.08, 0.08, 0.08),
        maxWidth: width - margin * 2 - indent,
      });
      y -= lineHeight;
    };

    const drawSection = (name: string) => {
      page.drawText(toWinAnsiSafe(name), {
        x: margin,
        y,
        size: 12,
        font: helvetica,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 18;
    };

    // Title
    page.drawText(toWinAnsiSafe(campaignName), {
      x: margin,
      y,
      size: titleSize,
      font: helvetica,
      color: rgb(0.05, 0.05, 0.05),
    });
    y -= 24;

    drawLine(`Final URL: ${finalUrl || "-"}`);
    drawLine(`Industry: ${industry || "-"}`);
    drawLine(
      `Goal: ${goal || "-"} | Location: ${location || "-"} | Language: ${
        language || "en-US"
      } | Daily budget: ${dailyBudgetLabel}`
    );
    y -= 10;

    drawSection("Headlines (30 characters max)");
    if (!headlines.length) drawLine("-");
    headlines.forEach((t, i) =>
      wrap(`${i + 1}. ${t}`).forEach((ln) => drawLine(ln))
    );
    y -= 8;

    drawSection("Descriptions (90 characters max)");
    if (!descriptions.length) drawLine("-");
    descriptions.forEach((t, i) =>
      wrap(`${i + 1}. ${t}`).forEach((ln) => drawLine(ln))
    );
    y -= 8;

    drawSection("Keywords");
    if (!keywords.length) drawLine("-");
    keywords.forEach((t, i) =>
      wrap(`${i + 1}. ${t}`).forEach((ln) => drawLine(ln))
    );
    y -= 8;

    drawSection("Negative Keywords");
    if (!negativeKeywords.length) drawLine("-");
    negativeKeywords.forEach((t, i) =>
      wrap(`${i + 1}. ${t}`).forEach((ln) => drawLine(ln))
    );
    y -= 8;

    drawSection("Sitelink Assets (25 characters max)");
    if (!sitelinks.length) drawLine("-");
    sitelinks.forEach((s, i) => {
      wrap(`${i + 1}. ${s.title}`).forEach((ln) => drawLine(ln));
      wrap(`   ${s.url}`).forEach((ln) => drawLine(ln));
    });

    const bytes = await pdf.save();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="google-ads-campaign-export.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "PDF generation error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
