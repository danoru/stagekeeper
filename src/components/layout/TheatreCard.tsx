import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

interface Props {
  link: string;
  image: string;
  name: string;
}

function TheatreCard(props: Props) {
  return (
    <Grid item sx={{ margin: "10px" }}>
      <Card
        sx={{
          position: "relative",
          height: "211.5px",
          width: "270px",
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
        <Link href={props.link} underline="none">
          <CardMedia
            className="image"
            image={props.image}
            title={props.name}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              filter: "brightness(0.5)",
              transition: "filter 0.3s",
            }}
          />
          <Box
            className="overlay"
            sx={{
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
          <Typography
            gutterBottom
            variant="subtitle1"
            color="secondary"
            sx={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              color: "white",
              textShadow: "0 0 5px rgba(0, 0, 0, 0.7)",
            }}
          >
            {props.name}
          </Typography>
        </Link>
      </Card>
    </Grid>
  );
}

export default TheatreCard;
