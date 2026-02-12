import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeUrl(input: string) {
  try {
    const u = new URL(input);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function pickCharset(contentType: string | null | undefined) {
  if (!contentType) return null;
  const m = /charset\s*=\s*["']?([^;"'\s]+)/i.exec(contentType);
  return m?.[1]?.trim() ?? null;
}

function sniffMetaCharset(html: string) {
  // <meta charset="utf-8">
  const m1 = /<meta[^>]+charset\s*=\s*["']?\s*([a-z0-9\-_]+)\s*["']?/i.exec(html);
  if (m1?.[1]) return m1[1].trim();

  // <meta http-equiv="Content-Type" content="text/html; charset=...">
  const m2 =
    /<meta[^>]+http-equiv\s*=\s*["']content-type["'][^>]*content\s*=\s*["'][^"']*charset\s*=\s*([a-z0-9\-_]+)[^"']*["']/i.exec(
      html
    );
  if (m2?.[1]) return m2[1].trim();

  return null;
}

function normalizeText(s: string) {
  return s
    .replace(/\u00AD/g, "") // soft hyphen
    .replace(/\s+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeNoise(line: string) {
  const l = line.toLowerCase();

  const badPhrases = [
    // commerce / UI chrome
    "cart",
    "shopping cart",
    "basket",
    "filters",
    "filter",
    "sort",
    "search",
    "log in",
    "login",
    "sign in",
    "sign up",
    "register",
    "account",
    "profile",
    "language",
    "cookie",
    "cookies",
    "privacy",
    "terms",
    "policy",
    "gdpr",
    "subscribe",
    "newsletter",
    "wishlist",
    "compare",
    "shipping",
    "checkout",
    "payment",
    "returns",
  ];

  if (badPhrases.some((p) => l.includes(p))) return true;
  if (line.length < 25) return true;

  // treat lots of non-latin symbols as noise
  const nonLetters = line.replace(/[a-z0-9\s.,:;!?'"“”()\-/]/gi, "");
  if (nonLetters.length >= Math.max(6, Math.floor(line.length * 0.12))) return true;

  const seps = (line.match(/[|•»›>]/g) ?? []).length;
  if (seps >= 3) return true;

  return false;
}

function removeLikelyChrome($: cheerio.CheerioAPI) {
  $("script, style, noscript, svg, canvas, iframe, form, input, button, select, textarea").remove();
  $("header, nav, footer, aside").remove();

  const badRe =
    /(cookie|consent|banner|modal|popup|overlay|drawer|cart|basket|checkout|filter|filters|sort|login|register|account|profile|language|lang|newsletter|subscribe|gdpr|privacy|terms|legal|breadcrumb|breadcrumbs|pagination|pager)/i;

  $("[id], [class]").each((_, el) => {
    const id = ($(el).attr("id") ?? "").toString();
    const cls = ($(el).attr("class") ?? "").toString();
    if (badRe.test(id) || badRe.test(cls)) {
      $(el).remove();
    }
  });
}

function extractMainText($: cheerio.CheerioAPI) {
  const roots = [
    $("main").first(),
    $("article").first(),
    $('[role="main"]').first(),
    $(".main").first(),
    $("#main").first(),
    $("body").first(),
  ].filter((c) => c && c.length > 0);

  const root = roots[0] ?? $("body");

  const h1 = normalizeText(root.find("h1").first().text() || "");
  const h2s = root
    .find("h2")
    .slice(0, 8)
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean);

  const paras = root
    .find("p, li")
    .map((_, el) => normalizeText($(el).text()))
    .get()
    .filter(Boolean)
    .filter((t) => !looksLikeNoise(t));

  const chosen: string[] = [];
  for (const p of paras) {
    if (chosen.length >= 10) break;
    if (chosen.some((x) => x.toLowerCase() === p.toLowerCase())) continue;
    chosen.push(p);
  }

  return { h1, h2s, paras: chosen };
}

function decodeHtmlEntitiesBasic(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#([0-9]+);/g, (_, num) => {
      const code = parseInt(num, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url") ?? "";
  const url = safeUrl(raw);

  if (!url) {
    return NextResponse.json({ ok: false, error: "Invalid URL." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    const buf = Buffer.from(await res.arrayBuffer());

    // 1) charset from header
    let charset = pickCharset(contentType);

    // 2) if header missing, sniff meta charset (via quick utf-8 decode)
    const htmlUtf8 = iconv.decode(buf, "utf-8");
    const metaCharset = sniffMetaCharset(htmlUtf8);
    if (!charset && metaCharset) charset = metaCharset;

    // 3) decode using chosen charset
    let html = charset ? iconv.decode(buf, charset) : htmlUtf8;

    // Fallback: try a common Western encoding if replacement chars are excessive
    const replacementCount = (html.match(/�/g) ?? []).length;
    if (replacementCount > 20 && !/1252|latin|iso/i.test(charset ?? "")) {
      const alt = iconv.decode(buf, "windows-1252");
      const altBad = (alt.match(/�/g) ?? []).length;
      if (altBad < replacementCount) html = alt;
    }

    const $ = cheerio.load(html);

    removeLikelyChrome($);

    const title = normalizeText($("title").first().text() || "");
    const metaDescription =
      normalizeText(
        $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content") ||
          ""
      ) || "";

    const { h1, h2s, paras } = extractMainText($);

    const parts = [
      title ? `Title: ${title}` : "",
      metaDescription ? `Description: ${metaDescription}` : "",
      h1 ? `H1: ${h1}` : "",
      h2s.length ? `H2: ${h2s.join(" | ")}` : "",
      paras.length ? `Content:\n${paras.join("\n\n")}` : "",
    ].filter(Boolean);

    const text = decodeHtmlEntitiesBasic(normalizeText(parts.join("\n\n")));

    return NextResponse.json({
      ok: true,
      url,
      contentType,
      textLength: text.length,
      textPreview: text.slice(0, 700),
      title,
      metaDescription,
      h1,
      h2: h2s,
      text,
      charset: charset ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Fetch failed." },
      { status: 500 }
    );
  }
}
