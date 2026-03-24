import { Box, Container, Pagination, Typography } from "@mui/material";
import { plays, programming, seasons, theatres } from "@prisma/client";
import Head from "next/head";
import { useState, useEffect } from "react";
import superjson from "superjson";

import PlayCard from "../../src/components/cards/ShowCard";
import UpcomingShowList from "../../src/components/shows/UpcomingShowList";
import { getPaginatedPlays } from "../../src/data/plays";
import { getUpcomingPlays } from "../../src/data/plays";

interface Props {
  plays: plays[];
  playCount: number;
  upcomingPerformances: (programming & {
    plays: plays;
    seasons: seasons & { theatres: theatres };
  })[];
}

function PlaysPage({ plays: initialPlays, playCount, upcomingPerformances }: Props) {
  const [plays, setPlays] = useState(initialPlays);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchPlays() {
      const response = await fetch(`/api/plays/pages?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      setPlays(data.plays);
    }
    fetchPlays();
  }, [page]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Plays • StageKeeper</title>
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <UpcomingShowList upcomingPerformances={upcomingPerformances} />

        {/* Section header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
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
            {playCount} titles
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
          {plays.map((play, i) => (
            <PlayCard
              key={i}
              image={play.playbill}
              link={`/plays/${play.title.replace(/\s+/g, "-").toLowerCase()}`}
              name={play.title}
            />
          ))}
        </Box>

        <Pagination
          count={Math.ceil(playCount / itemsPerPage)}
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
          onChange={handleChange}
        />
      </Container>
    </Box>
  );
}

export async function getStaticProps() {
  const { plays, playCount } = await getPaginatedPlays(1, 8);
  const upcomingPerformances = await getUpcomingPlays();

  return {
    props: superjson.serialize({
      plays,
      playCount,
      upcomingPerformances,
    }).json,
    revalidate: 3600,
  };
}

export default PlaysPage;
