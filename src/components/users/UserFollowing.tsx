import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { following } from "@prisma/client";

import UserAvatar from "./UserAvatar";

interface Props {
  following: following[];
}

function UserFollowing({ following }: Props) {
  if (!following || following.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            whiteSpace: "nowrap",
          }}
        >
          Following
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {following.map((user: any, i: number) => (
          <Tooltip key={i} title={user.followingUsername} placement="top">
            <Box
              component="a"
              href={`/users/${user.followingUsername}`}
              sx={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                opacity: 0.85,
                transition: "opacity 0.2s, transform 0.2s",
                "&:hover": { opacity: 1, transform: "translateY(-2px)" },
              }}
            >
              <UserAvatar avatarSize="52px" name={user.followingUsername} />
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.6rem",
                  color: "rgba(232,220,200,0.45)",
                  letterSpacing: "0.04em",
                  maxWidth: 52,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {user.followingUsername}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

export default UserFollowing;
