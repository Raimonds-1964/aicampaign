"use client";

import { useMemo, useState } from "react";
import type { CampaignDraft } from "../state/types";

type Props = { draft: CampaignDraft };

type Row = { text: string; included: boolean };
type LinkRow = { title: string; url: string; included: boolean };

const MAX_HEADLINE = 30;
const MAX_DESC = 90;
const MAX_SITELINK = 25;

const MIN_HEADLINES = 3;
const MIN_DESCRIPTIONS = 2;

function smartTrim(raw: string, max: number) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (v.length <= max) return v;

  const slice = v.slice(0, max);
  const lastBreak = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("."),
    slice.lastIndexOf(","),
    slice.lastIndexOf(";"),
    slice.lastIndexOf(":"),
    slice.lastIndexOf("–"),
    slice.lastIndexOf("-")
  );
  if (lastBreak >= Math.floor(max * 0.65)) return slice.slice(0, lastBreak).trim();
  return slice.trim();
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, content: string, mime: string) {
  downloadBlob(filename, new Blob([content], { type: mime }));
}

function toCsv(rows: Array<Record<string, string | number | boolean>>) {
  const headers = Object.keys(rows[0] || {});
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc((r as any)[h])).join(",")),
  ].join("\n");
}

function toSpreadsheetML(sheetName: string, rows: string[][]) {
  const esc = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const xmlRows = rows
    .map(
      (r) =>
        `<Row>${r
          .map((c) => `<Cell><Data ss:Type="String">${esc(c)}</Data></Cell>`)
          .join("")}</Row>`
    )
    .join("");

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${esc(sheetName)}">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <div className={over ? "text-xs text-rose-300" : "text-xs text-white/45"}>
      {value.length}/{max}
      {over ? " (par garu)" : ""}
    </div>
  );
}

function SectionTable({
  title,
  rows,
  maxLen,
  onEdit,
  onToggle,
  toggleLabel,
}: {
  title: string;
  rows: Row[];
  maxLen: number;
  onEdit: (idx: number) => void;
  onToggle: (idx: number) => void;
  toggleLabel?: (idx: number) => string;
}) {
  const card = "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur";
  const th = "text-xs font-semibold text-white/60";
  const td = "text-sm text-white/90";
  const btn =
    "h-9 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10";

  return (
    <div className={card}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white/80">{title}</div>
        <div className="text-xs text-white/50">Max {maxLen} simboli</div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className={`w-12 px-3 py-2 text-left ${th}`}>#</th>
              <th className={`px-3 py-2 text-left ${th}`}>Teksts</th>
              <th className={`w-56 px-3 py-2 text-right ${th}`}>Darbības</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className={`px-3 py-2 ${td}`}>{i + 1}</td>
                <td className={`px-3 py-2 ${td}`}>
                  <div className={r.included ? "" : "line-through text-white/40"}>{r.text}</div>
                  <Counter value={r.text} max={maxLen} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button className={btn} type="button" onClick={() => onEdit(i)}>
                      Labot
                    </button>
                    <button className={btn} type="button" onClick={() => onToggle(i)}>
                      {toggleLabel ? toggleLabel(i) : r.included ? "Noņemt" : "Pievienot"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-3 py-3 text-sm text-white/50" colSpan={3}>
                  Nav datu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeywordTable({
  title,
  rows,
  onEdit,
  onToggle,
  onAdd,
}: {
  title: string;
  rows: Row[];
  onEdit: (idx: number) => void;
  onToggle: (idx: number) => void;
  onAdd: () => void;
}) {
  const card = "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur";
  const th = "text-xs font-semibold text-white/60";
  const td = "text-sm text-white/90";
  const btn =
    "h-9 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10";

  return (
    <div className={card}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white/80">{title}</div>
        <button className={btn} type="button" onClick={onAdd}>
          Pievienot
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className={`w-12 px-3 py-2 text-left ${th}`}>#</th>
              <th className={`px-3 py-2 text-left ${th}`}>Atslēgvārds</th>
              <th className={`w-56 px-3 py-2 text-right ${th}`}>Darbības (iekļaut)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className={`px-3 py-2 ${td}`}>{i + 1}</td>
                <td className={`px-3 py-2 ${td}`}>
                  <div className={r.included ? "" : "line-through text-white/40"}>{r.text}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <button className={btn} type="button" onClick={() => onEdit(i)}>
                      Labot
                    </button>
                    <button className={btn} type="button" onClick={() => onToggle(i)}>
                      {r.included ? "Noņemt" : "Pievienot"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-3 py-3 text-sm text-white/50" colSpan={3}>
                  Nav datu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CampaignResults({ draft }: Props) {
  const assets = useMemo(() => draft.campaign.assets, [draft]);

  const [campaignName, setCampaignName] = useState<string>(draft.campaign.name);

  const [headlines, setHeadlines] = useState<Row[]>(
    (assets.headlines || []).slice(0, 6).map((t) => ({ text: String(t ?? ""), included: true }))
  );
  const [descriptions, setDescriptions] = useState<Row[]>(
    (assets.descriptions || []).slice(0, 4).map((t) => ({ text: String(t ?? ""), included: true }))
  );

  const [keywords, setKeywords] = useState<Row[]>(
    (assets.keywords || []).map((t) => ({ text: String(t ?? "").trim(), included: true }))
  );
  const [negativeKeywords, setNegativeKeywords] = useState<Row[]>(
    (assets.negativeKeywords || []).map((t) => ({ text: String(t ?? "").trim(), included: true }))
  );

  const [sitelinks, setSitelinks] = useState<LinkRow[]>(
    (assets.sitelinks || []).slice(0, 4).map((s) => ({
      title: String((s as any)?.title ?? ""),
      url: String((s as any)?.url ?? ""),
      included: true,
    }))
  );

  const includedHeadlines = headlines.filter((x) => x.included).map((x) => x.text);
  const includedDescriptions = descriptions.filter((x) => x.included).map((x) => x.text);
  const includedKeywords = keywords.filter((x) => x.included).map((x) => x.text);
  const includedNegativeKeywords = negativeKeywords.filter((x) => x.included).map((x) => x.text);
  const includedSitelinks = sitelinks.filter((x) => x.included).map((x) => ({ title: x.title, url: x.url }));

  const headlinesIncludedCount = includedHeadlines.length;
  const descIncludedCount = includedDescriptions.length;

  const minOk = headlinesIncludedCount >= MIN_HEADLINES && descIncludedCount >= MIN_DESCRIPTIONS;

  const card = "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur";
  const btn =
    "h-9 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10";
  const btnPrimary =
    "h-10 rounded-xl bg-white px-4 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed";

  function guardMinRemove(section: "h" | "d") {
    if (section === "h" && headlinesIncludedCount <= MIN_HEADLINES) {
      alert(`Nedrīkst būt mazāk par ${MIN_HEADLINES} virsrakstiem.`);
      return false;
    }
    if (section === "d" && descIncludedCount <= MIN_DESCRIPTIONS) {
      alert(`Nedrīkst būt mazāk par ${MIN_DESCRIPTIONS} aprakstiem.`);
      return false;
    }
    return true;
  }

  function editRow(section: "h" | "d", idx: number) {
    const max = section === "h" ? MAX_HEADLINE : MAX_DESC;
    const cur = section === "h" ? headlines[idx].text : descriptions[idx].text;

    const next = window.prompt(`Labot tekstu (max ${max}):`, cur);
    if (next == null) return;

    const raw = String(next).trim();
    const final = raw.length > max ? smartTrim(raw, max) : raw;
    if (raw.length > max) alert(`Teksts bija par garu. Piedāvāts saīsināts variants (<=${max}).`);

    if (section === "h") setHeadlines((p) => p.map((r, i) => (i === idx ? { ...r, text: final } : r)));
    else setDescriptions((p) => p.map((r, i) => (i === idx ? { ...r, text: final } : r)));
  }

  function toggleRow(section: "h" | "d", idx: number) {
    if (section === "h") {
      const isOn = headlines[idx].included;
      if (isOn && !guardMinRemove("h")) return;
      setHeadlines((p) => p.map((r, i) => (i === idx ? { ...r, included: !r.included } : r)));
    } else {
      const isOn = descriptions[idx].included;
      if (isOn && !guardMinRemove("d")) return;
      setDescriptions((p) => p.map((r, i) => (i === idx ? { ...r, included: !r.included } : r)));
    }
  }

  function editKeyword(which: "k" | "n", idx: number) {
    const cur = which === "k" ? keywords[idx].text : negativeKeywords[idx].text;
    const next = window.prompt("Labot atslēgvārdu:", cur);
    if (next == null) return;
    const val = String(next).trim();
    if (!val) return;

    if (which === "k") setKeywords((p) => p.map((r, i) => (i === idx ? { ...r, text: val } : r)));
    else setNegativeKeywords((p) => p.map((r, i) => (i === idx ? { ...r, text: val } : r)));
  }

  function toggleKeyword(which: "k" | "n", idx: number) {
    if (which === "k") setKeywords((p) => p.map((r, i) => (i === idx ? { ...r, included: !r.included } : r)));
    else setNegativeKeywords((p) => p.map((r, i) => (i === idx ? { ...r, included: !r.included } : r)));
  }

  function addKeyword(which: "k" | "n") {
    const next = window.prompt(which === "k" ? "Pievienot atslēgvārdu:" : "Pievienot negatīvo atslēgvārdu:", "");
    if (next == null) return;
    const val = String(next).trim();
    if (!val) return;

    if (which === "k") setKeywords((p) => [...p, { text: val, included: true }]);
    else setNegativeKeywords((p) => [...p, { text: val, included: true }]);
  }

  function editSitelink(idx: number) {
    const cur = sitelinks[idx];
    const nextTitle = window.prompt(`Labot saites nosaukumu (max ${MAX_SITELINK}):`, cur.title);
    if (nextTitle == null) return;

    const rawTitle = String(nextTitle).trim();
    const title = rawTitle.length > MAX_SITELINK ? smartTrim(rawTitle, MAX_SITELINK) : rawTitle;
    if (rawTitle.length > MAX_SITELINK) alert(`Nosaukums bija par garu. Piedāvāts saīsināts variants (<=${MAX_SITELINK}).`);

    const nextUrl = window.prompt("Labot saites URL:", cur.url);
    if (nextUrl == null) return;

    setSitelinks((p) => p.map((r, i) => (i === idx ? { ...r, title, url: String(nextUrl).trim() } : r)));
  }

  function toggleSitelink(idx: number) {
    setSitelinks((p) => p.map((r, i) => (i === idx ? { ...r, included: !r.included } : r)));
  }

  function ensureMinOrAlert() {
    if (headlinesIncludedCount < MIN_HEADLINES) {
      alert(`Nepietiek virsrakstu: vajag vismaz ${MIN_HEADLINES}.`);
      return false;
    }
    if (descIncludedCount < MIN_DESCRIPTIONS) {
      alert(`Nepietiek aprakstu: vajag vismaz ${MIN_DESCRIPTIONS}.`);
      return false;
    }
    return true;
  }

  async function exportPdf() {
    if (!ensureMinOrAlert()) return;

    const payload = {
      campaignName: campaignName.trim() || "Kampaņa",
      input: {
        url: draft.input.uri,
        industry: draft.input.industry ?? "",
        goal: draft.input.goal ?? "",
        location: draft.input.location ?? "",
        language: draft.input.language ?? "",
        dailyBudget: draft.input.dailyBudget ?? "",
      },
      selected: {
        headlines: includedHeadlines.map((t) => (t.length > MAX_HEADLINE ? smartTrim(t, MAX_HEADLINE) : t)).slice(0, 6),
        descriptions: includedDescriptions.map((t) => (t.length > MAX_DESC ? smartTrim(t, MAX_DESC) : t)).slice(0, 4),
        keywords: includedKeywords,
        negativeKeywords: includedNegativeKeywords,
        sitelinks: includedSitelinks
          .map((s) => ({
            title: s.title.length > MAX_SITELINK ? smartTrim(s.title, MAX_SITELINK) : s.title,
            url: s.url,
          }))
          .slice(0, 4),
      },
    };

    const res = await fetch("/api/ai/campaign/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert("PDF kļūda: " + txt.slice(0, 800));
      return;
    }

    const blob = await res.blob();
    downloadBlob("campaign-export.pdf", blob);
  }

  function exportHtml() {
    if (!ensureMinOrAlert()) return;

    const html = `<!doctype html>
<html><head><meta charset="utf-8" />
<title>${campaignName}</title></head>
<body style="font-family:Arial,sans-serif;padding:24px">
<h1 style="margin:0 0 8px">${campaignName}</h1>
<div style="color:#444;margin-bottom:16px">
URL: ${draft.input.uri}<br/>
Nozare: ${draft.input.industry ?? ""}<br/>
Mērķis: ${draft.input.goal ?? ""} · Lokācija: ${draft.input.location ?? ""} · Valoda: ${draft.input.language ?? ""} · Budžets: ${draft.input.dailyBudget ?? ""} $
</div>

<h2>Virsraksti (<=30)</h2>
<ul>${includedHeadlines.map((t) => `<li>${t}</li>`).join("")}</ul>

<h2>Apraksti (<=90)</h2>
<ul>${includedDescriptions.map((t) => `<li>${t}</li>`).join("")}</ul>

<h2>Atslēgvārdi</h2>
<ul>${includedKeywords.map((t) => `<li>${t}</li>`).join("")}</ul>

<h2>Negatīvie atslēgvārdi</h2>
<ul>${includedNegativeKeywords.map((t) => `<li>${t}</li>`).join("")}</ul>

<h2>Vietnes saites (<=25)</h2>
<ul>${includedSitelinks.map((s) => `<li>${s.title}<br/><code>${s.url}</code></li>`).join("")}</ul>
</body></html>`;

    downloadText("campaign-export.html", html, "text/html;charset=utf-8");
  }

  function exportCsv() {
    if (!ensureMinOrAlert()) return;

    const rows: Array<Record<string, any>> = [];
    rows.push({ type: "meta", index: "", text: "campaign_name", url: campaignName });
    rows.push({ type: "meta", index: "", text: "url", url: draft.input.uri });
    rows.push({ type: "meta", index: "", text: "industry", url: draft.input.industry ?? "" });
    rows.push({ type: "meta", index: "", text: "goal", url: draft.input.goal ?? "" });
    rows.push({ type: "meta", index: "", text: "location", url: draft.input.location ?? "" });
    rows.push({ type: "meta", index: "", text: "language", url: draft.input.language ?? "" });
    rows.push({ type: "meta", index: "", text: "daily_budget", url: String(draft.input.dailyBudget ?? "") });

    includedHeadlines.forEach((t, i) => rows.push({ type: "headline", index: i + 1, text: t, url: "" }));
    includedDescriptions.forEach((t, i) => rows.push({ type: "description", index: i + 1, text: t, url: "" }));
    includedKeywords.forEach((t, i) => rows.push({ type: "keyword", index: i + 1, text: t, url: "" }));
    includedNegativeKeywords.forEach((t, i) => rows.push({ type: "negative_keyword", index: i + 1, text: t, url: "" }));
    includedSitelinks.forEach((s, i) => rows.push({ type: "sitelink", index: i + 1, text: s.title, url: s.url }));

    downloadText("campaign-export.csv", toCsv(rows), "text/csv;charset=utf-8");
  }

  function exportXls() {
    if (!ensureMinOrAlert()) return;

    const rows: string[][] = [
      ["type", "index", "text", "url"],
      ["meta", "", "campaign_name", campaignName],
      ["meta", "", "url", draft.input.uri],
      ["meta", "", "industry", draft.input.industry ?? ""],
      ["meta", "", "goal", draft.input.goal ?? ""],
      ["meta", "", "location", draft.input.location ?? ""],
      ["meta", "", "language", draft.input.language ?? ""],
      ["meta", "", "daily_budget", String(draft.input.dailyBudget ?? "")],
      ...includedHeadlines.map((t, i) => ["headline", String(i + 1), t, ""]),
      ...includedDescriptions.map((t, i) => ["description", String(i + 1), t, ""]),
      ...includedKeywords.map((t, i) => ["keyword", String(i + 1), t, ""]),
      ...includedNegativeKeywords.map((t, i) => ["negative_keyword", String(i + 1), t, ""]),
      ...includedSitelinks.map((s, i) => ["sitelink", String(i + 1), s.title, s.url]),
    ];

    downloadText("campaign-export.xls", toSpreadsheetML("Campaign Export", rows), "application/vnd.ms-excel");
  }

  function exportToAccount() {
    alert("Eksportēt kontā: nākamais solis — pieslēgsim kontu/Agency store vai Google Ads API.");
  }

  const th = "text-xs font-semibold text-white/60";
  const td = "text-sm text-white/90";
  const sitelinkBtn =
    "h-9 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10";

  return (
    <div className="mt-6 space-y-4">
      {!minOk ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          Minimālie limiti: vismaz <b>{MIN_HEADLINES}</b> virsraksti un vismaz <b>{MIN_DESCRIPTIONS}</b> apraksti.
        </div>
      ) : null}

      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[280px]">
            <div className="text-sm text-white/60">Rezultāts</div>

            <div className="mt-2 text-sm text-white/60">Kampaņas nosaukums</div>
            <input
              className="mt-2 w-full max-w-xl rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Kampaņas nosaukums..."
            />

            <div className="mt-2 text-sm text-white/60">
              URL: {draft.input.uri} · Nozare: {draft.input.industry ?? "—"} · Lokācija:{" "}
              {draft.input.location ?? "—"} · Valoda: {draft.input.language ?? "—"} · Budžets:{" "}
              {draft.input.dailyBudget ?? "—"} $
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className={btnPrimary} type="button" onClick={exportToAccount}>
              Eksportēt kontā
            </button>
          </div>
        </div>
      </div>

      <SectionTable
        title="Virsraksti (6)"
        rows={headlines}
        maxLen={MAX_HEADLINE}
        onEdit={(i) => editRow("h", i)}
        onToggle={(i) => toggleRow("h", i)}
      />

      <SectionTable
        title="Apraksti (4)"
        rows={descriptions}
        maxLen={MAX_DESC}
        onEdit={(i) => editRow("d", i)}
        onToggle={(i) => toggleRow("d", i)}
      />

      <KeywordTable title="Atslēgvārdi" rows={keywords} onAdd={() => addKeyword("k")} onEdit={(i) => editKeyword("k", i)} onToggle={(i) => toggleKeyword("k", i)} />
      <KeywordTable title="Negatīvie atslēgvārdi" rows={negativeKeywords} onAdd={() => addKeyword("n")} onEdit={(i) => editKeyword("n", i)} onToggle={(i) => toggleKeyword("n", i)} />

      <div className={card}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white/80">Vietnes saites (4)</div>
          <div className="text-xs text-white/50">Nosaukums max {MAX_SITELINK} simboli</div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className={`w-12 px-3 py-2 text-left ${th}`}>#</th>
                <th className={`px-3 py-2 text-left ${th}`}>Nosaukums</th>
                <th className={`px-3 py-2 text-left ${th}`}>URL</th>
                <th className={`w-56 px-3 py-2 text-right ${th}`}>Darbības</th>
              </tr>
            </thead>
            <tbody>
              {sitelinks.map((r, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className={`px-3 py-2 ${td}`}>{i + 1}</td>
                  <td className={`px-3 py-2 ${td}`}>
                    <div className={r.included ? "" : "line-through text-white/40"}>{r.title}</div>
                    <Counter value={r.title} max={MAX_SITELINK} />
                  </td>
                  <td className={`px-3 py-2 ${td}`}>
                    <span className={r.included ? "" : "line-through text-white/40"}>{r.url}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button className={sitelinkBtn} type="button" onClick={() => editSitelink(i)}>
                        Labot
                      </button>
                      <button className={sitelinkBtn} type="button" onClick={() => toggleSitelink(i)}>
                        {r.included ? "Noņemt" : "Pievienot"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sitelinks.length ? (
                <tr>
                  <td className="px-3 py-3 text-sm text-white/50" colSpan={4}>
                    Nav datu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/60">Eksports: tikai <b>iekļautie</b> teksti un parametri.</div>

          <div className="flex flex-wrap items-center gap-2">
            <button className={btn} type="button" onClick={exportPdf} disabled={!minOk}>
              PDF
            </button>
            <button className={btn} type="button" onClick={exportHtml} disabled={!minOk}>
              HTML
            </button>
            <button className={btn} type="button" onClick={exportCsv} disabled={!minOk}>
              CSV
            </button>
            <button className={btn} type="button" onClick={exportXls} disabled={!minOk}>
              XLSX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
