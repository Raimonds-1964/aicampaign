import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeUrl(input: string) {
  try {
    const u = new URL(input);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    return u;
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
  const m1 = /<meta[^>]+charset\s*=\s*["']?\s*([a-z0-9\-_]+)\s*["']?/i.exec(html);
  if (m1?.[1]) return m1[1].trim();

  const m2 =
    /<meta[^>]+http-equiv\s*=\s*["']content-type["'][^>]*content\s*=\s*["'][^"']*charset\s*=\s*([a-z0-9\-_]+)[^"']*["']/i.exec(
      html
    );
  if (m2?.[1]) return m2[1].trim();

  return null;
}

function normalizeText(s: string) {
  return s.replace(/\u00AD/g, "").replace(/\s+/g, " ").trim();
}

function decodeEntitiesBasic(s: string) {
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

function clampWordBoundary(s: string, max: number) {
  const t = normalizeText(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace >= Math.floor(max * 0.6)) return cut.slice(0, lastSpace).trim();
  return t.slice(0, max).trim();
}

function isBadSitelinkText(t: string) {
  const l = t.toLowerCase();

  // Google Ads sitelinks should be meaningful navigational intents, not legal/auth/language/account items
  const badExact = new Set([
    "contact",
    "contacts",
    "contact us",
    "privacy policy",
    "privacy",
    "terms",
    "terms of service",
    "terms & conditions",
    "cookies",
    "about",
    "about us",
    "faq",
    "help",
    "support",
    "shipping",
    "payment",
    "returns",
    "my account",
    "account",
    "profile",
    "login",
    "log in",
    "sign in",
    "sign up",
    "register",
    "language",
    "english",
    "español",
    "français",
  ]);
  if (badExact.has(l)) return true;

  const badContains = [
    "cookie",
    "consent",
    "privacy",
    "gdpr",
    "terms",
    "policy",
    "legal",
    "account",
    "profile",
    "login",
    "sign in",
    "register",
    "language",
    "newsletter",
    "subscribe",
  ];
  if (badContains.some((p) => l.includes(p))) return true;

  if (t.length < 4) return true;
  if (t.length > 60) return true;

  // US/EN focus: require at least one Latin letter
  if (!/[a-z]/i.test(t)) return true;

  return false;
}

function removeChrome($: cheerio.CheerioAPI) {
  $("script, style, noscript, svg, canvas, iframe, form, input, button, select, textarea").remove();
  $("header, nav, footer, aside").remove();

  const badRe =
    /(cookie|consent|banner|modal|popup|overlay|drawer|cart|basket|checkout|filter|filters|sort|login|register|account|profile|language|lang|newsletter|subscribe|gdpr|privacy|terms|legal|breadcrumb|breadcrumbs|pagination|pager)/i;

  $("[id], [class]").each((_, el) => {
    const id = ($(el).attr("id") ?? "").toString();
    const cls = ($(el).attr("class") ?? "").toString();
    if (badRe.test(id) || badRe.test(cls)) $(el).remove();
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url") ?? "";
  const u = safeUrl(raw);

  if (!u) {
    return NextResponse.json({ ok: false, error: "Invalid URL." }, { status: 400 });
  }

  try {
    const res = await fetch(u.toString(), {
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

    let charset = pickCharset(contentType);
    const utf8 = iconv.decode(buf, "utf-8");
    const metaCharset = sniffMetaCharset(utf8);
    if (!charset && metaCharset) charset = metaCharset;

    let html = charset ? iconv.decode(buf, charset) : utf8;

    // Fallback: try a common Western encoding if replacement chars are excessive
    const repl = (html.match(/�/g) ?? []).length;
    if (repl > 20 && !/1252|latin|iso/i.test(charset ?? "")) {
      const alt = iconv.decode(buf, "windows-1252");
      if ((alt.match(/�/g) ?? []).length < repl) html = alt;
    }

    const $ = cheerio.load(html);
    removeChrome($);

    const baseOrigin = u.origin;

    const root =
      $("main").first().length
        ? $("main").first()
        : $("article").first().length
          ? $("article").first()
          : $('[role="main"]').first().length
            ? $('[role="main"]').first()
            : $("body").first();

    const rawLinks = root
      .find("a[href]")
      .map((_, el) => {
        const href = ($(el).attr("href") ?? "").toString().trim();
        const aria = ($(el).attr("aria-label") ?? "").toString().trim();
        const text = normalizeText($(el).text() || "");
        return { href, text: aria || text };
      })
      .get()
      .filter((x) => x.href);

    const cleaned: { text: string; href: string }[] = [];
    const seenText = new Set<string>();
    const seenHref = new Set<string>();

    for (const l of rawLinks) {
      if (cleaned.length >= 20) break;

      let href: string;
      try {
        href = new URL(l.href, baseOrigin).toString();
      } catch {
        continue;
      }

      // Internal links only
      try {
        const hu = new URL(href);
        if (hu.origin !== baseOrigin) continue;
      } catch {
        continue;
      }

      let text = decodeEntitiesBasic(l.text);
      text = normalizeText(text);

      // Strip URLs/domains from the anchor text
      text = text.replace(/\bhttps?:\/\/\S+/gi, "").trim();
      text = text.replace(/\bwww\.[^\s]+/gi, "").trim();

      if (isBadSitelinkText(text)) continue;

      const finalText = clampWordBoundary(text, 25);
      if (isBadSitelinkText(finalText)) continue;

      const tkey = finalText.toLowerCase();
      if (seenText.has(tkey)) continue;

      const hkey = href.replace(/#.*$/, "");
      if (seenHref.has(hkey)) continue;

      seenText.add(tkey);
      seenHref.add(hkey);
      cleaned.push({ text: finalText, href });
    }

    return NextResponse.json({
      ok: true,
      url: u.toString(),
      count: cleaned.length,
      links: cleaned.slice(0, 12),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Fetch failed." },
      { status: 500 }
    );
  }
}
