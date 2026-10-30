import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

interface Invitation {
  group: number;
  groups: { name: string; _count: { members: number } };
  inviter: { username: string } | null;
}

interface Props {
  invitations: Invitation[];
}

function GroupInvitations({ invitations }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (invitations.length === 0) return null;

  async function respond(groupId: number, accept: boolean) {
    setBusy(groupId);
    setError(null);
    try {
      const res = await fetch("/api/groups/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, accept }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong.");
        return;
      }
      if (accept) {
        router.push(`/groups/${groupId}`);
        return;
      }
      router.replace(router.asPath);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography
          component="h2"
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            whiteSpace: "nowrap",
          }}
        >
          Invitations
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>
      <Box sx={{ border: "1px solid rgba(212,175,85,0.25)", borderRadius: 1, overflow: "hidden" }}>
        <Stack divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}>
          {invitations.map((inv) => (
            <Stack
              key={inv.group}
              alignItems={{ sm: "center" }}
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ px: 3, py: 1.75, background: "rgba(212,175,85,0.04)" }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    color: "#E8DCC8",
                  }}
                >
                  {inv.groups.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.7rem",
                    color: "rgba(232,220,200,0.45)",
                  }}
                >
                  {`${inv.inviter ? `Invited by ${inv.inviter.username} · ` : ""}${inv.groups._count.members} ${
                    inv.groups._count.members === 1 ? "member" : "members"
                  } · members see each other's upcoming plans`}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  disabled={busy === inv.group}
                  size="small"
                  variant="contained"
                  onClick={() => respond(inv.group, true)}
                >
                  Join
                </Button>
                <Button
                  disabled={busy === inv.group}
                  size="small"
                  sx={{ color: "rgba(232,220,200,0.6)" }}
                  onClick={() => respond(inv.group, false)}
                >
                  Decline
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>
      {error && (
        <Typography sx={{ color: "#CF4444", fontSize: "0.7rem", mt: 1 }}>{error}</Typography>
      )}
    </Box>
  );
}

export default GroupInvitations;
