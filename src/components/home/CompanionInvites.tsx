import { Box, Button, Stack, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";

import type { CompanionInvite } from "../../data/companions";

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
} as const;

/** "dana says you were at …" invitations, at the top of the signed-in home page. */
export default function CompanionInvites() {
  const [invites, setInvites] = useState<CompanionInvite[]>([]);
  const [done, setDone] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    fetch("/api/user/companions")
      .then((r) => (r.ok ? r.json() : { invites: [] }))
      .then((d) => setInvites(d.invites ?? []))
      .catch(() => setInvites([]));
  }, []);

  if (invites.length === 0) return null;

  async function respond(id: number, accept: boolean) {
    const res = await fetch("/api/user/companions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: accept ? "accept" : "decline" }),
    });
    setDone((m) =>
      new Map(m).set(id, res.ok ? (accept ? "Added to your log." : "Dismissed.") : "Couldn't save.")
    );
  }

  return (
    <Box aria-label="Invitations" component="section" sx={{ mb: 5 }}>
      <Typography component="h2" sx={{ ...eyebrowSx, mb: 1.5 }}>
        Were you there?
      </Typography>
      <Stack spacing={1.5}>
        {invites.map((inv) => (
          <Box
            key={inv.id}
            sx={{
              p: 2,
              border: "1px solid rgba(212,175,85,0.25)",
              borderRadius: 1,
              display: "flex",
              alignItems: { sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
            }}
          >
            <Typography sx={{ flex: 1, fontSize: "0.92rem", lineHeight: 1.6 }}>
              <Box component="span" sx={{ color: "#D4AF55" }}>
                {inv.from}
              </Box>{" "}
              says you were at{" "}
              <Box
                component="span"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "1.05rem",
                  fontWeight: 600,
                }}
              >
                {inv.title}
              </Box>
              {inv.theatre && ` at ${inv.theatre}`}
              {inv.day && ` on ${moment.utc(inv.day).format("ddd, MMM D, YYYY")}`}.
            </Typography>
            {done.has(inv.id) ? (
              <Typography sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.6)" }}>
                {done.get(inv.id)}
              </Typography>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  sx={{ color: "rgba(232,220,200,0.6)" }}
                  onClick={() => respond(inv.id, false)}
                >
                  Not me
                </Button>
                <Button size="small" variant="contained" onClick={() => respond(inv.id, true)}>
                  Add to my log
                </Button>
              </Stack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
