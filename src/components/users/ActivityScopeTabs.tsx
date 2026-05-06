import { Box, Container, Typography } from "@mui/material";

export type ActivityScope = "mine" | "groups";

interface Props {
  username: string;
  scope: ActivityScope;
}

const TABS: { value: ActivityScope; label: string }[] = [
  { value: "mine", label: "Mine" },
  { value: "groups", label: "Groups" },
];

function ActivityScopeTabs({ username, scope }: Props) {
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 0 }}>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          borderBottom: "1px solid rgba(212,175,85,0.12)",
        }}
      >
        {TABS.map((tab) => {
          const active = tab.value === scope;
          const href =
            tab.value === "mine"
              ? `/users/${username}/activity`
              : `/users/${username}/activity?scope=groups`;
          return (
            <Box
              key={tab.value}
              component="a"
              href={href}
              sx={{
                position: "relative",
                py: 1.25,
                textDecoration: "none",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: active ? "#D4AF55" : "transparent",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.7rem",
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: active ? "#D4AF55" : "rgba(232,220,200,0.5)",
                  transition: "color 0.2s",
                  "&:hover": { color: active ? "#D4AF55" : "rgba(232,220,200,0.8)" },
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
}

export default ActivityScopeTabs;
