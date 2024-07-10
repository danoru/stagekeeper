import React from "react";
import moment from "moment";
import Typography from "@mui/material/Typography";
import Carousel from "react-material-ui-carousel";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import { MUSICAL_LIST_TYPE } from "../../types";

interface Props {
  items: MUSICAL_LIST_TYPE[];
}

function Cards(props: Props) {
  const { items } = props;

  return (
    <Carousel sx={{ maxWidth: 500, margin: "auto" }}>
      {items.map((item: any, i: any) => (
        <CarouselItem
          key={i}
          title={item.title}
          location={item.location}
          duration={item.duration}
          playhouse={item.playhouse}
          date={item.date}
          playbill={item.playbill}
        />
      ))}
    </Carousel>
  );
}

function CarouselItem(props: any) {
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

export default Cards;
