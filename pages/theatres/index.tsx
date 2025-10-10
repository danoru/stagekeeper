import Grid from "@mui/material/Grid";
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
    <div>
      <Head>
        <title>Theatres • StageKeeper</title>
      </Head>
      <Grid container direction="row">
        <Grid size={{ xs: 12 }}>
          <Typography sx={{ margin: "1vh 0" }} variant="h6">
            All Theatres
          </Typography>
        </Grid>
        <Grid container size={{ xs: 8 }} sx={{ margin: "0 auto" }}>
          {theatres.map((theatre, i) => (
            <TheatreCard
              key={i}
              image={theatre.image}
              link={`/theatres/${theatre.name.replace(/\s+/g, "-").toLowerCase()}`}
              name={theatre.name}
            />
          ))}
        </Grid>
      </Grid>
      <Pagination
        count={Math.ceil(theatreCount / itemsPerPage)}
        page={page}
        sx={{ margin: "1vh", justifyContent: "center", display: "flex" }}
        onChange={handleChange}
      />
    </div>
  );
}

export async function getStaticProps() {
  const { theatres, theatreCount } = await getPaginatedTheatres(1, 8);

  return {
    props: superjson.serialize({
      theatres,
      theatreCount,
    }).json,
  };
}

export default TheatresPage;
