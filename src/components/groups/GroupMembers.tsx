import { Box, Link, Stack, Typography } from "@mui/material";
import type { GroupRole, users } from "@prisma/client";

import UserAvatar from "../users/UserAvatar";

interface Member {
  user: number;
  role: GroupRole;
  users: users;
}

interface Props {
  members: Member[];
}

function GroupMembers({ members }: Props) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
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
          Members
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.1em",
            color: "rgba(232,220,200,0.3)",
          }}
        >
          {members.length}
        </Typography>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={2}>
        {members.map((m) => (
          <Link
            key={m.user}
            href={`/users/${m.users.username}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.5,
              py: 1,
              border: "1px solid rgba(212,175,85,0.1)",
              borderRadius: 1,
              transition: "border-color 0.2s, background 0.2s",
              "&:hover": {
                borderColor: "rgba(212,175,85,0.35)",
                background: "rgba(212,175,85,0.04)",
              },
            }}
            underline="none"
          >
            <UserAvatar avatarSize="32px" name={m.users.username} />
            <Box>
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#E8DCC8",
                }}
              >
                {m.users.username}
              </Typography>
              {m.role === "OWNER" && (
                <Typography
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.55rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#D4AF55",
                  }}
                >
                  Owner
                </Typography>
              )}
            </Box>
          </Link>
        ))}
      </Stack>
    </>
  );
}

export default GroupMembers;
