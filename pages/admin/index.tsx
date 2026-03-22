import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import TheatersIcon from "@mui/icons-material/Theaters";
import ViewListIcon from "@mui/icons-material/ViewList";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";

import AdminGuard from "../../src/components/admin/AdminGuard";

const sections = [
  {
    title: "Musicals",
    description: "Add, edit, and manage musicals in the database.",
    href: "/admin/musicals",
    icon: <LibraryMusicIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Plays",
    description: "Add, edit, and manage plays in the database.",
    href: "/admin/plays",
    icon: <TheaterComedyIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Theatres",
    description: "Add, edit, and manage theatre venues.",
    href: "/admin/theatres",
    icon: <TheatersIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Seasons",
    description: "Create and manage theatre seasons.",
    href: "/admin/seasons",
    icon: <ViewListIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Programming",
    description: "Add shows to a season's programming schedule.",
    href: "/admin/programming",
    icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: "Users",
    description: "Manage user badges and roles.",
    href: "/admin/users",
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
  },
];

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Head>
        <title>Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Manage all StageKeeper data from one place.
        </Typography>
        <Grid container spacing={3}>
          {sections.map((section) => (
            <Grid key={section.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardActionArea
                  component={Link}
                  href={section.href}
                  sx={{ height: "100%", alignItems: "flex-start" }}
                >
                  <CardContent>
                    <Box sx={{ color: "primary.main", mb: 1 }}>{section.icon}</Box>
                    <Typography variant="h6" gutterBottom>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminGuard>
  );
}
