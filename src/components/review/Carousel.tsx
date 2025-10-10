import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { attendance, musicals, performances, theatres } from "@prisma/client";
import moment from "moment";
import SimpleCarousel from "../ui/SimpleCarousel";

interface Props {
  items: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
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

function MusicalCarousel({ items }: Props) {
  return (
    <SimpleCarousel sx={{ maxWidth: 500, margin: "auto" }}>
      {items?.map((item, i) => (
        <CarouselItem
          key={i}
          date={item.performances.startTime}
          duration={item.performances.musicals?.duration}
          location={item.performances.theatres.location}
          playbill={item.performances.musicals?.playbill}
          playhouse={item.performances.theatres.name}
          title={item.performances.musicals?.title}
        />
      ))}
    </SimpleCarousel>
  );
}

function CarouselItem(props: CardProps) {
  const humanReadableDate = moment(props.date).format("MMMM Do, YYYY");

  return (
    <Card variant="outlined">
      <CardContent>
        <CardMedia component="img" height="194" image={props.playbill} title={props.title} />
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

export default MusicalCarousel;
