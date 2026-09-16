import * as cheerio from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";

import { containsDateRange, findDateRanges, findSeasonYearHint, type YearHint } from "./dates";
import {
  findCatalogMatch,
  findCatalogTitleInText,
  normalizeTitle,
  type CatalogTitle,
} from "./match";

// cheerio doesn't re-export domhandler's node type; recover it from a signature that uses it.
type AnyNode = Parameters<typeof cheerio.contains>[0];

export type RawRun = {
  title: string;
  start?: Date;
  end?: Date;
  sourceUrl: string;
  snippet: string;
  /** Catalog row the title resolved to, if any. */
  match?: CatalogTitle;
};

/** Per-theatre overrides stored in `theatres.scrapeConfig`. */
export type ScrapeConfig = {
  /** Selector for one show card. */
  item?: string;
  /** Selector for the title, relative to the card. */
  title?: string;
  /** Selector for the dates, relative to the card. */
  dates?: string;
  /** Always crawl linked show pages, even when the season page yields runs. */
  follow?: boolean;
};

export function parseScrapeConfig(value: unknown): ScrapeConfig | undefined {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const pick = (k: string) => (typeof v[k] === "string" && v[k] ? (v[k] as string) : undefined);
  return {
    item: pick("item"),
    title: pick("title"),
    dates: pick("dates"),
    follow: v.follow === true,
  };
}

const CARD_MAX_CHARS = 800;
const TITLE_MAX_CHARS = 90;
const CTA_WORDS =
  /^(tickets?|buy( tickets)?|learn more|more info|read more|get tickets|subscribe|donate|details|info|book now|on sale|sold out|opens|closes|upcoming( events| shows)?|events|now playing|coming soon|next up|what'?s on|on stage|more info for .*|(fall|spring|summer|winter|holiday|youth|family) (show|musical|production|series)|.*\b(season|subscription|series)\b.*)$/i;
const LOOKS_LIKE_DATE =
  /^(?:(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?,?\s*)?(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}|\d{1,2}\/\d{1,2})\b/i;
const CREDIT_WORDS =
  /\b(directed|written|produced|presented|sponsored|choreographed|adapted|conceived)\s+by\b|\b(music|lyrics|book)\s+(and|&)\s+(music|lyrics|book)\b|\bmusical direction\b/i;
const NOISE_TAGS = "script, style, noscript, svg, iframe, template, nav, footer, header, form";

type ExtractOptions = {
  baseUrl: string;
  catalog: CatalogTitle[];
  config?: ScrapeConfig;
  now?: Date;
};

export function extractRuns(html: string, opts: ExtractOptions): RawRun[] {
  const $ = cheerio.load(html);
  $(NOISE_TAGS).remove();
  const pageText = collapse($("body").text());
  const hint = findSeasonYearHint(pageText) ?? findSeasonYearHint($("title").text());

  let runs = extractJsonLd($, opts);
  if (runs.length === 0 && opts.config?.item) runs = extractBySelectors($, opts, hint);
  if (runs.length === 0) runs = extractGeneric($, opts, hint);
  return dedupe(dropSectionHeadings(runs)).map((r) => ({
    ...r,
    match: findCatalogMatch(r.title, opts.catalog),
  }));
}

/** A "title" shared by 3+ runs with different dates is a section heading, not a show. */
function dropSectionHeadings(runs: RawRun[]): RawRun[] {
  const starts = new Map<string, Set<string>>();
  for (const r of runs) {
    const key = normalizeTitle(r.title);
    if (!starts.has(key)) starts.set(key, new Set());
    starts.get(key)!.add(r.start?.toISOString() ?? "");
  }
  return runs.filter((r) => (starts.get(normalizeTitle(r.title))?.size ?? 0) < 3);
}

/** Single show page (followed link): one run named by og:title / h1. */
export function extractSinglePage(html: string, opts: ExtractOptions): RawRun | undefined {
  const $ = cheerio.load(html);
  $(NOISE_TAGS).remove();
  const fromLd = extractJsonLd($, opts)[0];
  if (fromLd) return { ...fromLd, match: findCatalogMatch(fromLd.title, opts.catalog) };

  const title = cleanTitle(
    $('meta[property="og:title"]').attr("content") ?? $("h1").first().text() ?? $("title").text()
  );
  if (!title) return undefined;
  const text = collapse($("body").text());
  const hint = findSeasonYearHint(text);
  const range = pickRange(findDateRanges(text, hint, opts.now));
  return {
    title,
    start: range?.start,
    end: range?.end,
    sourceUrl: opts.baseUrl,
    snippet: range?.raw ?? text.slice(0, 160),
    match: findCatalogMatch(title, opts.catalog),
  };
}

/** Same-host links that look like individual show/event pages. */
export function collectShowLinks(html: string, baseUrl: string, limit = 20): string[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;
    let url: URL;
    try {
      url = new URL(href, base);
    } catch {
      return;
    }
    if (url.host !== base.host) return;
    if (
      !/\/(shows?|events?|productions?|current[_-]events|whats-on|on-stage|performances?)\/[^/]+/i.test(
        url.pathname
      )
    )
      return;
    if (/\/(past|archive|previous)/i.test(url.pathname)) return;
    url.hash = "";
    url.search = "";
    const key = url.toString().replace(/\/$/, "");
    if (key === baseUrl.replace(/\/$/, "")) return;
    seen.add(key);
  });
  return [...seen].slice(0, limit);
}

// ---------------------------------------------------------------------------

function extractJsonLd($: CheerioAPI, opts: ExtractOptions): RawRun[] {
  const out: RawRun[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    let data: unknown;
    try {
      data = JSON.parse($(el).text());
    } catch {
      return;
    }
    for (const node of flattenLd(data)) {
      const type = String(node["@type"] ?? "");
      if (!/Event$/i.test(type)) continue;
      const title = cleanTitle(String(node.name ?? ""));
      const start = ldDate(node.startDate);
      const end = ldDate(node.endDate) ?? start;
      if (!title || !start) continue;
      out.push({
        title,
        start,
        end,
        sourceUrl: typeof node.url === "string" ? node.url : opts.baseUrl,
        snippet: `${type}: ${node.startDate ?? ""} – ${node.endDate ?? ""}`,
      });
    }
  });
  return out;
}

function flattenLd(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.flatMap(flattenLd);
  if (!data || typeof data !== "object") return [];
  const node = data as Record<string, unknown>;
  const children = ["@graph", "subEvent", "itemListElement", "item"].flatMap((k) =>
    k in node ? flattenLd(node[k]) : []
  );
  return [node, ...children];
}

function ldDate(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return undefined;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
}

function extractBySelectors($: CheerioAPI, opts: ExtractOptions, hint?: YearHint): RawRun[] {
  const cfg = opts.config!;
  const out: RawRun[] = [];
  $(cfg.item!).each((_, el) => {
    const card = $(el);
    const title = cleanTitle(
      cfg.title ? card.find(cfg.title).first().text() : card.find("h1,h2,h3,h4").first().text()
    );
    const dateText = collapse(cfg.dates ? card.find(cfg.dates).text() : card.text());
    const range = pickRange(findDateRanges(dateText, hint, opts.now));
    if (!title) return;
    out.push({
      title,
      start: range?.start,
      end: range?.end,
      sourceUrl: opts.baseUrl,
      snippet: range?.raw ?? collapse(card.text()).slice(0, 160),
    });
  });
  return out;
}

function extractGeneric($: CheerioAPI, opts: ExtractOptions, hint?: YearHint): RawRun[] {
  // Deepest elements whose text contains a date range.
  const dateEls: Cheerio<AnyNode>[] = [];
  $("body *").each((_, el) => {
    const $el = $(el);
    const text = collapse($el.text());
    if (text.length > 300 || !containsDateRange(text)) return;
    const childHas = $el
      .children()
      .toArray()
      .some((c) => containsDateRange(collapse($(c).text())));
    if (!childHas) dateEls.push($el);
  });

  const runs: RawRun[] = [];
  const usedCards = new Set<AnyNode>();
  for (const dateEl of dateEls) {
    // Try the smallest enclosing block first so one card can't swallow its neighbours.
    for (const card of cardCandidates($, dateEl)) {
      const cardNode = card.get(0);
      if (cardNode && usedCards.has(cardNode)) break;
      const cardText = collapse(card.text());
      const range = pickRange(findDateRanges(cardText, hint, opts.now));
      if (!range) continue;
      const title = titleForCard($, card, dateEl, cardText, opts.catalog);
      if (!title) continue;
      if (cardNode) usedCards.add(cardNode);
      runs.push({
        title,
        start: range.start,
        end: range.end,
        sourceUrl: opts.baseUrl,
        snippet: range.raw,
      });
      break;
    }
  }
  return runs;
}

/** The date element and each ancestor that still reads like a single card, smallest first. */
function cardCandidates($: CheerioAPI, dateEl: Cheerio<AnyNode>): Cheerio<AnyNode>[] {
  const out: Cheerio<AnyNode>[] = [dateEl];
  let parent = dateEl.parent();
  while (parent.length && parent.get(0)?.type === "tag") {
    const name = (parent.get(0) as { name?: string }).name;
    if (name === "body" || name === "html") break;
    if (collapse(parent.text()).length > CARD_MAX_CHARS) break;
    out.push(parent);
    parent = parent.parent();
  }
  return out;
}

function titleForCard(
  $: CheerioAPI,
  card: Cheerio<AnyNode>,
  dateEl: Cheerio<AnyNode>,
  cardText: string,
  catalog: CatalogTitle[]
): string | undefined {
  const known = findCatalogTitleInText(cardText, catalog);
  if (known) return known.title;

  const candidates: string[] = [];
  const headings = card
    .find("h1,h2,h3,h4,h5,h6")
    .toArray()
    .map((h) => cleanTitle($(h).text()));
  // "AUGUST WILSON'S" / "MA RAINEY'S BLACK BOTTOM" are often two headings.
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    if (/['’]s$/i.test(h) && headings[i + 1]) {
      candidates.push(`${h} ${headings[i + 1]}`);
      i++;
    } else {
      candidates.push(h);
    }
  }
  card.find("a").each((_, a) => {
    candidates.push($(a).text(), $(a).attr("title") ?? "", $(a).attr("aria-label") ?? "");
  });
  card.find("strong,b").each((_, s) => {
    candidates.push($(s).text());
  });
  card.find("img[alt]").each((_, img) => {
    candidates.push($(img).attr("alt") ?? "");
  });
  // Nothing usable inside the card: use the closest heading before it in document order,
  // then the nearest preceding blocks of text (flat pages and pasted plain text).
  const preceding = precedingHeading($, card);
  if (preceding) candidates.push(preceding);
  card
    .prevAll()
    .slice(0, 4)
    .each((_, sib) => {
      candidates.push($(sib).text());
    });

  const dateText = collapse(dateEl.text());
  for (const raw of candidates) {
    const t = cleanTitle(raw);
    if (!t || t === cleanTitle(dateText) || containsDateRange(t) || LOOKS_LIKE_DATE.test(t))
      continue;
    if (CTA_WORDS.test(t) || CREDIT_WORDS.test(t) || /^(by|music|lyrics|book)\b/i.test(t)) continue;
    if (t.length > TITLE_MAX_CHARS || normalizeTitle(t).length < 2) continue;
    return t;
  }
  return undefined;
}

function precedingHeading($: CheerioAPI, el: Cheerio<AnyNode>): string | undefined {
  let node = el;
  for (let depth = 0; depth < 6 && node.length; depth++) {
    const prev = node.prevAll().toArray();
    for (const sib of prev) {
      const $sib = $(sib);
      if ($sib.is("h1,h2,h3,h4,h5,h6")) return $sib.text();
      const inner = $sib.find("h1,h2,h3,h4,h5,h6").last();
      if (inner.length) return inner.text();
    }
    node = node.parent();
  }
  return undefined;
}

/** Prefer the range with an explicit year; otherwise the first one. */
function pickRange<T extends { explicitYear: boolean }>(ranges: T[]): T | undefined {
  return ranges.find((r) => r.explicitYear) ?? ranges[0];
}

function dedupe(runs: RawRun[]): RawRun[] {
  const seen = new Set<string>();
  return runs.filter((r) => {
    const key = `${normalizeTitle(r.title)}|${r.start?.toISOString() ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cleanTitle(raw: string): string {
  return collapse(raw)
    .replace(/\s*[|·•].*$/, "")
    .replace(/^["“”']+|["“”']+$/g, "")
    .trim();
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
