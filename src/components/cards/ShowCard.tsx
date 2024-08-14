import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

interface Props {
  hasUpcomingPerformance?: boolean;
  image: string;
  link: string;
  name: string;
}

function ShowCard({ hasUpcomingPerformance, image, link, name }: Props) {
  return (
    <Grid item sx={{ margin: "10px" }}>
      <Badge
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        badgeContent={hasUpcomingPerformance ? "!" : null}
        color="secondary"
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
          <Link href={link} underline="none">
            <CardMedia
              className="image"
              image={image}
              title={name}
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
              {name}
            </Typography>
          </Link>
        </Card>
      </Badge>
    </Grid>
  );
}

export default ShowCard;
