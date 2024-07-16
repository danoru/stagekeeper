import Grid from "@mui/material/Grid";
import Head from "next/head";
import InfoCard from "../../src/components/layout/InfoCard";
import { getTheatres } from "../../src/data/theatres";
import { theatres } from "@prisma/client";

interface Props {
  theatres: theatres[];
}

function TheatresPage({ theatres }: Props) {
  return (
    <div>
      <Head>
        <title>StageKeeper: Theatres</title>
      </Head>
      <Grid container direction="row">
        {theatres.map((theatre, i) => (
          <InfoCard
            key={i}
            name={theatre.name}
            link={`/theatres/${theatre.name.replace(/\s+/g, "").toLowerCase()}`}
            location={theatre.location}
            image={theatre.image}
          />
        ))}
      </Grid>
    </div>
  );
}

export async function getStaticProps() {
  const theatres = await getTheatres();

  return {
    props: {
      theatres,
    },
  };
}

export default TheatresPage;
