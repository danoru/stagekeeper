import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "@mui/material/Link";
import moment from "moment";
import Typography from "@mui/material/Typography";

interface CardProps {
  date: Date;
  image: string;
  musical: string;
  theatre: string;
  sx: any;
}

function DetailInfoCard(card: CardProps) {
  const musicalSlug = `/musicals/${card.musical
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
          </CardContent>
        </Card>
      </Link>
    </Grid>
  );
}

export default DetailInfoCard;
