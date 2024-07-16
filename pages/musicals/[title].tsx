import Head from "next/head";
import Image from "next/image";
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
        <div style={{ maxWidth: "50%", marginRight: "2vw" }}>
          <Typography variant="h6">{musical.title}</Typography>
        </div>
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
