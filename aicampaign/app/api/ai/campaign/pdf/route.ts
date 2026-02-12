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
  };
  selected: {
    headlines: string[];
    descriptions: string[];
    keywords?: string[];
    negativeKeywords?: string[];
    sitelinks: { title: string; url: string }[];
  };
};

function clamp(s: any, max: number) {
  const v = String(s ?? "").trim();
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

// EN-only sanitizer: replaces non-WinAnsi chars (diacritics etc.)
function toWinAnsiSafe(input: string) {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics marks
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ""); // strip non-ASCII
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PdfBody;

    const campaignName = clamp(body.campaignName || "Campaign", 120);
    const url = clamp(body.input?.url || "", 300);

    const industry = clamp(body.input?.industry || "", 80);
    const goal = clamp(body.input?.goal || "", 60);
    const location = clamp(body.input?.location || "", 80);
    const language = clamp(body.input?.language || "en", 10);
    const dailyBudget = String(body.input?.dailyBudget ?? "");

    const headlines = (body.selected?.headlines || []).map((x) => clamp(x, 30)).slice(0, 6);
    const descriptions = (body.selected?.descriptions || []).map((x) => clamp(x, 90)).slice(0, 4);
    const keywords = (body.selected?.keywords || []).map((x) => clamp(x, 60)).slice(0, 25);
    const negativeKeywords = (body.selected?.negativeKeywords || []).map((x) => clamp(x, 60)).slice(0, 25);
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
    const line = 14;

    const draw = (t: string, size = textSize, indent = 0) => {
      const safe = toWinAnsiSafe(t);
      page.drawText(safe, {
        x: margin + indent,
        y,
        size,
        font: helvetica,
        color: rgb(0.08, 0.08, 0.08),
        maxWidth: width - margin * 2 - indent,
      });
      y -= line;
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

    draw(`Destination URL: ${url}`);
    draw(`Industry: ${industry || "-"}`);
    draw(`Goal: ${goal || "-"} | Location: ${location || "-"} | Language: ${language || "en"} | Budget: ${dailyBudget || "-"} EUR`);
    y -= 10;

    const section = (name: string) => {
      page.drawText(toWinAnsiSafe(name), {
        x: margin,
        y,
        size: 12,
        font: helvetica,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 18;
    };

    section("Headlines (<=30)");
    if (!headlines.length) draw("-");
    headlines.forEach((t, i) => wrap(`${i + 1}. ${t}`).forEach((ln) => draw(ln)));
    y -= 8;

    section("Descriptions (<=90)");
    if (!descriptions.length) draw("-");
    descriptions.forEach((t, i) => wrap(`${i + 1}. ${t}`).forEach((ln) => draw(ln)));
    y -= 8;

    section("Keywords");
    if (!keywords.length) draw("-");
    keywords.forEach((t, i) => wrap(`${i + 1}. ${t}`).forEach((ln) => draw(ln)));
    y -= 8;

    section("Negative keywords");
    if (!negativeKeywords.length) draw("-");
    negativeKeywords.forEach((t, i) => wrap(`${i + 1}. ${t}`).forEach((ln) => draw(ln)));
    y -= 8;

    section("Sitelinks (<=25)");
    if (!sitelinks.length) draw("-");
    sitelinks.forEach((s, i) => {
      wrap(`${i + 1}. ${s.title}`).forEach((ln) => draw(ln));
      wrap(`   ${s.url}`).forEach((ln) => draw(ln));
    });

    const bytes = await pdf.save();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="campaign-export.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "PDF error", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
