import Grid from "@mui/material/Grid";
import Head from "next/head";
import Pagination from "@mui/material/Pagination";
import superjson from "superjson";
import { getPaginatedTheatres } from "../../src/data/theatres";
import { useState, useEffect } from "react";
import { theatres } from "@prisma/client";
import TheatreCard from "../../src/components/layout/TheatreCard";
import Typography from "@mui/material/Typography";

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
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ margin: "1vh 0" }}>
            All Theatres
          </Typography>
        </Grid>
        <Grid container item xs={8} sx={{ margin: "0 auto" }}>
          {theatres.map((theatre, i) => (
            <TheatreCard
              key={i}
              name={theatre.name}
              link={`/theatres/${theatre.name
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
              image={theatre.image || ""}
            />
          ))}
        </Grid>
      </Grid>
      <Pagination
        count={Math.ceil(theatreCount / itemsPerPage)}
        page={page}
        onChange={handleChange}
        sx={{ margin: "1vh", justifyContent: "center", display: "flex" }}
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
