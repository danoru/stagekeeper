import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "@mui/material/Link";
import moment from "moment";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import Typography from "@mui/material/Typography";
import { PerformanceType } from "@prisma/client";

interface Props {
  endDate: Date;
  image: string;
  link: string;
  show: string;
  type: PerformanceType;
  startDate: Date;
}

function ProgramCard(card: Props) {
  const isMusical = card.type === "MUSICAL";
  return (
    <Grid item sx={{ margin: "2px" }}>
      <Badge
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        badgeContent={
          isMusical ? (
            <MusicNoteIcon fontSize="small" />
          ) : (
            <TheaterComedyIcon fontSize="small" />
          )
        }
        color="primary"
        overlap="circular"
      >
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
                alt={card.show}
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
                {card.show}
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
      </Badge>
    </Grid>
  );
}

export default ProgramCard;
