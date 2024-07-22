import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "@mui/material/Link";
import { watchlist, musicals } from "@prisma/client";

interface WatchlistProps {
  watchlist: (watchlist & { musicals: musicals })[];
}

interface RecipeCardProps {
  title: string;
  playbill: string;
}

function UserWatchlistPreview({ watchlist }: WatchlistProps) {
  return (
    <Grid item>
      <Grid
        container
        sx={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "theme.palette.secondary",
          justifyContent: "space-between",
          margin: "10px 0",
          maxWidth: "50%",
        }}
      >
        <Grid item>Watchlist</Grid>
        <Grid item>{watchlist?.length}</Grid>
      </Grid>
      <Grid container>
        {watchlist.map((item, i: number) => (
          <MusicalCard
            key={`card-${i}`}
            title={item.musicals.title}
            playbill={item.musicals.playbill || ""}
          />
        ))}
      </Grid>
    </Grid>
  );
}

function MusicalCard({ title, playbill }: RecipeCardProps) {
  const musicalSlug = `/musical/${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <Grid item>
      <Link href={musicalSlug}>
        <Card
          sx={{
            height: "105px",
            width: "70px",
            cursor: "pointer",
          }}
        >
          <CardMedia
            style={{ position: "relative", height: 140, width: "100%" }}
          >
            <Image
              src={playbill}
              alt={title}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          </CardMedia>
        </Card>
      </Link>
    </Grid>
  );
}

export default UserWatchlistPreview;
