import { Box, Container, Pagination, Typography } from "@mui/material";
import { plays, programming, seasons, theatres } from "@prisma/client";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import superjson from "superjson";

import PlayCard from "../../src/components/cards/ShowCard";
import UpcomingShowList from "../../src/components/shows/UpcomingShowList";
import SearchBar from "../../src/components/ui/SearchBar";
import { getPlays, getUpcomingPlays } from "../../src/data/plays";

interface Props {
  plays: plays[];
  upcomingPerformances: (programming & {
    plays: plays;
    seasons: seasons & { theatres: theatres };
  })[];
}

const itemsPerPage = 8;

function PlaysPage({ plays, upcomingPerformances }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plays;
    return plays.filter((p) => p.title.toLowerCase().includes(q));
  }, [plays, search]);

  const isSearching = search.trim().length > 0;
  const visible = isSearching
    ? filtered
    : filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const countLabel = isSearching
    ? `${filtered.length} of ${plays.length} matching`
    : `${plays.length} titles`;

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Plays • StageKeeper</title>
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <UpcomingShowList upcomingPerformances={upcomingPerformances} />

        {/* Section header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
              whiteSpace: "nowrap",
            }}
          >
            All Plays
          </Typography>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: "rgba(232,220,200,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {countLabel}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SearchBar placeholder="Search plays…" value={search} onChange={setSearch} />
        </Box>

        {visible.length === 0 ? (
          <Box
            sx={{
              border: "1px solid rgba(212,175,85,0.08)",
              borderRadius: 1,
              py: 5,
              px: 3,
              textAlign: "center",
              background: "rgba(212,175,85,0.02)",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: "1rem",
                color: "rgba(232,220,200,0.35)",
              }}
            >
              No plays match &ldquo;{search}&rdquo;.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
            {visible.map((play) => (
              <PlayCard
                key={play.id}
                image={play.playbill}
                link={`/plays/${play.title.replace(/\s+/g, "-").toLowerCase()}`}
                name={play.title}
              />
            ))}
          </Box>
        )}

        {!isSearching && filtered.length > itemsPerPage && (
          <Pagination
            count={Math.ceil(filtered.length / itemsPerPage)}
            page={page}
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
              "& .MuiPaginationItem-root": {
                color: "rgba(232,220,200,0.5)",
                borderColor: "rgba(212,175,85,0.2)",
                "&.Mui-selected": {
                  background: "rgba(212,175,85,0.15)",
                  color: "#D4AF55",
                  borderColor: "rgba(212,175,85,0.4)",
                },
                "&:hover": { background: "rgba(212,175,85,0.08)" },
              },
            }}
            onChange={(_, value) => setPage(value)}
          />
        )}
      </Container>
    </Box>
  );
}

export async function getStaticProps() {
  const [plays, upcomingPerformances] = await Promise.all([getPlays(), getUpcomingPlays()]);

  return {
    props: superjson.serialize({ plays, upcomingPerformances }).json,
    revalidate: 3600,
  };
}

export default PlaysPage;
