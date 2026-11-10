import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import moment from "moment";
import { useMemo, useState } from "react";

import { buildLedger, LEDGER_MIN_SHOWS, type LedgerVisit } from "../../utils/groupLedger";
import { formatRating } from "../../utils/ratings";

interface Props {
  groupName: string;
  visits: LedgerVisit[];
  members: { id: number; username: string }[];
  viewerId: number;
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

const statSx = {
  flex: "1 1 200px",
  p: 2,
  borderRadius: 1,
  background: "rgba(212,175,85,0.04)",
  border: "1px solid rgba(212,175,85,0.1)",
} as const;

const valueSx = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: "1.3rem",
  fontWeight: 600,
  color: "#E8DCC8",
  lineHeight: 1.2,
  mt: 0.5,
} as const;

const mutedSx = { color: "rgba(232,220,200,0.55)", fontSize: "0.8rem" };
const SHOWN_ROWS = 8;

/** Shows the group saw together, how each member rated them, and a few superlatives. */
export default function GroupLedger({ groupName, visits, members, viewerId }: Props) {
  const years = useMemo(
    () => [...new Set(visits.map((v) => new Date(v.day).getUTCFullYear()))].sort((a, b) => b - a),
    [visits]
  );
  const [year, setYear] = useState<number | "all">("all");
  const ledger = useMemo(
    () =>
      buildLedger(
        visits.map((v) => ({ ...v, day: new Date(v.day) })),
        year === "all" ? undefined : year
      ),
    [visits, year]
  );

  const name = (id: number) =>
    id === viewerId ? "you" : (members.find((m) => m.id === id)?.username ?? "a former member");

  if (year === "all" && ledger.shows.length < LEDGER_MIN_SHOWS) {
    return (
      <Box>
        <Typography component="h2" sx={{ ...eyebrowSx, mb: 1.5 }}>
          Ledger
        </Typography>
        <Typography sx={mutedSx}>
          Once members have logged {LEDGER_MIN_SHOWS} shows they saw on the same night, the
          group&apos;s ledger appears here: averages, the biggest split and who&apos;s the tough
          critic.
        </Typography>
      </Box>
    );
  }

  const memberIds = members.map((m) => m.id);
  const pair = ledger.agreeablePair;

  return (
    <Box>
      <Stack alignItems="center" direction="row" spacing={2} sx={{ mb: 2 }}>
        <Typography component="h2" sx={eyebrowSx}>
          Ledger
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        <TextField
          select
          aria-label="Year"
          size="small"
          sx={{ minWidth: 120 }}
          value={year}
          onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
        >
          <MenuItem value="all">All time</MenuItem>
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {groupName}, {y}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" flexWrap="wrap" sx={{ gap: 1.5, mb: 2.5 }}>
        <Box sx={statSx}>
          <Typography sx={eyebrowSx}>Seen together</Typography>
          <Typography sx={{ ...valueSx, fontSize: "1.8rem" }}>
            {ledger.shows.length} show{ledger.shows.length === 1 ? "" : "s"}
          </Typography>
        </Box>
        <Box sx={statSx}>
          <Typography sx={eyebrowSx}>Biggest split</Typography>
          {ledger.biggestSplit ? (
            <>
              <Typography sx={valueSx}>{ledger.biggestSplit.show.title}</Typography>
              <Typography sx={mutedSx}>
                {name(ledger.biggestSplit.high[0])} {formatRating(ledger.biggestSplit.high[1])} ·{" "}
                {name(ledger.biggestSplit.low[0])} {formatRating(ledger.biggestSplit.low[1])}
              </Typography>
            </>
          ) : (
            <Typography sx={{ ...mutedSx, mt: 0.5 }}>Everyone agrees so far.</Typography>
          )}
        </Box>
        <Box sx={statSx}>
          <Typography sx={eyebrowSx}>Tough critic</Typography>
          {ledger.toughCritic ? (
            <>
              <Typography sx={valueSx}>{name(ledger.toughCritic.userId)}</Typography>
              <Typography sx={mutedSx}>
                {formatRating(Math.round(ledger.toughCritic.below * 10) / 10)} below the others
              </Typography>
            </>
          ) : (
            <Typography sx={{ ...mutedSx, mt: 0.5 }}>Nobody stands out yet.</Typography>
          )}
        </Box>
        <Box sx={statSx}>
          <Typography sx={eyebrowSx}>Most in sync</Typography>
          {pair ? (
            <>
              <Typography sx={valueSx}>
                {name(pair.a)} and {name(pair.b)}
              </Typography>
              <Typography sx={mutedSx}>
                within half a star, {pair.close} of {pair.of}
              </Typography>
            </>
          ) : (
            <Typography sx={{ ...mutedSx, mt: 0.5 }}>Needs more shared ratings.</Typography>
          )}
        </Box>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.88rem",
            "& th": { ...mutedSx, fontWeight: 500, textAlign: "center", p: 1 },
            "& td": { p: 1, textAlign: "center", borderTop: "1px solid rgba(212,175,85,0.08)" },
            "& th:first-of-type, & td:first-of-type": { textAlign: "left" },
          }}
        >
          <thead>
            <tr>
              <th>Show</th>
              {memberIds.map((id) => (
                <th key={id}>{name(id)}</th>
              ))}
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {ledger.shows.slice(0, SHOWN_ROWS).map((show) => (
              <tr key={`${show.showKey}-${show.day.getTime()}`}>
                <td>
                  {show.title}
                  <Typography component="span" sx={{ ...mutedSx, ml: 1 }}>
                    {moment.utc(show.day).format("MMM D, YYYY")}
                  </Typography>
                </td>
                {memberIds.map((id) => {
                  const r = show.ratings.get(id);
                  return (
                    <td key={id}>
                      {show.ratings.has(id) ? (r == null ? "·" : formatRating(r)) : ""}
                    </td>
                  );
                })}
                <td style={{ color: "#D4AF55" }}>
                  {show.average == null ? "—" : formatRating(Math.round(show.average * 10) / 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
      {ledger.shows.length > SHOWN_ROWS && (
        <Typography sx={{ ...mutedSx, mt: 1 }}>
          + {ledger.shows.length - SHOWN_ROWS} more
        </Typography>
      )}
      <Typography sx={{ ...mutedSx, mt: 1.5 }}>
        A show counts when two or more members logged it on the same day. Only members see this.
      </Typography>
    </Box>
  );
}
