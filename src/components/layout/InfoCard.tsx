import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

function InfoCard(props: any) {
  return (
    <Grid item sx={{ margin: "10px" }}>
      <Card variant="outlined" sx={{ height: "275px", width: "200px" }}>
        <Link href={props.link} underline="none">
          <CardContent>
            <CardMedia
              component="img"
              image={props.image}
              title={props.name}
              height="194"
            />
            <Typography gutterBottom variant="subtitle1" color="secondary">
              {props.name}
            </Typography>
          </CardContent>
        </Link>
      </Card>
    </Grid>
  );
}

export default InfoCard;
