import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import prisma from "../../../../src/data/db";
import { runTheatreImport } from "../../../../src/import/run";
import { authOptions } from "../../auth/[...nextauth]";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.badge !== "ADMIN") {
    res.status(403).json({ error: "Forbidden." });
    return null;
  }
  return session;
}

// POST { theatreId, html?, sourceUrl? } — scrape one theatre (or extract from
// pasted page content) and stage the results as importCandidates.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const theatreId = Number(req.body?.theatreId);
  if (!Number.isInteger(theatreId))
    return res.status(400).json({ error: "theatreId is required." });
  const html: string | undefined =
    typeof req.body?.html === "string" && req.body.html.trim() ? req.body.html : undefined;
  const sourceUrl =
    typeof req.body?.sourceUrl === "string" && req.body.sourceUrl.trim()
      ? req.body.sourceUrl.trim()
      : undefined;

  // Pasted plain text has no tags; wrap it so the extractor sees one line per block.
  const wrapped =
    html && !/<[a-z][\s\S]*>/i.test(html)
      ? `<body>${html
          .split(/\r?\n/)
          .map((l: string) => `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
          .join("")}</body>`
      : html;

  try {
    const summary = await runTheatreImport(theatreId, { html: wrapped, sourceUrl });
    const candidates = await prisma.importCandidates.findMany({
      where: { theatre: theatreId, state: { in: ["NEW", "DUPLICATE"] } },
      include: {
        musicals: { select: { id: true, title: true } },
        plays: { select: { id: true, title: true } },
      },
      orderBy: [{ startDate: "asc" }, { id: "asc" }],
    });
    return res.status(200).json({ summary: { ...summary, runs: undefined }, candidates });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed.";
    return res.status(500).json({ error: message });
  }
}
