import EventAvailable from "@mui/icons-material/EventAvailable";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import LocalActivity from "@mui/icons-material/LocalActivity";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import WatchLater from "@mui/icons-material/WatchLater";
import WatchLaterOutlined from "@mui/icons-material/WatchLaterOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {
  attendance,
  likedShows,
  musicals,
  performances,
  plays,
  theatres,
  watchlist,
} from "@prisma/client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import LogShowDialog, { type LogMode } from "./LogShowDialog";

interface Props {
  attendance: (attendance & { performances?: performances | null })[];
  likedShows: likedShows[];
  musical?: musicals;
  /** Called after anything that changes the viewer's relationship to this show. */
  onStatusChange?: () => void;
  play?: plays;
  sessionUser: any;
  watchlist: watchlist[];
  pastPerformances: (performances & { theatres: theatres })[];
}

function ShowActionBar({
  attendance,
  likedShows,
  musical,
  onStatusChange,
  play,
  sessionUser,
  watchlist,
  pastPerformances,
}: Props) {
  const router = useRouter();
  const userId = Number(sessionUser?.id);
  const musicalId = musical ? Number(musical.id) : undefined;
  const playId = play ? Number(play.id) : undefined;
  const performanceType: "MUSICAL" | "PLAY" | null = musical ? "MUSICAL" : play ? "PLAY" : null;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const mine = attendance.filter((a) => {
    if (a.user !== userId) return false;
    if (a.performances) {
      return performanceType === "MUSICAL"
        ? a.performances.musical === musicalId
        : a.performances.play === playId;
    }
    return performanceType === "MUSICAL" ? a.musical === musicalId : a.play === playId;
  });
  const isUpcoming = (a: attendance) =>
    a.going && a.seenDate != null && new Date(a.seenDate) >= today;
  const myAttendanceCount = mine.filter((a) => !isUpcoming(a)).length;
  const hasAttended = myAttendanceCount > 0;
  const isGoing = mine.some(isUpcoming);

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsWatchlisted(false);
      setIsLiked(false);
      return;
    }
    setIsWatchlisted(
      watchlist.some(
        (w) =>
          w.user === userId &&
          (performanceType === "MUSICAL" ? w.musical === musicalId : w.play === playId)
      )
    );
    setIsLiked(
      likedShows.some(
        (l) =>
          l.user === userId &&
          (performanceType === "MUSICAL" ? l.musical === musicalId : l.play === playId)
      )
    );
  }, [userId, watchlist, likedShows, performanceType, musicalId, playId]);

  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logMode, setLogMode] = useState<LogMode>("seen");

  function showSnackbar(message: string, severity: "success" | "error") {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  function handleOpenLogDialog(mode: LogMode) {
    if (!sessionUser) return;
    setLogMode(mode);
    setLogDialogOpen(true);
  }

  function handleLogged({ mode }: { mode: LogMode }) {
    showSnackbar(mode === "going" ? "You're going!" : "Logged a viewing.", "success");
    setIsWatchlisted(false);
    onStatusChange?.();
    router.replace(router.asPath, undefined, { scroll: false });
  }

  async function handleLikes() {
    if (!sessionUser) return;
    const method = isLiked ? "DELETE" : "POST";
    const response = await fetch("/api/shows/likes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: performanceType,
        musical: musicalId,
        play: playId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setIsLiked(!isLiked);
      onStatusChange?.();
      showSnackbar(isLiked ? "Removed from liked shows." : "Added to liked shows.", "success");
    } else {
      showSnackbar(data.error || "Failed to update liked shows.", "error");
    }
  }

  async function handleWatchlist() {
    if (!sessionUser) return;
    const method = isWatchlisted ? "DELETE" : "POST";
    const response = await fetch("/api/shows/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: performanceType,
        musical: musicalId,
        play: playId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setIsWatchlisted(!isWatchlisted);
      onStatusChange?.();
      showSnackbar(isWatchlisted ? "Removed from watchlist." : "Added to watchlist.", "success");
    } else {
      showSnackbar(data.error || "Failed to update watchlist.", "error");
    }
  }

  function copyUrlToClipboard() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => showSnackbar("Successfully copied.", "success"))
      .catch(() => showSnackbar("Failed to copy.", "error"));
  }

  const attendLabel = hasAttended
    ? myAttendanceCount > 1
      ? `Seen ×${myAttendanceCount}`
      : "Attended"
    : "Log";

  const actionButtonSx = {
    minWidth: 0,
    px: { xs: 0.5, sm: 1 },
    py: 1,
    "& .MuiSvgIcon-root": { fontSize: { xs: 26, md: 30 } },
  };
  const actionLabelSx = {
    fontSize: { xs: "0.7rem", md: "0.85rem" },
    textAlign: "center" as const,
    lineHeight: 1.2,
  };

  const AttendanceButton = () => (
    <Stack alignItems="center" direction="column" sx={{ flex: 1, minWidth: 0 }}>
      <Button
        sx={actionButtonSx}
        onClick={() => handleOpenLogDialog("seen")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hasAttended ? <LocalActivity /> : <LocalActivityOutlined />}
      </Button>
      <Typography sx={actionLabelSx}>
        {hovered && hasAttended ? "Log again" : attendLabel}
      </Typography>
    </Stack>
  );

  const GoingButton = () => (
    <Stack alignItems="center" direction="column" sx={{ flex: 1, minWidth: 0 }}>
      <Button sx={actionButtonSx} onClick={() => handleOpenLogDialog("going")}>
        {isGoing ? <EventAvailable /> : <EventAvailableOutlined />}
      </Button>
      <Typography sx={actionLabelSx}>{isGoing ? "Going" : "I'm going"}</Typography>
    </Stack>
  );

  const LikedButton = () => (
    <Stack alignItems="center" direction="column" sx={{ flex: 1, minWidth: 0 }}>
      <Button sx={actionButtonSx} onClick={handleLikes}>
        {isLiked ? <FavoriteIcon /> : <FavoriteBorder />}
      </Button>
      <Typography sx={actionLabelSx}>{isLiked ? "Liked" : "Like"}</Typography>
    </Stack>
  );

  const WatchlistButton = () => (
    <Stack alignItems="center" direction="column" sx={{ flex: 1, minWidth: 0 }}>
      <Button sx={actionButtonSx} onClick={handleWatchlist}>
        {isWatchlisted ? <WatchLater /> : <WatchLaterOutlined />}
      </Button>
      <Typography sx={actionLabelSx}>Watchlist</Typography>
    </Stack>
  );

  const showId = musicalId ?? playId;
  const showTitle = musical?.title ?? play?.title ?? "";

  return (
    <Paper sx={{ borderRadius: "1%" }}>
      {sessionUser ? (
        <Stack direction="row" justifyContent="center">
          <AttendanceButton />
          <GoingButton />
          <LikedButton />
          <WatchlistButton />
        </Stack>
      ) : (
        <Link href="/login" underline="none">
          <Typography
            color="text.primary"
            style={{ padding: "1vh 0", textAlign: "center" }}
            variant="subtitle1"
          >
            Login to Log, Rate or Review
          </Typography>
        </Link>
      )}
      <Divider />
      <Button
        fullWidth
        sx={{
          color: "text.primary",
          padding: "1vh 0",
          textAlign: "center",
          textTransform: "none",
        }}
        onClick={copyUrlToClipboard}
      >
        <Typography variant="subtitle1">Share</Typography>
      </Button>
      {sessionUser && performanceType && showId != null && (
        <LogShowDialog
          initialMode={logMode}
          open={logDialogOpen}
          pastPerformances={pastPerformances}
          preset={{ id: showId, title: showTitle, type: performanceType }}
          onClose={() => setLogDialogOpen(false)}
          onLogged={handleLogged}
        />
      )}
      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ShowActionBar;
