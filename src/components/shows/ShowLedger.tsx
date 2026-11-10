import { Box, Link, Typography } from "@mui/material";

import { resolveShowImage } from "../../utils/gradients";
import { showPath } from "../../utils/slug";
import type { BoardItem, StageBoard } from "../../utils/stageBoard";

// "What's on, when, where" as rows: this week's runs grouped by Opening / Last Call / Now
// Playing, and on the musicals and plays pages a "Coming soon" column grouped by month. Each
// run appears once, with one date format.

interface Props {
  board: StageBoard | null;
  title: string;
  /** "musical" / "play" / "production", for the italic count line. */
  noun?: string;
  /**
   * "split": this week beside coming soon (musicals and plays pages).
   * "columns": one column per group, capped at `maxRows` (home pages).
   */
  layout?: "split" | "columns";
  /** Centres the header and count line, for the logged-out landing page. */
  centred?: boolean;
  maxRows?: number;
  /** Links to the full week on the musicals and plays pages. */
  fullWeekLinks?: boolean;
}

const GROUPS = [
  { key: "opening", label: "Opening" },
  { key: "lastCall", label: "Last Call" },
  { key: "nowPlaying", label: "Now Playing" },
] as const;

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  fontWeight: 500,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
  m: 0,
} as const;

const mutedSx = { color: "rgba(232,220,200,0.55)" };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Hairline() {
  return <Box aria-hidden sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />;
}

function Poster({ item, width }: { item: BoardItem; width: { xs: number; sm: number } }) {
  const { isGradient, value } = resolveShowImage(item.playbill, item.title);
  return (
    <Box
      aria-hidden
      sx={{
        flex: "0 0 auto",
        width,
        aspectRatio: "2 / 3",
        borderRadius: 0.5,
        border: "1px solid",
        borderColor: item.onWatchlist ? "rgba(212,175,85,0.6)" : "rgba(212,175,85,0.2)",
        background: isGradient ? value : `center / cover no-repeat url("${value}")`,
      }}
    />
  );
}

function noteOf(item: BoardItem) {
  return [
    item.performancesLeft != null && `${plural(item.performancesLeft, "performance")} left`,
    item.onWatchlist && "On your watchlist",
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * One run. "boxed" rows sit on the Your Visits panel; "plain" rows are for the home pages'
 * narrower columns. `size` picks this week's larger row or coming soon's smaller one.
 */
function LedgerRow({
  item,
  variant,
  size = "week",
}: {
  item: BoardItem;
  variant: "boxed" | "plain";
  size?: "week" | "later";
}) {
  const note = noteOf(item);
  const week = size === "week";
  const boxed = variant === "boxed";
  // Week rows on the pages keep the date on the right from a tablet up; elsewhere it goes
  // under the theatre so long titles keep their room.
  const dateRight = boxed;
  const dateRightFrom = week ? "sm" : "xs";

  const dateBlock = (
    <>
      <Typography
        component="span"
        sx={{ display: "block", fontSize: "0.78rem", color: "rgba(212,175,85,0.9)", mt: 0.25 }}
      >
        {item.dateLabel}
      </Typography>
      {note && (
        <Typography
          component="span"
          sx={{
            display: "block",
            fontSize: "0.72rem",
            mt: 0.25,
            color: item.onWatchlist ? "#D4AF55" : "rgba(232,220,200,0.55)",
          }}
        >
          {note}
        </Typography>
      )}
    </>
  );

  return (
    <Box component="li">
      <Link
        href={showPath(item.type === "MUSICAL" ? "musicals" : "plays", item.title)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: boxed ? { xs: 1.5, sm: 2 } : 1.5,
          minHeight: 56,
          color: "#E8DCC8",
          transition: "border-color 0.2s, background 0.2s",
          ...(boxed && {
            p: week ? { xs: "8px 12px 8px 8px", sm: "10px 16px 10px 10px" } : "6px 16px 6px 10px",
            border: "1px solid rgba(212,175,85,0.1)",
            borderRadius: 1,
            background: "rgba(212,175,85,0.02)",
            "&:hover": {
              borderColor: "rgba(212,175,85,0.3)",
              background: "rgba(212,175,85,0.05)",
            },
          }),
          "&:hover .ledger-title": { color: "#D4AF55" },
        }}
        underline="none"
      >
        <Poster
          item={item}
          width={week ? (boxed ? { xs: 36, sm: 40 } : { xs: 32, sm: 34 }) : { xs: 30, sm: 32 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            className="ledger-title"
            component="span"
            sx={{
              display: "block",
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: week && boxed ? { xs: "1.2rem", sm: "1.25rem" } : "1.1rem",
              fontWeight: 600,
              lineHeight: 1.1,
              transition: "color 0.2s",
            }}
          >
            {item.title}
          </Typography>
          {item.theatre && (
            <Typography
              component="span"
              sx={{ display: "block", fontSize: "0.74rem", mt: 0.25, ...mutedSx }}
            >
              {item.theatre}
            </Typography>
          )}
          <Box sx={{ display: dateRight ? { xs: "block", [dateRightFrom]: "none" } : "block" }}>
            {dateBlock}
          </Box>
        </Box>
        {dateRight && (
          <Box
            sx={{
              display: { xs: "none", [dateRightFrom]: "block" },
              flex: "0 0 auto",
              textAlign: "right",
              "& > span:first-of-type": { mt: 0 },
            }}
          >
            {dateBlock}
          </Box>
        )}
      </Link>
    </Box>
  );
}

function GroupHeading({ label, count, ruled }: { label: string; count?: number; ruled?: boolean }) {
  return (
    <Typography
      component="h4"
      sx={{
        ...eyebrowSx,
        whiteSpace: "normal",
        mb: 1,
        ...(ruled && { pb: 1, mb: 1.5, borderBottom: "1px solid rgba(212,175,85,0.15)" }),
      }}
    >
      {label}
      {count != null && (
        <Box component="span" sx={mutedSx}>
          {" "}
          · {count}
        </Box>
      )}
    </Typography>
  );
}

const weekLinkSx = { display: "inline-block", py: 1.5, px: 0.5, color: "#D4AF55" } as const;

const listSx = { m: 0, p: 0, listStyle: "none", display: "grid", gap: 0.75 } as const;

function ColumnHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <Typography
      component="h3"
      sx={{
        m: 0,
        mb: 1.75,
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1,
        color: "#E8DCC8",
      }}
    >
      {title}
      {hint && (
        <Box
          component="span"
          sx={{
            display: { xs: "none", sm: "inline" },
            ml: 1,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.75rem",
            fontWeight: 400,
            letterSpacing: "0.04em",
            ...mutedSx,
          }}
        >
          {hint}
        </Box>
      )}
    </Typography>
  );
}

function ShowLedger({
  board,
  title,
  noun = "production",
  layout = "split",
  centred = false,
  maxRows,
  fullWeekLinks = false,
}: Props) {
  if (!board) return null;
  const comingSoon = layout === "split" ? board.comingSoon : [];
  const laterCount = comingSoon.reduce((n, m) => n + m.items.length, 0);
  if (board.productions === 0 && laterCount === 0) return null;

  const groups = GROUPS.map((g) => ({ ...g, items: board[g.key] })).filter(
    (g) => g.items.length > 0
  );

  const lastMonth = comingSoon[comingSoon.length - 1]?.month;
  let summary =
    board.productions > 0
      ? `${plural(board.productions, noun)} on stage this week${
          board.theatres > 0 ? ` across ${plural(board.theatres, "theatre")}` : ""
        }`
      : `${plural(laterCount, noun)} opening by ${lastMonth}`;
  if (board.productions > 0 && laterCount > 0) {
    summary += `, and ${laterCount} more opening by ${lastMonth}`;
  }

  const header = (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {centred && <Hairline />}
        <Typography component="h2" sx={eyebrowSx}>
          {title}
        </Typography>
        <Hairline />
      </Box>
      <Typography
        sx={{
          mt: centred ? 1.5 : 1,
          mb: centred ? 4.5 : 3,
          textAlign: centred ? "center" : "left",
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: "italic",
          fontSize: centred ? { xs: "1.05rem", sm: "1.2rem" } : "1.05rem",
          color: "rgba(232,220,200,0.62)",
        }}
      >
        {summary}.
      </Typography>
    </>
  );

  if (layout === "columns") {
    return (
      <Box aria-label={title} component="section" sx={{ mb: 5 }}>
        {header}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: `repeat(${groups.length}, minmax(0, 1fr))`,
            },
            gap: { xs: 3.5, md: 5 },
          }}
        >
          {groups.map((g) => {
            const shown = maxRows ? g.items.slice(0, maxRows) : g.items;
            return (
              <Box key={g.key}>
                <GroupHeading ruled count={g.items.length} label={g.label} />
                <Box component="ul" sx={{ ...listSx, gap: { xs: 0.75, md: 1.75 } }}>
                  {shown.map((item) => (
                    <LedgerRow key={item.id} item={item} variant="plain" />
                  ))}
                </Box>
                {g.items.length > shown.length && (
                  <Typography sx={{ mt: 1.5, fontSize: "0.74rem", ...mutedSx }}>
                    and {g.items.length - shown.length} more
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
        {fullWeekLinks && (
          <Typography
            sx={{
              mt: 4.5,
              textAlign: "center",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              ...mutedSx,
            }}
          >
            The full week:{" "}
            <Link href="/musicals" sx={weekLinkSx} underline="hover">
              Musicals →
            </Link>{" "}
            ·{" "}
            <Link href="/plays" sx={weekLinkSx} underline="hover">
              Plays →
            </Link>
          </Typography>
        )}
      </Box>
    );
  }

  const thisWeek = groups.length > 0 && (
    <Box>
      <ColumnHeading hint={board.weekLabel} title="This week" />
      {groups.map((g) => (
        <Box key={g.key} sx={{ mb: 2.25 }}>
          <GroupHeading count={g.items.length} label={g.label} />
          <Box component="ul" sx={listSx}>
            {g.items.map((item) => (
              <LedgerRow key={item.id} item={item} variant="boxed" />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );

  const later = laterCount > 0 && (
    <Box>
      <ColumnHeading hint="next six months" title="Coming soon" />
      {comingSoon.map((m) => (
        <Box key={m.month} sx={{ mb: 2.25 }}>
          <GroupHeading label={m.month} />
          <Box component="ul" sx={listSx}>
            {m.items.map((item) => (
              <LedgerRow key={item.id} item={item} size="later" variant="boxed" />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box aria-label={title} component="section" sx={{ mb: 6 }}>
      {header}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: thisWeek && later ? "minmax(0, 1.35fr) minmax(0, 1fr)" : "minmax(0, 1fr)",
          },
          gap: { xs: 1.5, md: 5 },
          alignItems: "start",
        }}
      >
        {thisWeek}
        {later}
      </Box>
    </Box>
  );
}

export default ShowLedger;
