import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import moment from "moment";

import SimpleCarousel from "../ui/SimpleCarousel";

interface Props {
  items: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
}

interface CardProps {
  title: string;
  location: string;
  duration?: number | null;
  playhouse: string;
  date: Date;
  playbill?: string;
}

function PerformanceCarousel({ items }: Props) {
  return (
    <SimpleCarousel sx={{ maxWidth: 500, margin: "auto" }}>
      {items?.map((item, i) => (
        <Box key={i} sx={{ flex: "0 0 100%", width: "100%" }}>
          <CarouselItem
            date={item.performances.startTime}
            duration={item.performances.musicals?.duration || item.performances.plays?.duration}
            location={item.performances.theatres.location}
            playbill={item.performances.musicals?.playbill || item.performances.plays?.playbill}
            playhouse={item.performances.theatres.name}
            title={item.performances.musicals?.title || item.performances.plays?.title}
          />
        </Box>
      ))}
    </SimpleCarousel>
  );
}

function CarouselItem(props: CardProps) {
  const humanReadableDate = moment(props.date).format("MMMM Do, YYYY");

  return (
    <Card variant="outlined">
      <CardContent>
        <CardMedia
          component="img"
          height={194}
          image={props.playbill || ""}
          title={props.title}
          sx={{ objectFit: "cover" }}
        />
        <Typography gutterBottom color="secondary" component="h6" variant="h6">
          {props.title}
        </Typography>
        <Typography color="inherit" component="h3" variant="h5">
          {props.playhouse}
        </Typography>
        <Typography color="inherit" component="h3" variant="h5">
          {props.location}
        </Typography>
        <Typography color="inherit" component="h3" variant="h5">
          {humanReadableDate}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PerformanceCarousel;
