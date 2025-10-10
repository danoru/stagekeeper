import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { plays, programming, seasons, theatres } from "@prisma/client";
import Head from "next/head";
import { useState, useEffect } from "react";
import superjson from "superjson";

import ShowCard from "../../src/components/cards/ShowCard";
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
  const itemsPerPage = 10;

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
    <div>
      <Head>
        <title>Plays • StageKeeper</title>
      </Head>
      <UpcomingShowList upcomingPerformances={upcomingPerformances} />
      <Grid container direction="row">
        <Grid size={{ xs: 12 }}>
          <Typography sx={{ margin: "1vh 0" }} variant="h6">
            All Plays
          </Typography>
        </Grid>
        <Grid container size={{ xs: 8 }} sx={{ margin: "0 auto" }}>
          {plays.map((play, i) => (
            <ShowCard
              key={i}
              image={play.playbill}
              link={`/plays/${play.title.replace(/\s+/g, "-").toLowerCase()}`}
              name={play.title}
            />
          ))}
        </Grid>
      </Grid>
      <Pagination
        count={Math.ceil(playCount / itemsPerPage)}
        page={page}
        sx={{ margin: "1vh", justifyContent: "center", display: "flex" }}
        onChange={handleChange}
      />
    </div>
  );
}

export async function getStaticProps() {
  const { plays, playCount } = await getPaginatedPlays(1, 10);
  const upcomingPerformances = await getUpcomingPlays();

  return {
    props: superjson.serialize({
      plays,
      playCount,
      upcomingPerformances,
    }).json,
  };
}

export default PlaysPage;
