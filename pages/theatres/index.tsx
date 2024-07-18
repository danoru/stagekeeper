import Grid from "@mui/material/Grid";
import Head from "next/head";
import InfoCard from "../../src/components/layout/InfoCard";
import Pagination from "@mui/material/Pagination";
import superjson from "superjson";
import { getPaginatedTheatres } from "../../src/data/theatres";
import { useState, useEffect } from "react";
import { theatres } from "@prisma/client";

interface Props {
  theatres: theatres[];
  theatreCount: number;
}

function TheatresPage({ theatres: initialTheatres, theatreCount }: Props) {
  const [theatres, setTheatres] = useState(initialTheatres);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchTheatres() {
      const response = await fetch(
        `/api/theatres/pages?page=${page}&limit=${itemsPerPage}`
      );
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
        {theatres.map((theatre, i) => (
          <InfoCard
            key={i}
            name={theatre.name}
            link={`/theatres/${theatre.name.replace(/\s+/g, "").toLowerCase()}`}
            image={theatre.image}
          />
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(theatreCount / itemsPerPage)}
        page={page}
        onChange={handleChange}
        sx={{ marginTop: 2 }}
      />
    </div>
  );
}

export async function getStaticProps() {
  const { theatres, theatreCount } = await getPaginatedTheatres(1, 10);

  return {
    props: superjson.serialize({
      theatres,
      theatreCount,
    }).json,
  };
}

export default TheatresPage;
