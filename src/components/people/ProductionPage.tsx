import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, Button, Container, IconButton, Link, Stack, Typography } from "@mui/material";
import type { CreditCategory } from "@prisma/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import type { ProductionCredit, ShowProduction } from "../../data/people";
import { resolveShowImage } from "../../utils/gradients";
import { visitProduction } from "../../utils/productions";
import { formatRating, mean } from "../../utils/ratings";
import { visitDay } from "../../utils/schedule";
import { showPath, theatrePath, type ShowSegment } from "../../utils/slug";
import PageMeta from "../layout/PageMeta";
import { pastVisits, type Visit } from "../shows/YourVisits";

import { CATEGORY_LABELS, describePart } from "./creditText";
import SuggestCreditsDialog from "./SuggestCreditsDialog";

interface Props {
  segment: ShowSegment;
  show: { id: number; title: string; playbill: string };
  item: ShowProduction;
  path: string;
  otherCount: number;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
        <Typography component="h2" sx={eyebrowSx}>
          {label}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>
      {children}
    </Box>
  );
}

/** One run of a show: dates, its company in billing order, and how members rated it. */
export default function ProductionPage({ segment, show, item, path, otherCount }: Props) {
  const { data: session } = useSession();
  const isAdmin = session?.user.badge === "ADMIN";
  const { production, stats } = item;
  const theatre = production.seasons?.theatres ?? null;
  const [credits, setCredits] = useState<ProductionCredit[]>(item.credits);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    if (!session) return;
    const param = segment === "musicals" ? "musicalId" : "playId";
    fetch(`/api/shows/user-status?${param}=${show.id}`)
      .then((r) => (r.ok ? r.json() : { attendance: [] }))
      .then((d) => setVisits(d.attendance ?? []))
      .catch(() => setVisits([]));
  }, [session, segment, show.id]);

  const run = {
    id: production.id,
    theatreId: theatre?.id ?? null,
    startDate: production.startDate,
    endDate: production.endDate,
  };
  const mine = pastVisits(visits).filter(
    (v) =>
      visitProduction(
        {
          programming: v.programming,
          theatreId: v.theatres?.id ?? v.performances?.theatres?.id ?? null,
          date: visitDay(v.seenDate, v.performances?.startTime),
        },
        [run]
      ) === production.id
  );
  const myRating = mean(mine.flatMap((v) => (v.rating == null ? [] : [Number(v.rating)])));

  async function move(category: CreditCategory, index: number, delta: number) {
    const group = credits.filter((c) => c.category === category);
    const target = index + delta;
    if (target < 0 || target >= group.length) return;
    const reordered = [...group];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const res = await fetch("/api/admin/credits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", ids: reordered.map((c) => c.id) }),
    });
    if (res.ok) {
      setCredits((all) => [...all.filter((c) => c.category !== category), ...reordered]);
    }
  }

  const { isGradient, value } = resolveShowImage(show.playbill, show.title);
  const year = moment.utc(production.startDate).format("YYYY");
  const groups = (Object.keys(CATEGORY_LABELS) as CreditCategory[]).map((category) => ({
    category,
    items: credits.filter((c) => c.category === category),
  }));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageMeta
        description={`${show.title} at ${theatre?.name ?? "a theatre TBD"}, ${year}: cast, creative team and dates on StageKeeper.`}
        path={path}
        title={`${show.title} · ${theatre?.name ?? "Production"} ${year}`}
      />
      <Typography sx={{ fontSize: "0.78rem", color: "rgba(232,220,200,0.5)", mb: 2 }}>
        <Link href={showPath(segment, show.title)} sx={{ color: "inherit" }} underline="hover">
          {show.title}
        </Link>
        {` › ${theatre?.name ?? "Theatre TBD"}, ${year}`}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        <Box
          aria-hidden
          sx={{
            width: 120,
            height: 176,
            flexShrink: 0,
            borderRadius: 0.5,
            border: "1px solid rgba(212,175,85,0.3)",
            background: isGradient ? value : `center / cover no-repeat url("${value}")`,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography sx={eyebrowSx}>Production</Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: "2rem", md: "2.6rem" },
              fontWeight: 600,
              lineHeight: 1.05,
              color: "#E8DCC8",
            }}
          >
            {show.title}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "rgba(232,220,200,0.8)" }}>
            {theatre ? (
              <Link href={theatrePath(theatre.name)} sx={{ color: "inherit" }} underline="hover">
                {theatre.name}
              </Link>
            ) : (
              "Theatre TBD"
            )}
            {` · ${moment.utc(production.startDate).format("MMM D")} – ${moment
              .utc(production.endDate)
              .format("MMM D, YYYY")}`}
          </Typography>
          <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
            <Box>
              <Typography sx={eyebrowSx}>Your visits</Typography>
              <Typography sx={{ fontSize: "0.9rem", mt: 0.5 }}>
                {!session
                  ? "Log in to see yours"
                  : mine.length === 0
                    ? "None logged"
                    : mine
                        .map((v) => {
                          const day = visitDay(v.seenDate, v.performances?.startTime);
                          return day ? moment.utc(day).format("MMM D, YYYY") : "Date not logged";
                        })
                        .join(" · ")}
                {myRating != null && ` · ★ ${formatRating(myRating)}`}
              </Typography>
            </Box>
            <Box>
              <Typography sx={eyebrowSx}>Members</Typography>
              <Typography sx={{ fontSize: "0.9rem", mt: 0.5 }}>
                {stats.average != null
                  ? `★ ${formatRating(stats.average)} from ${stats.raters}`
                  : "No ratings yet"}
                {stats.seenBy > 0 && ` · seen by ${stats.seenBy}`}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {otherCount > 0 && (
              <Button href={showPath(segment, show.title)} size="small" variant="outlined">
                All productions ({otherCount + 1})
              </Button>
            )}
            {(isAdmin || mine.length > 0) && (
              <Button size="small" variant="outlined" onClick={() => setSuggesting(true)}>
                Suggest cast and crew
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>

      {groups.map(({ category, items }) => (
        <Section key={category} label={CATEGORY_LABELS[category]}>
          {items.length === 0 ? (
            <Typography sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.45)" }}>
              Not suggested yet.
            </Typography>
          ) : (
            <Box
              component="ol"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1,
              }}
            >
              {items.map((credit, index) => (
                <Box
                  key={credit.id}
                  component="li"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    border: "1px solid rgba(212,175,85,0.1)",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/people/${credit.person.slug}`}
                      sx={{ color: "rgba(232,220,200,0.95)" }}
                      underline="hover"
                    >
                      {credit.person.name}
                    </Link>
                    <Typography
                      component="span"
                      sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.55)", ml: 1 }}
                    >
                      {describePart(credit)}
                    </Typography>
                  </Box>
                  {isAdmin && items.length > 1 && (
                    <>
                      <IconButton
                        aria-label={`Move ${credit.person.name} up`}
                        disabled={index === 0}
                        size="small"
                        onClick={() => move(category, index, -1)}
                      >
                        <ArrowUpwardIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label={`Move ${credit.person.name} down`}
                        disabled={index === items.length - 1}
                        size="small"
                        onClick={() => move(category, index, 1)}
                      >
                        <ArrowDownwardIcon fontSize="inherit" />
                      </IconButton>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Section>
      ))}

      {suggesting && (
        <SuggestCreditsDialog
          open
          isAdmin={isAdmin}
          productionLabel={`${show.title} at ${theatre?.name ?? "a theatre TBD"}, ${year}`}
          programmingId={production.id}
          onClose={() => setSuggesting(false)}
        />
      )}
    </Container>
  );
}
