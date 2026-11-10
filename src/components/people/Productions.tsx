import { Box, Button, Link, Stack, Typography } from "@mui/material";
import type { CreditCategory } from "@prisma/client";
import moment from "moment";
import { useEffect, useState } from "react";

import type { FamiliarFace } from "../../data/familiarFaces";
import type { ProductionCredit, ShowProduction } from "../../data/people";
import { visitProduction } from "../../utils/productions";
import { productionSlugs } from "../../utils/productionSlug";
import { formatRating, mean } from "../../utils/ratings";
import { openRunCutoff, visitDay } from "../../utils/schedule";
import { showPath, slugify } from "../../utils/slug";
import PlanWithGroup from "../shows/PlanWithGroup";
import { pastVisits, type Visit } from "../shows/YourVisits";

import { CATEGORY_LABELS, describePart } from "./creditText";
import SuggestCreditsDialog from "./SuggestCreditsDialog";

interface Props {
  productions: ShowProduction[];
  showTitle: string;
  /** "MUSICAL-12" | "PLAY-34", for the group plan shortcut. */
  showKey: string;
  /** The viewer's visits to this show, to pin "you saw this" to a production. */
  visits: Visit[];
  /** Viewer has seen the show (or is an admin), so they can suggest credits. */
  canSuggest: boolean;
  isAdmin: boolean;
  loggedIn: boolean;
}

interface YourRun {
  visits: number;
  rating: number | null;
}

/** Your visits grouped by production, so two runs of the same show get separate ratings. */
function yourRuns(visits: Visit[], productions: ShowProduction[]): Map<number, YourRun> {
  const runs = productions.map(({ production }) => ({
    id: production.id,
    theatreId: production.seasons?.theatres.id ?? null,
    startDate: production.startDate,
    endDate: production.endDate,
  }));
  const grouped = new Map<number, { visits: number; ratings: number[] }>();
  for (const v of pastVisits(visits)) {
    const id = visitProduction(
      {
        programming: v.programming,
        theatreId: v.theatres?.id ?? v.performances?.theatres?.id ?? null,
        // A showtime is an instant; match on the theatre's calendar day.
        date: visitDay(v.seenDate, v.performances?.startTime),
      },
      runs
    );
    if (id == null) continue;
    const entry = grouped.get(id) ?? { visits: 0, ratings: [] };
    entry.visits += 1;
    if (v.rating != null) entry.ratings.push(Number(v.rating));
    grouped.set(id, entry);
  }
  return new Map(
    [...grouped].map(([id, e]) => [id, { visits: e.visits, rating: mean(e.ratings) }])
  );
}

const statSx = { fontSize: "0.75rem", color: "rgba(232,220,200,0.55)" };

function RunStats({ item, yours }: { item: ShowProduction; yours?: YourRun }) {
  const { average, raters, seenBy } = item.stats;
  const parts: string[] = [];
  if (average != null) {
    parts.push(`★ ${formatRating(average)} from ${raters} ${raters === 1 ? "person" : "people"}`);
  }
  if (seenBy > 0) parts.push(`seen by ${seenBy}`);
  if (parts.length === 0 && !yours) return null;

  return (
    <Stack alignItems="center" direction="row" spacing={1.5} sx={{ flexWrap: "wrap", mt: 0.25 }}>
      {parts.length > 0 && <Typography sx={statSx}>{parts.join(" · ")}</Typography>}
      {yours && (
        <Typography sx={{ ...statSx, color: "#50CB78" }}>
          {yours.rating != null
            ? `You: ★ ${formatRating(yours.rating)}${yours.visits > 1 ? ` over ${yours.visits} visits` : ""}`
            : `You saw this${yours.visits > 1 ? ` ${yours.visits} times` : ""}`}
        </Typography>
      )}
    </Stack>
  );
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const SHOWN_PRODUCTIONS = 3;

function runLabel(production: ShowProduction["production"]) {
  const start = moment.utc(production.startDate);
  const end = moment.utc(production.endDate);
  return start.year() === end.year()
    ? `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`
    : `${start.format("MMM D, YYYY")} – ${end.format("MMM D, YYYY")}`;
}

function CreditList({
  credits,
  rolePath,
}: {
  credits: ProductionCredit[];
  /** Link for a character played in 2+ productions, else null. */
  rolePath: (character: string | null) => string | null;
}) {
  const groups = (Object.keys(CATEGORY_LABELS) as CreditCategory[])
    .map((category) => ({ category, items: credits.filter((c) => c.category === category) }))
    .filter((g) => g.items.length > 0);

  return (
    <Stack spacing={1.5}>
      {groups.map(({ category, items }) => (
        <Box key={category}>
          <Typography sx={{ fontSize: "0.7rem", color: "rgba(232,220,200,0.45)", mb: 0.5 }}>
            {CATEGORY_LABELS[category]}
          </Typography>
          <Box
            component="ul"
            sx={{
              listStyle: "none",
              m: 0,
              p: 0,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              columnGap: 3,
              rowGap: 0.5,
            }}
          >
            {items.map((c) => (
              <Box key={c.id} component="li" sx={{ fontSize: "0.88rem" }}>
                <Link href={`/people/${c.person.slug}`} sx={{ color: "rgba(232,220,200,0.95)" }}>
                  {c.person.name}
                </Link>
                <Box component="span" sx={{ color: "rgba(232,220,200,0.5)" }}>
                  {" "}
                  {c.category === "CAST" && rolePath(c.character) ? (
                    <>
                      as{" "}
                      <Link
                        href={rolePath(c.character)!}
                        sx={{ color: "inherit" }}
                        underline="always"
                      >
                        {c.character}
                      </Link>
                    </>
                  ) : (
                    describePart(c)
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function Productions({
  productions,
  showTitle,
  showKey,
  visits,
  canSuggest,
  isAdmin,
  loggedIn,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [suggestFor, setSuggestFor] = useState<ShowProduction | null>(null);
  const [faces, setFaces] = useState<Record<number, FamiliarFace[]>>({});
  const [showType, showId] = showKey.split("-");

  useEffect(() => {
    if (!loggedIn) return;
    const param = showType === "PLAY" ? "playId" : "musicalId";
    fetch(`/api/shows/familiar?${param}=${showId}`)
      .then((r) => (r.ok ? r.json() : { faces: {} }))
      .then((d) => setFaces(d.faces ?? {}))
      .catch(() => setFaces({}));
  }, [loggedIn, showType, showId]);

  if (productions.length === 0) return null;
  const visible = expanded ? productions : productions.slice(0, SHOWN_PRODUCTIONS);
  const yours = yourRuns(visits, productions);
  const basePath = showPath(showKey.startsWith("PLAY") ? "plays" : "musicals", showTitle);
  const slugs = productionSlugs(
    productions.map(({ production }) => ({
      id: production.id,
      startDate: production.startDate,
      theatreName: production.seasons?.theatres.name ?? null,
    }))
  );
  // Characters played in two or more productions get a "roles through the years" page.
  const roleRuns = new Map<string, Set<number>>();
  for (const { production, credits } of productions) {
    for (const c of credits) {
      if (c.category !== "CAST" || !c.character) continue;
      const key = slugify(c.character);
      if (!key) continue;
      roleRuns.set(key, (roleRuns.get(key) ?? new Set()).add(production.id));
    }
  }
  const rolePath = (character: string | null) => {
    const key = character ? slugify(character) : "";
    return key && (roleRuns.get(key)?.size ?? 0) >= 2 ? `${basePath}/roles/${key}` : null;
  };
  const cutoff = openRunCutoff();
  const hasOpenRun = productions.some((p) => new Date(p.production.endDate) >= cutoff);

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography component="h2" sx={eyebrowSx}>
          Productions
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        {loggedIn && hasOpenRun && <PlanWithGroup showKey={showKey} />}
      </Box>

      <Stack spacing={2}>
        {visible.map((item) => {
          const theatre = item.production.seasons?.theatres;
          return (
            <Box
              key={item.production.id}
              sx={{
                p: 2,
                border: "1px solid rgba(212,175,85,0.1)",
                borderRadius: 1,
                background: "rgba(212,175,85,0.02)",
              }}
            >
              <Stack
                alignItems={{ sm: "center" }}
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: item.credits.length ? 1.5 : 0 }}
              >
                <Box>
                  <Link
                    href={`${basePath}/${slugs.get(item.production.id)}`}
                    sx={{ fontSize: "0.95rem", color: "rgba(232,220,200,0.95)" }}
                    underline="hover"
                  >
                    {theatre?.name ?? "Theatre TBD"}
                  </Link>
                  <Typography sx={{ fontSize: "0.78rem", color: "rgba(232,220,200,0.5)" }}>
                    {runLabel(item.production)}
                  </Typography>
                  <RunStats item={item} yours={yours.get(item.production.id)} />
                </Box>
                {canSuggest && (
                  <Button size="small" variant="outlined" onClick={() => setSuggestFor(item)}>
                    {item.credits.length ? "Suggest more" : "Suggest cast & crew"}
                  </Button>
                )}
              </Stack>
              {faces[item.production.id] && (
                <Box
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    border: "1px solid rgba(212,175,85,0.3)",
                    borderRadius: 1,
                    background: "rgba(212,175,85,0.05)",
                  }}
                >
                  <Typography sx={{ ...eyebrowSx, mb: 0.5 }}>Familiar faces</Typography>
                  <Typography sx={{ fontSize: "0.85rem", mb: 0.75 }}>
                    {`You've seen ${faces[item.production.id].length} of this company before.`}
                  </Typography>
                  {faces[item.production.id].map((f) => (
                    <Typography key={f.person.slug} sx={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
                      <Link
                        href={`/people/${f.person.slug}`}
                        sx={{ color: "rgba(232,220,200,0.95)" }}
                      >
                        {f.person.name}
                      </Link>
                      <Box component="span" sx={{ color: "rgba(232,220,200,0.55)" }}>
                        {` (${f.partHere} here) · you saw them ${f.seen.part} in ${f.seen.title}`}
                        {f.seen.theatre && `, ${f.seen.theatre}`}
                        {`, ${f.seen.year}`}
                      </Box>
                      {f.seen.rating != null && (
                        <Box component="span" sx={{ color: "#D4AF55" }}>
                          {` · your ★ ${formatRating(f.seen.rating)}`}
                        </Box>
                      )}
                    </Typography>
                  ))}
                </Box>
              )}
              {item.credits.length > 0 ? (
                <CreditList credits={item.credits} rolePath={rolePath} />
              ) : (
                <Typography
                  sx={{ fontSize: "0.8rem", fontStyle: "italic", color: "rgba(232,220,200,0.4)" }}
                >
                  No cast list yet.
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>

      {productions.length > SHOWN_PRODUCTIONS && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show fewer" : `Show all ${productions.length} productions`}
        </Button>
      )}
      {loggedIn && !canSuggest && (
        <Typography sx={{ mt: 1, fontSize: "0.75rem", color: "rgba(232,220,200,0.45)" }}>
          Log this show as seen to suggest its cast and crew.
        </Typography>
      )}

      {suggestFor && (
        <SuggestCreditsDialog
          open
          isAdmin={isAdmin}
          productionLabel={`${showTitle} at ${suggestFor.production.seasons?.theatres.name ?? "a theatre TBD"}, ${moment
            .utc(suggestFor.production.startDate)
            .format("YYYY")}`}
          programmingId={suggestFor.production.id}
          onClose={() => setSuggestFor(null)}
        />
      )}
    </Box>
  );
}

export default Productions;
