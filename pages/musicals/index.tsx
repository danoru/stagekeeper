import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
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
  const itemsPerPage = 10;

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
    <div>
      <Head>
        <title>Musicals • StageKeeper</title>
      </Head>
      <UpcomingShowList upcomingPerformances={upcomingPerformances} />
      <Grid container direction="row">
        <Grid size={{ xs: 12 }}>
          <Typography sx={{ margin: "1vh 0" }} variant="h6">
            All Musicals
          </Typography>
        </Grid>
        <Grid container size={{ xs: 8 }} sx={{ margin: "0 auto" }}>
          {musicals.map((musical, i) => (
            <MusicalCard
              key={i}
              image={musical.playbill}
              link={`/musicals/${musical.title.replace(/\s+/g, "-").toLowerCase()}`}
              name={musical.title}
            />
          ))}
        </Grid>
      </Grid>
      <Pagination
        count={Math.ceil(musicalCount / itemsPerPage)}
        page={page}
        sx={{ margin: "1vh", justifyContent: "center", display: "flex" }}
        onChange={handleChange}
      />
    </div>
  );
}

export async function getStaticProps() {
  const { musicals, musicalCount } = await getPaginatedMusicals(1, 10);
  const upcomingPerformances = await getUpcomingMusicals();

  return {
    props: superjson.serialize({
      musicals,
      musicalCount,
      upcomingPerformances,
    }).json,
  };
}

export default MusicalsPage;
