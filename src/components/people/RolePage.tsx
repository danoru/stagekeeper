import { Box, Container, Link, Typography } from "@mui/material";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import type { RoleProduction } from "../../data/rolePage";
import { visitProduction } from "../../utils/productions";
import { formatRating, mean } from "../../utils/ratings";
import { visitDay } from "../../utils/schedule";
import { showPath, theatrePath, type ShowSegment } from "../../utils/slug";
import PageMeta from "../layout/PageMeta";
import { pastVisits, type Visit } from "../shows/YourVisits";

interface Props {
  segment: ShowSegment;
  show: { id: number; title: string };
  character: string;
  productions: RoleProduction[];
  path: string;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
} as const;

/** Everyone who has played one character in local productions of a show. */
export default function RolePage({ segment, show, character, productions, path }: Props) {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    if (!session) return;
    const param = segment === "musicals" ? "musicalId" : "playId";
    fetch(`/api/shows/user-status?${param}=${show.id}`)
      .then((r) => (r.ok ? r.json() : { attendance: [] }))
      .then((d) => setVisits(d.attendance ?? []))
      .catch(() => setVisits([]));
  }, [session, segment, show.id]);

  const runs = productions.map((p) => ({
    id: p.id,
    theatreId: p.theatre?.id ?? null,
    startDate: p.startDate,
    endDate: p.endDate,
  }));
  const mine = new Map<number, number[]>();
  for (const v of pastVisits(visits)) {
    const id = visitProduction(
      {
        programming: v.programming,
        theatreId: v.theatres?.id ?? v.performances?.theatres?.id ?? null,
        date: visitDay(v.seenDate, v.performances?.startTime),
      },
      runs
    );
    if (id == null) continue;
    const list = mine.get(id) ?? [];
    if (v.rating != null) list.push(Number(v.rating));
    mine.set(id, list);
  }
  const actors = new Set(productions.flatMap((p) => p.actors.map((a) => a.slug)));
  const seenLine = session ? ` · you've seen ${mine.size}` : "";

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageMeta
        description={`Everyone who has played ${character} in ${show.title} on local stages, on StageKeeper.`}
        path={path}
        title={`${character} in ${show.title}`}
      />
      <Typography sx={eyebrowSx}>Roles through the years</Typography>
      <Typography
        component="h1"
        sx={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: { xs: "2rem", md: "2.6rem" },
          fontWeight: 600,
          color: "#E8DCC8",
          lineHeight: 1.1,
        }}
      >
        {character}{" "}
        <Box
          component="span"
          sx={{ fontSize: "0.6em", fontWeight: 400, color: "rgba(232,220,200,0.6)" }}
        >
          in{" "}
          <Link href={showPath(segment, show.title)} sx={{ color: "inherit" }} underline="hover">
            {show.title}
          </Link>
        </Box>
      </Typography>
      <Typography sx={{ color: "rgba(232,220,200,0.6)", mt: 0.5, mb: 3 }}>
        {productions.length} productions · {actors.size} {actors.size === 1 ? "actor" : "actors"}
        {seenLine}
      </Typography>
      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {productions.map((p) => {
          const seen = mine.get(p.id);
          const rating = seen ? mean(seen) : null;
          return (
            <Box
              key={p.id}
              component="li"
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "64px minmax(0, 1fr)",
                  sm: "72px minmax(0, 1fr) 170px",
                },
                gap: 2,
                alignItems: "center",
                py: 1.5,
                borderBottom: "1px solid rgba(212,175,85,0.08)",
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "1.4rem",
                  fontWeight: 600,
                }}
              >
                {moment.utc(p.startDate).format("YYYY")}
              </Typography>
              <Box>
                {p.actors.map((a, i) => (
                  <span key={a.slug}>
                    {i > 0 && ", "}
                    <Link
                      href={`/people/${a.slug}`}
                      sx={{ color: "rgba(232,220,200,0.95)" }}
                      underline="hover"
                    >
                      {a.name}
                    </Link>
                  </span>
                ))}
                <Typography sx={{ fontSize: "0.82rem", color: "rgba(232,220,200,0.55)" }}>
                  {p.theatre ? (
                    <Link
                      href={theatrePath(p.theatre.name)}
                      sx={{ color: "inherit" }}
                      underline="hover"
                    >
                      {p.theatre.name}
                    </Link>
                  ) : (
                    "Theatre TBD"
                  )}
                  {` · ${moment.utc(p.startDate).format("MMM D")} – ${moment
                    .utc(p.endDate)
                    .format("MMM D")}`}
                </Typography>
              </Box>
              <Typography
                sx={{
                  gridColumn: { xs: "2", sm: "auto" },
                  fontSize: "0.82rem",
                  color: seen ? "#7BC97B" : "rgba(232,220,200,0.4)",
                  textAlign: { sm: "right" },
                }}
              >
                {seen ? `You saw this${rating != null ? ` · ★ ${formatRating(rating)}` : ""}` : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Typography sx={{ fontSize: "0.78rem", color: "rgba(232,220,200,0.45)", mt: 2 }}>
        Characters are matched as members typed them, so a differently spelled role is listed
        separately.
      </Typography>
    </Container>
  );
}
