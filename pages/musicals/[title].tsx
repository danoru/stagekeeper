import Head from "next/head";
import Image from "next/image";
import moment from "moment";
import MusicalActionBar from "../../src/components/musical/MusicalActionBar";
import Stack from "@mui/material/Stack";
import superjson from "superjson";
import Typography from "@mui/material/Typography";
import { musicals } from "@prisma/client";
import { getMusicalByTitle } from "../../src/data/musicals";

interface Params {
  title: string;
}

interface Props {
  musical: musicals;
}

function MusicalPage({ musical }: Props) {
  const title = `${musical.title} • Savry`;

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Created with NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack
        direction="row"
        sx={{ justifyContent: "center", marginTop: "2vh" }}
      >
        <Image
          src={musical.playbill || ""}
          height="300"
          width="235"
          alt={musical.title}
          style={{ borderRadius: "5%", marginRight: "2vw" }}
          priority
        />
        <Stack
          direction="column"
          style={{ alignItems: "flex-start", marginRight: "2vw", width: "50%" }}
        >
          <Stack direction="row" spacing={2}>
            <Typography variant="h6">{musical.title}</Typography>
            <Typography variant="h6">
              {`(${moment(musical.premiere).format("YYYY")})`}
            </Typography>
          </Stack>
          <Stack direction="column" style={{ alignItems: "flex-start" }}>
            <Typography variant="subtitle1">
              Music by {musical.musicBy}
            </Typography>
            <Typography variant="subtitle1">
              Lyrics by {musical.lyricsBy}
            </Typography>
            <Typography variant="subtitle1">
              Book by {musical.bookBy}
            </Typography>
          </Stack>
        </Stack>
        <Stack width="15%">
          <MusicalActionBar />
        </Stack>
      </Stack>
    </div>
  );
}

export async function getServerSideProps(context: { params: Params }) {
  const { title } = context.params;
  const musical = await getMusicalByTitle(title);

  return {
    props: superjson.serialize({
      musical,
    }).json,
  };
}

export default MusicalPage;
