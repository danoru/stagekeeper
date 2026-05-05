import { Box, Container, Rating, Typography } from "@mui/material";
import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import moment from "moment";

import { resolveShowImage } from "../../utils/gradients";

type ActivityEntry = attendance & {
  performances:
    | (performances & {
        musicals: musicals | null;
        plays: plays | null;
        theatres: theatres;
      })
    | null;
  musicals: musicals | null;
  plays: plays | null;
  theatres: theatres | null;
};

interface Props {
  entries: ActivityEntry[];
}

interface Resolved {
  show: musicals | plays | null;
  isMusical: boolean;
  theatreName: string | null;
  date: Date | null;
}

function resolve(entry: ActivityEntry): Resolved {
  if (entry.performances) {
    const isMusical = entry.performances.type === "MUSICAL";
    return {
      show: isMusical ? entry.performances.musicals : entry.performances.plays,
      isMusical,
      theatreName: entry.performances.theatres?.name ?? null,
      date: entry.performances.startTime,
    };
  }

  const isMusical = entry.musicals != null;
  return {
    show: isMusical ? entry.musicals : entry.plays,
    isMusical,
    theatreName: entry.theatres?.name ?? null,
    date: entry.seenDate,
  };
}

function groupByMonth(rows: ActivityEntry[]): {
  dated: [string, ActivityEntry[]][];
  undated: ActivityEntry[];
} {
  const dated = new Map<string, ActivityEntry[]>();
  const undated: ActivityEntry[] = [];
  for (const row of rows) {
    const { date } = resolve(row);
    if (!date) {
      undated.push(row);
      continue;
    }
    const key = moment(date).format("YYYY-MM");
    const bucket = dated.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      dated.set(key, [row]);
    }
  }
  return { dated: Array.from(dated.entries()), undated };
}

function ActivityFeed({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <SectionHeader count={0} />
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 6,
            px: 3,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "rgba(232,220,200,0.3)",
              mb: 0.5,
            }}
          >
            No shows logged yet.
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            Log a show from its detail page to start your archive.
          </Typography>
        </Box>
      </Container>
    );
  }

  const { dated, undated } = groupByMonth(entries);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <SectionHeader count={entries.length} />
      {dated.map(([key, rows]) => (
        <Box key={key} sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.45rem",
              fontWeight: 500,
              color: "#D4AF55",
              letterSpacing: "0.03em",
              borderBottom: "1px solid rgba(212,175,85,0.18)",
              pb: 1,
              mb: 1,
            }}
          >
            {moment(`${key}-01`).format("MMMM YYYY")}
          </Typography>
          {rows.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </Box>
      ))}
      {undated.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.45rem",
              fontWeight: 500,
              fontStyle: "italic",
              color: "rgba(212,175,85,0.6)",
              letterSpacing: "0.03em",
              borderBottom: "1px solid rgba(212,175,85,0.12)",
              pb: 1,
              mb: 1,
            }}
          >
            Seen at some point
          </Typography>
          {undated.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))}
        </Box>
      )}
    </Container>
  );
}

function SectionHeader({ count }: { count: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3.5 }}>
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
        Activity
      </Typography>
      <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      <Typography
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          color: "rgba(232,220,200,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        {count} {count === 1 ? "entry" : "entries"}
      </Typography>
    </Box>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const { show, isMusical, theatreName, date } = resolve(entry);
  if (!show) return null;

  const slug = `/${isMusical ? "musicals" : "plays"}/${show.title
    .replace(/\s+/g, "-")
    .toLowerCase()}`;
  const { isGradient, value } = resolveShowImage(show.playbill, show.title);
  const dateMoment = date ? moment(date) : null;
  const rating = entry.rating != null ? Number(entry.rating) : null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "44px 60px 1fr", sm: "56px 70px 1fr" },
        columnGap: 2,
        alignItems: "start",
        py: 2,
        borderBottom: "1px solid rgba(212,175,85,0.06)",
        "&:last-of-type": { borderBottom: "none" },
        "&:hover .row-title": { color: "#D4AF55" },
      }}
    >
      <Box sx={{ textAlign: "center", pt: 0.25 }}>
        {dateMoment ? (
          <>
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "#E8DCC8",
                lineHeight: 1,
              }}
            >
              {dateMoment.format("D")}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.55rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.35)",
                mt: 0.5,
              }}
            >
              {dateMoment.format("ddd")}
            </Typography>
          </>
        ) : (
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(232,220,200,0.35)",
              mt: 1,
            }}
          >
            —
          </Typography>
        )}
      </Box>

      <Box
        component="a"
        href={slug}
        sx={{
          display: "block",
          position: "relative",
          height: { xs: "92px", sm: "104px" },
          borderRadius: 0.5,
          overflow: "hidden",
          border: "1px solid rgba(212,175,85,0.12)",
          textDecoration: "none",
          transition: "border-color 0.25s, transform 0.25s",
          "&:hover": {
            borderColor: "rgba(212,175,85,0.4)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {isGradient ? (
          <Box sx={{ position: "absolute", inset: 0, background: value }} />
        ) : (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${value})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.7)",
            }}
          />
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          className="row-title"
          component="a"
          href={slug}
          sx={{
            display: "block",
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "#E8DCC8",
            textDecoration: "none",
            lineHeight: 1.2,
            transition: "color 0.2s",
            mb: 0.5,
          }}
        >
          {show.title}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.7rem",
            letterSpacing: "0.04em",
            color: "rgba(212,175,85,0.6)",
            mb: rating != null || entry.comment ? 0.75 : 0,
          }}
        >
          {theatreName ?? (
            <Box component="span" sx={{ fontStyle: "italic" }}>
              Theatre unknown
            </Box>
          )}
          <Box component="span" sx={{ color: "rgba(232,220,200,0.25)", mx: 0.75 }}>
            ·
          </Box>
          <Box component="span" sx={{ color: "rgba(232,220,200,0.45)" }}>
            {isMusical ? "Musical" : "Play"}
          </Box>
        </Typography>
        {rating != null && (
          <Rating
            readOnly
            precision={0.5}
            size="small"
            value={rating}
            sx={{
              "& .MuiRating-iconFilled": { color: "#D4AF55" },
              "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.2)" },
              fontSize: "0.85rem",
              mb: entry.comment ? 0.75 : 0,
            }}
          />
        )}
        {entry.comment && (
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "0.85rem",
              lineHeight: 1.4,
              color: "rgba(232,220,200,0.65)",
            }}
          >
            &ldquo;{entry.comment}&rdquo;
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default ActivityFeed;
