import Grid from "@mui/material/Grid";
import Head from "next/head";
import InfoCard from "../../src/components/layout/InfoCard";
import Pagination from "@mui/material/Pagination";
import superjson from "superjson";
import { getPaginatedMusicals } from "../../src/data/musicals";
import { musicals, programming, seasons, theatres } from "@prisma/client";
import { useState, useEffect } from "react";
import { getUpcomingPerformances } from "../../src/data/performances";
import UpcomingMusicalList from "../../src/components/musical/UpcomingMusicalList";
import { Typography } from "@mui/material";

interface Props {
  musicals: musicals[];
  musicalCount: number;
  upcomingPerformances: (programming & {
    musicals: musicals;
    seasons: seasons & { theatres: theatres };
  })[];
}

function MusicalsPage({
  musicals: initialMusicals,
  musicalCount,
  upcomingPerformances,
}: Props) {
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
      <UpcomingMusicalList upcomingPerformances={upcomingPerformances} />
      <Grid container direction="row">
        <Grid item xs={12}>
          <Typography variant="h6">All Musicals</Typography>
        </Grid>
        <Grid container item xs={12}>
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
  const upcomingPerformances = await getUpcomingPerformances();

  return {
    props: superjson.serialize({
      musicals,
      musicalCount,
      upcomingPerformances,
    }).json,
  };
}

export default MusicalsPage;
