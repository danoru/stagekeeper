import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createClient, PostgrestResponse } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Musical {
  title: string;
  playbill: string;
}

function MusicalsPage() {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusicals() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error }: PostgrestResponse<Musical> = await supabase
        .from("musicals")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setMusicals(data || []);
      }
    }

    fetchMusicals();
  }, []);

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <Grid container direction="row" sx={{}}>
      {musicals.map((musical, i) => (
        <CarouselItem
          key={i}
          title={musical.title}
          playbill={musical.playbill}
        />
      ))}
    </Grid>
  );
}

function CarouselItem(props: any) {
  return (
    <Grid item sx={{ margin: "10px" }}>
      <Card variant="outlined" sx={{ height: "275px", width: "200px" }}>
        <CardContent>
          <CardMedia
            component="img"
            image={props.playbill}
            title={props.title}
            height="194"
          />
          <Typography
            gutterBottom
            variant="h6"
            component="h6"
            color="secondary"
          >
            {props.title}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

export default MusicalsPage;
