import Grid from "@mui/material/Grid";
import Head from "next/head";
import InfoCard from "../../src/components/layout/InfoCard";
import superjson from "superjson";
import { getMusicals } from "../../src/data/musicals";
import { musicals } from "@prisma/client";

interface Props {
  musicals: musicals[];
}

function MusicalsPage({ musicals }: Props) {
  return (
    <div>
      <Head>
        <title>StageKeeper: Musicals</title>
      </Head>
      <Grid container direction="row">
        {musicals.map((musical, i) => (
          <InfoCard
            key={i}
            name={musical.title}
            link={`/musicals/${musical.title
              .replace(/\s+/g, "")
              .toLowerCase()}`}
            image={musical.playbill}
          />
        ))}
      </Grid>
    </div>
  );
}

export async function getStaticProps() {
  const musicals = await getMusicals();

  return {
    props: superjson.serialize({
      musicals,
    }).json,
  };
}

export default MusicalsPage;
