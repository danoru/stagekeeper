import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { theatres } from "@prisma/client";
import Head from "next/head";
import { useState, useEffect } from "react";
import superjson from "superjson";

import TheatreCard from "../../src/components/cards/TheatreCard";
import { getPaginatedTheatres } from "../../src/data/theatres";

interface Props {
  theatres: theatres[];
  theatreCount: number;
}

function TheatresPage({ theatres: initialTheatres, theatreCount }: Props) {
  const [theatres, setTheatres] = useState(initialTheatres);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchTheatres() {
      const response = await fetch(`/api/theatres/pages?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      setTheatres(data.theatres);
    }
    fetchTheatres();
  }, [page]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Theatres • StageKeeper</title>
      </Head>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
            All Theatres
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
            {theatreCount} venues
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {theatres.map((theatre, i) => (
            <TheatreCard
              key={i}
              image={theatre.image}
              link={`/theatres/${theatre.name.replace(/\s+/g, "-").toLowerCase()}`}
              name={theatre.name}
            />
          ))}
        </Box>

        <Pagination
          count={Math.ceil(theatreCount / itemsPerPage)}
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
  const { theatres, theatreCount } = await getPaginatedTheatres(1, 8);

  return {
    props: superjson.serialize({
      theatres,
      theatreCount,
    }).json,
    revalidate: 3600,
  };
}

export default TheatresPage;
