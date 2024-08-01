import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "@mui/material/Link";
import moment from "moment";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface Props {
  endDate: Date;
  image: string;
  link: string;
  musical: string;
  startDate: Date;
}

function ProgramCard(card: Props) {
  return (
    <Grid item sx={{ margin: "2px" }}>
      <Card
        sx={{
          position: "relative",
          height: "270px",
          width: "211.5px",
          overflow: "hidden",
          "&:hover": {
            ".overlay": {
              borderColor: "white",
            },
            ".image": {
              filter: "brightness(0.8)",
            },
          },
        }}
      >
        <Link href={card.link} underline="none">
          <CardMedia
            className="image"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              filter: "brightness(0.5)",
              transition: "filter 0.3s",
            }}
          >
            <Image
              src={card.image}
              alt={card.musical}
              fill
              style={{ objectFit: "cover" }}
            />
          </CardMedia>
          <Box
            className="overlay"
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              bottom: "5px",
              left: "5px",
              border: "2px solid rgba(255, 255, 255, 0.5)",
              pointerEvents: "none",
              transition: "border-color 0.3s",
            }}
          />
          <CardContent>
            <Typography
              variant="h6"
              component="div"
              sx={{
                position: "relative",
                color: "white",
                textShadow: "0 0 5px rgba(0, 0, 0, 0.7)",
              }}
            >
              {card.musical}
            </Typography>
            <Typography
              variant="subtitle2"
              component="div"
              sx={{
                position: "relative",
                color: "white",
                textShadow: "0 0 5px rgba(0, 0, 0, 0.7)",
              }}
            >
              {moment(card.startDate).format("MMM D, YYYY")}
              {" - "}
              {moment(card.endDate).format("MMM D, YYYY")}
            </Typography>
          </CardContent>
        </Link>
      </Card>
    </Grid>
  );
}

export default ProgramCard;
