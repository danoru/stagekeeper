import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createClient, PostgrestResponse } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Theatres {
  image: string;
  location: string;
  name: string;
}

function TheatresPage() {
  const [theatres, setTheatres] = useState<Theatres[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTheatres() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error }: PostgrestResponse<Theatres> = await supabase
        .from("theatres")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setTheatres(data || []);
      }
    }
    fetchTheatres();
  }, []);

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <Grid container direction="row" sx={{}}>
      {theatres.map((theatre, i) => (
        <CarouselItem
          key={i}
          name={theatre.name}
          location={theatre.location}
          image={theatre.image}
        />
      ))}
    </Grid>
  );
}

function CarouselItem(props: Theatres) {
  return (
    <Grid item sx={{ margin: "10px" }}>
      <Card variant="outlined">
        <CardContent>
          <CardMedia
            component="img"
            image={props.image}
            title={props.name}
            height="194"
          />
          <Typography
            gutterBottom
            variant="h6"
            component="h6"
            color="secondary"
          >
            {props.name}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default TheatresPage;
