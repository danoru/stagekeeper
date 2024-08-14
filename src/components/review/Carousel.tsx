import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Carousel from "react-material-ui-carousel";
import moment from "moment";
import Typography from "@mui/material/Typography";
import { attendance, musicals, performances, theatres } from "@prisma/client";

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
    <Carousel sx={{ maxWidth: 500, margin: "auto" }}>
      {items?.map((item, i) => (
        <CarouselItem
          key={i}
          title={item.performances.musicals?.title}
          location={item.performances.theatres.location}
          duration={item.performances.musicals?.duration}
          playhouse={item.performances.theatres.name}
          date={item.performances.startTime}
          playbill={item.performances.musicals?.playbill}
        />
      ))}
    </Carousel>
  );
}

function CarouselItem(props: CardProps) {
  const humanReadableDate = moment(props.date).format("MMMM Do, YYYY");

  return (
    <Card variant="outlined">
      <CardContent>
        <CardMedia
          component="img"
          image={props.playbill}
          title={props.title}
          height="194"
        />
        <Typography gutterBottom variant="h6" component="h6" color="secondary">
          {props.title}
        </Typography>
        <Typography variant="h5" color="inherit" component="h3">
          {props.playhouse}
        </Typography>
        <Typography variant="h5" color="inherit" component="h3">
          {props.location}
        </Typography>
        <Typography variant="h5" color="inherit" component="h3">
          {humanReadableDate}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MusicalCarousel;
