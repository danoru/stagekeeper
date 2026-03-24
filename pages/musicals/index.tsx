import { Box, Container, Pagination, Typography } from "@mui/material";
import { musicals, programming, seasons, theatres } from "@prisma/client";
import Head from "next/head";
import { useState, useEffect } from "react";
import superjson from "superjson";

import MusicalCard from "../../src/components/cards/ShowCard";
import UpcomingShowList from "../../src/components/shows/UpcomingShowList";
import { getPaginatedMusicals } from "../../src/data/musicals";
import { getUpcomingMusicals } from "../../src/data/musicals";

interface Props {
  musicals: musicals[];
  musicalCount: number;
  upcomingPerformances: (programming & {
    musicals: musicals;
    seasons: seasons & { theatres: theatres };
  })[];
}

function MusicalsPage({ musicals: initialMusicals, musicalCount, upcomingPerformances }: Props) {
  const [musicals, setMusicals] = useState(initialMusicals);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchMusicals() {
      const response = await fetch(`/api/musicals/pages?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      setMusicals(data.musicals);
    }
    fetchMusicals();
  }, [page]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Musicals • StageKeeper</title>
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
            All Musicals
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
            {musicalCount} titles
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
          {musicals.map((musical, i) => (
            <MusicalCard
              key={i}
              image={musical.playbill}
              link={`/musicals/${musical.title.replace(/\s+/g, "-").toLowerCase()}`}
              name={musical.title}
            />
          ))}
        </Box>

        <Pagination
          count={Math.ceil(musicalCount / itemsPerPage)}
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
  const { musicals, musicalCount } = await getPaginatedMusicals(1, 8);
  const upcomingPerformances = await getUpcomingMusicals();

  return {
    props: superjson.serialize({
      musicals,
      musicalCount,
      upcomingPerformances,
    }).json,
    revalidate: 3600,
  };
}

export default MusicalsPage;
