import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";

interface Props {
  username: string;
}

const tabs = [
  { label: "Profile", path: "" },
  { label: "Musicals", path: "/musicals" },
  { label: "Plays", path: "/plays" },
  { label: "Statistics", path: "/review" },
  { label: "Watchlist", path: "/watchlist" },
  { label: "Upcoming", path: "/upcoming" },
  { label: "Likes", path: "/likes" },
  { label: "Network", path: "/following" },
];

function ProfileLinkBar({ username }: Props) {
  const router = useRouter();
  const currentPath = router.asPath;

  return (
    <Box
      sx={{
        borderBottom: "1px solid rgba(212,175,85,0.12)",
        background: "#080C14",
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          maxWidth: 1200,
          mx: "auto",
          px: 3,
        }}
      >
        {tabs.map((tab) => {
          const href = `/users/${username}${tab.path}`;
          const isActive =
            tab.path === ""
              ? currentPath === `/users/${username}` || currentPath === `/users/${username}/`
              : currentPath.startsWith(href);

          return (
            <Box
              key={tab.label}
              component="a"
              href={href}
              sx={{
                position: "relative",
                px: 2,
                py: 1.75,
                textDecoration: "none",
                flexShrink: 0,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: isActive ? "#D4AF55" : "transparent",
                  transition: "background 0.2s",
                },
                "&:hover::after": {
                  background: isActive ? "#D4AF55" : "rgba(212,175,85,0.3)",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.72rem",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: isActive ? "#D4AF55" : "rgba(232,220,200,0.5)",
                  transition: "color 0.2s",
                  "&:hover": { color: isActive ? "#D4AF55" : "rgba(232,220,200,0.8)" },
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default ProfileLinkBar;
