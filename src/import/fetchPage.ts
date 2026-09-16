// Plain HTTP fetch with a browser-like UA. Several theatre sites (WordPress
// behind WAFs, Wix) reject the default Node UA outright.

export type FetchResult =
  | { ok: true; html: string; url: string }
  | { ok: false; reason: "BLOCKED" | "EMPTY" | "ERROR"; detail: string; url: string };

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 15_000;

export async function fetchHtml(url: string): Promise<FetchResult> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 403 || res.status === 406 || res.status === 429) {
      return { ok: false, reason: "BLOCKED", detail: `HTTP ${res.status}`, url };
    }
    if (!res.ok) return { ok: false, reason: "ERROR", detail: `HTTP ${res.status}`, url };
    const html = (await res.text()).slice(0, MAX_BYTES);
    if (isEmptyShell(html)) {
      return { ok: false, reason: "EMPTY", detail: "Page has no readable content (JS-only).", url };
    }
    return { ok: true, html, url: res.url || url };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "ERROR", detail, url };
  }
}

/** JS-rendered shells ship a near-empty <body>. */
export function isEmptyShell(html: string): boolean {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const text = body
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length < 300;
}
