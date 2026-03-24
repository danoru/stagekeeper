import { Card, CardContent, CardMedia, Grid, Link, Typography } from "@mui/material";

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
