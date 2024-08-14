import Grid from "@mui/material/Grid";
import Head from "next/head";
import Pagination from "@mui/material/Pagination";
import ShowCard from "../../src/components/cards/ShowCard";
import superjson from "superjson";
import Typography from "@mui/material/Typography";
import UpcomingShowList from "../../src/components/shows/UpcomingShowList";
import { getPaginatedPlays } from "../../src/data/plays";
import { getUpcomingPlays } from "../../src/data/plays";
import { plays, programming, seasons, theatres } from "@prisma/client";
import { useState, useEffect } from "react";

interface Props {
  plays: plays[];
  playCount: number;
  upcomingPerformances: (programming & {
    plays: plays;
    seasons: seasons & { theatres: theatres };
  })[];
}

function PlaysPage({
  plays: initialPlays,
  playCount,
  upcomingPerformances,
}: Props) {
  const [plays, setPlays] = useState(initialPlays);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchPlays() {
      const response = await fetch(
        `/api/plays/pages?page=${page}&limit=${itemsPerPage}`
      );
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
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ margin: "1vh 0" }}>
            All Plays
          </Typography>
        </Grid>
        <Grid container item xs={8} sx={{ margin: "0 auto" }}>
          {plays.map((play, i) => (
            <ShowCard
              key={i}
              name={play.title}
              link={`/plays/${play.title.replace(/\s+/g, "-").toLowerCase()}`}
              image={play.playbill}
            />
          ))}
        </Grid>
      </Grid>
      <Pagination
        count={Math.ceil(playCount / itemsPerPage)}
        page={page}
        onChange={handleChange}
        sx={{ margin: "1vh", justifyContent: "center", display: "flex" }}
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
