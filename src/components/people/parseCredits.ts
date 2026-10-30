// Turns a pasted cast list into rows. Programs and theatre sites write credits many ways:
//   "Jane Doe as Audrey", "Jane Doe (Audrey)", "Audrey ..... Jane Doe", "Director: Sam Lee"
// " as " and parentheses say which side is the person; for the rest the caller says which
// column comes first.

export interface ParsedCredit {
  name: string;
  /** Character for cast, job title for everyone else. */
  part: string;
}

export type ColumnOrder = "name-first" | "part-first";

const SEPARATOR = /\s*(?:\t+|\s[—–-]\s|\.{2,}|…+|:)\s*/;

function clean(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function parseCreditLines(text: string, order: ColumnOrder): ParsedCredit[] {
  const out: ParsedCredit[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    // Drop list bullets and numbering.
    const line = clean(rawLine.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, ""));
    if (!line) continue;

    const as = line.match(/^(.+?)\s+as\s+(.+)$/i);
    if (as) {
      out.push({ name: clean(as[1]), part: clean(as[2]) });
      continue;
    }
    const paren = line.match(/^(.+?)\s*\((.+)\)$/);
    if (paren) {
      out.push({ name: clean(paren[1]), part: clean(paren[2]) });
      continue;
    }
    const pieces = line.split(SEPARATOR).filter(Boolean);
    if (pieces.length >= 2) {
      const [first, ...rest] = pieces;
      const second = clean(rest.join(" "));
      out.push(
        order === "name-first" ? { name: first, part: second } : { name: second, part: first }
      );
      continue;
    }
    out.push({ name: line, part: "" });
  }
  return out.filter((r) => r.name.length >= 2);
}
