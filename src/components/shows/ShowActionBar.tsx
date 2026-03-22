import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import LocalActivity from "@mui/icons-material/LocalActivity";
import LocalActivityOutlined from "@mui/icons-material/LocalActivityOutlined";
import WatchLater from "@mui/icons-material/WatchLater";
import WatchLaterOutlined from "@mui/icons-material/WatchLaterOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type {
  attendance,
  likedShows,
  musicals,
  performances,
  plays,
  watchlist,
} from "@prisma/client";
import React, { useState } from "react";

interface Props {
  attendance: (attendance & { performances: performances })[];
  likedShows: likedShows[];
  musical?: musicals;
  play?: plays;
  sessionUser: any;
  watchlist: watchlist[];
}

function ShowActionBar({ attendance, likedShows, musical, play, sessionUser, watchlist }: Props) {
  const userId = Number(sessionUser?.id);
  const musicalId = musical ? Number(musical.id) : undefined;
  const playId = play ? Number(play.id) : undefined;
  const performanceType = musical ? "MUSICAL" : play ? "PLAY" : null;

  const existingAttendance = attendance?.find(
    (a) =>
      a.user === userId &&
      (performanceType === "MUSICAL"
        ? a.performances.musical === musicalId
        : a.performances.play === playId)
  );

  const [hasAttended, setHasAttended] = useState(!!existingAttendance);
  const [attendanceId, setAttendanceId] = useState<number | null>(existingAttendance?.id ?? null);
  const [currentRating, setCurrentRating] = useState<number | null>(
    existingAttendance?.rating ? Number(existingAttendance.rating) : null
  );
  const [comment, setComment] = useState<string>(existingAttendance?.comment ?? "");
  const [commentDraft, setCommentDraft] = useState<string>(existingAttendance?.comment ?? "");
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isWatchlisted, setIsWatchlisted] = useState(
    userId
      ? watchlist.some(
          (w) =>
            w.user === userId &&
            (performanceType === "MUSICAL" ? w.musical === musicalId : w.play === playId)
        )
      : false
  );

  const [isLiked, setIsLiked] = useState(
    userId
      ? likedShows.some(
          (l) =>
            l.user === userId &&
            (performanceType === "MUSICAL" ? l.musical === musicalId : l.play === playId)
        )
      : false
  );

  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  function showSnackbar(message: string, severity: "success" | "error") {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  async function handleAttendance() {
    if (!sessionUser) return;

    if (hasAttended && attendanceId) {
      // Remove attendance
      const response = await fetch("/api/shows/attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId }),
      });
      if (response.ok) {
        setHasAttended(false);
        setAttendanceId(null);
        setCurrentRating(null);
        setComment("");
        setCommentDraft("");
        setShowReviewPanel(false);
        showSnackbar("Removed from attended shows.", "success");
      } else {
        showSnackbar("Failed to remove attendance.", "error");
      }
    } else {
      // Log attendance
      const response = await fetch("/api/shows/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: performanceType,
          musicalId,
          playId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setHasAttended(true);
        setAttendanceId(data.attendance.id);
        setShowReviewPanel(true);
        showSnackbar("Logged as attended! Add a rating or note below.", "success");
      } else {
        showSnackbar(data.error || "Failed to log attendance.", "error");
      }
    }
  }

  async function handleRating(newValue: number | null) {
    if (!sessionUser || !hasAttended || !attendanceId) return;
    setCurrentRating(newValue);
    const response = await fetch("/api/shows/attendance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, rating: newValue }),
    });
    if (!response.ok) {
      showSnackbar("Failed to save rating.", "error");
    }
  }

  async function handleSaveComment() {
    if (!sessionUser || !hasAttended || !attendanceId) return;
    setIsSaving(true);
    const response = await fetch("/api/shows/attendance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, comment: commentDraft }),
    });
    setIsSaving(false);
    if (response.ok) {
      setComment(commentDraft);
      showSnackbar("Note saved.", "success");
    } else {
      showSnackbar("Failed to save note.", "error");
    }
  }

  async function handleLikes() {
    if (!sessionUser) return;
    const method = isLiked ? "DELETE" : "POST";
    const response = await fetch("/api/shows/likes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userId,
        method,
        type: performanceType,
        musical: musicalId,
        play: playId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setIsLiked(!isLiked);
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
        user: userId,
        method,
        type: performanceType,
        musical: musicalId,
        play: playId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setIsWatchlisted(!isWatchlisted);
      showSnackbar(isWatchlisted ? "Removed from watchlist." : "Added to watchlist.", "success");
    } else {
      showSnackbar(data.error || "Failed to update watchlist.", "error");
    }
  }

  const copyUrlToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showSnackbar("Successfully copied.", "success");
      })
      .catch(() => showSnackbar("Failed to copy.", "error"));
  };

  const AttendanceButton = () => (
    <Stack alignItems="center" direction="column" width="33%">
      <Button
        onClick={handleAttendance}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Typography variant="subtitle1">
          {hasAttended ? (
            <LocalActivity fontSize="large" />
          ) : (
            <LocalActivityOutlined fontSize="large" />
          )}
        </Typography>
      </Button>
      <Typography variant="subtitle1">
        {hasAttended ? (hovered ? "Remove" : "Attended") : "Attend"}
      </Typography>
    </Stack>
  );

  const LikedButton = () => (
    <Stack alignItems="center" direction="column" width="33%">
      <Button
        onClick={handleLikes}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Typography variant="subtitle1">
          {isLiked ? <FavoriteIcon fontSize="large" /> : <FavoriteBorder fontSize="large" />}
        </Typography>
      </Button>
      <Typography variant="subtitle1">
        {isLiked ? (hovered ? "Remove" : "Liked") : "Like"}
      </Typography>
    </Stack>
  );

  const WatchlistButton = () => (
    <Stack alignItems="center" direction="column" width="33%">
      <Button
        onClick={handleWatchlist}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Typography variant="subtitle1">
          {isWatchlisted ? (
            <WatchLater fontSize="large" />
          ) : (
            <WatchLaterOutlined fontSize="large" />
          )}
        </Typography>
      </Button>
      <Typography variant="subtitle1">
        {isWatchlisted ? (hovered ? "Remove" : "Watchlist") : "Watchlist"}
      </Typography>
    </Stack>
  );

  return (
    <Paper sx={{ borderRadius: "1%" }}>
      {sessionUser ? (
        <>
          <Stack direction="row" justifyContent="center">
            <AttendanceButton />
            <LikedButton />
            <WatchlistButton />
          </Stack>
          <Divider />
          <Stack alignItems="center" padding="1vh 0" spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {hasAttended ? "Your rating" : "Rate after attending"}
            </Typography>
            <Rating
              disabled={!hasAttended}
              value={currentRating}
              onChange={(_: React.SyntheticEvent, newValue: number | null) =>
                handleRating(newValue)
              }
            />
          </Stack>
          <Collapse in={hasAttended}>
            <Divider />
            <Stack padding="1vh" spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Your note
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder="How was it? Memorable moments, cast standouts..."
                size="small"
                value={commentDraft}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCommentDraft(e.target.value)
                }
                inputProps={{ maxLength: 500 }}
              />
              <Button
                disabled={isSaving || commentDraft === comment}
                fullWidth
                size="small"
                sx={{ textTransform: "none" }}
                variant="outlined"
                onClick={handleSaveComment}
              >
                {isSaving ? "Saving…" : "Save note"}
              </Button>
            </Stack>
          </Collapse>
        </>
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
      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ShowActionBar;
