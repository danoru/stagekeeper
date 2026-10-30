import { Box, Button, Link, Stack, Typography } from "@mui/material";
import type { CreditCategory } from "@prisma/client";
import moment from "moment";
import { useState } from "react";

import type { ProductionCredit, ShowProduction } from "../../data/people";

import { CATEGORY_LABELS, describePart } from "./creditText";
import SuggestCreditsDialog from "./SuggestCreditsDialog";

interface Props {
  productions: ShowProduction[];
  showTitle: string;
  /** Viewer has seen the show (or is an admin), so they can suggest credits. */
  canSuggest: boolean;
  isAdmin: boolean;
  loggedIn: boolean;
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

function CreditList({ credits }: { credits: ProductionCredit[] }) {
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
                  {` ${describePart(c)}`}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function Productions({ productions, showTitle, canSuggest, isAdmin, loggedIn }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [suggestFor, setSuggestFor] = useState<ShowProduction | null>(null);

  if (productions.length === 0) return null;
  const visible = expanded ? productions : productions.slice(0, SHOWN_PRODUCTIONS);

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography component="h2" sx={eyebrowSx}>
          Productions
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
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
                  <Typography sx={{ fontSize: "0.95rem", color: "rgba(232,220,200,0.95)" }}>
                    {theatre?.name ?? "Theatre TBD"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "rgba(232,220,200,0.5)" }}>
                    {runLabel(item.production)}
                  </Typography>
                </Box>
                {canSuggest && (
                  <Button size="small" variant="outlined" onClick={() => setSuggestFor(item)}>
                    {item.credits.length ? "Suggest more" : "Suggest cast & crew"}
                  </Button>
                )}
              </Stack>
              {item.credits.length > 0 ? (
                <CreditList credits={item.credits} />
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
