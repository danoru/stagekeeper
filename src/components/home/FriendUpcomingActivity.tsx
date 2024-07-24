import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "@mui/material/Link";
import moment from "moment";
import Typography from "@mui/material/Typography";
import {
  attendance,
  musicals,
  performances,
  theatres,
  users,
} from "@prisma/client";

interface Props {
  upcomingPerformances: (attendance & {
    performances: performances & {
      musicals: musicals;
      theatres: theatres;
    };
    users: users;
  })[];
}

interface CardProps {
  date: Date;
  image: string;
  musical: string;
  theatre: string;
  username: string;
  sx: any;
}

function FriendUpcomingActivity({ upcomingPerformances }: Props) {
  const upcoming = upcomingPerformances.slice(0, 5);
  return (
    <Grid container>
      <Grid
        item
        style={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "theme.palette.secondary",
          display: "flex",
          justifyContent: "space-between",
          lineHeight: "0",
          margin: "0 auto",
          width: "75%",
        }}
      >
        <Typography variant="overline" component="div">
          UPCOMING MUSICALS FROM FRIENDS
        </Typography>
      </Grid>
      <Grid
        container
        item
        rowSpacing={1}
        columnSpacing={2}
        sx={{
          margin: "10px auto",
          maxWidth: "75%",
        }}
      >
        {upcoming.map(
          (
            entry: attendance & {
              performances: performances & {
                musicals: musicals;
                theatres: theatres;
              };
              users: users;
            },

            i: number
          ) => {
            return (
              <DetailInfoCard
                key={`card-${i}`}
                musical={entry.performances.musicals.title}
                image={entry.performances.musicals.playbill || ""}
                theatre={entry.performances.theatres.name}
                date={entry.performances.startTime}
                username={entry.users.username}
                sx={{
                  height: "100%",
                  width: "100%",
                }}
              />
            );
          }
        )}
      </Grid>
    </Grid>
  );
}

function DetailInfoCard(card: CardProps) {
  const musicalSlug = `/recipe/${card.musical
    .replace(/\s+/g, "-")
    .toLowerCase()}`;
  return (
    <Grid item>
      <Link href={musicalSlug} underline="none">
        <Card
          sx={{
            height: "300px",
            width: "250px",
            cursor: "pointer",
          }}
        >
          <CardMedia
            style={{ position: "relative", height: 140, width: "100%" }}
          >
            <Image
              src={card.image}
              alt={card.musical}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          </CardMedia>
          <CardContent>
            <Typography variant="body1" component="div">
              {moment(card.date).format("MMM DD")}
            </Typography>
            <Typography variant="h6" component="div">
              {card.musical}
            </Typography>
            <Typography variant="body1" component="div">
              {card.theatre}
            </Typography>
            <Typography variant="body2" component="div">
              {card.username}
            </Typography>
          </CardContent>
        </Card>
      </Link>
    </Grid>
  );
}

export default FriendUpcomingActivity;
