import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

function InfoCard(props: any) {
  return (
    <Grid sx={{ margin: "10px" }}>
      <Card sx={{ height: "275px", width: "200px" }} variant="outlined">
        <Link href={props.link} underline="none">
          <CardContent>
            <CardMedia component="img" height="194" image={props.image} title={props.name} />
            <Typography gutterBottom color="secondary" variant="subtitle1">
              {props.name}
            </Typography>
          </CardContent>
        </Link>
      </Card>
    </Grid>
  );
}

export default InfoCard;
