import Grid from "@mui/material/Grid";
import Head from "next/head";
import InfoCard from "../../src/components/layout/InfoCard";
import Pagination from "@mui/material/Pagination";
import superjson from "superjson";
import { getPaginatedMusicals } from "../../src/data/musicals";
import { musicals } from "@prisma/client";
import { useState, useEffect } from "react";

interface Props {
  musicals: musicals[];
  musicalCount: number;
}

function MusicalsPage({ musicals: initialMusicals, musicalCount }: Props) {
  const [musicals, setMusicals] = useState(initialMusicals);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchMusicals() {
      const response = await fetch(
        `/api/musicals/pages?page=${page}&limit=${itemsPerPage}`
      );
      const data = await response.json();
      setMusicals(data.musicals);
    }
    fetchMusicals();
  }, [page]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <div>
      <Head>
        <title>Musicals • StageKeeper</title>
      </Head>
      <Grid container direction="row">
        {musicals.map((musical, i) => (
          <InfoCard
            key={i}
            name={musical.title}
            link={`/musicals/${musical.title
              .replace(/\s+/g, "-")
              .toLowerCase()}`}
            image={musical.playbill}
          />
        ))}
      </Grid>
      <Pagination
        count={Math.ceil(musicalCount / itemsPerPage)}
        page={page}
        onChange={handleChange}
        sx={{ marginTop: 2 }}
      />
    </div>
  );
}

export async function getStaticProps() {
  const { musicals, musicalCount } = await getPaginatedMusicals(1, 10);

  return {
    props: superjson.serialize({
      musicals,
      musicalCount,
    }).json,
  };
}

export default MusicalsPage;
