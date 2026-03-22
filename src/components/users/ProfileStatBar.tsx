import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { attendance, following, performances, users } from "@prisma/client";
import moment from "moment";
import React, { useState } from "react";

import { followUser, unfollowUser } from "../../data/users";

import UserAvatar from "./UserAvatar";

interface Props {
  attendance: (attendance & {
    performances: performances;
  })[];
  avatarSize: string;
  followers: following[];
  following: following[];
  sessionUser: any | null;
  user: users;
}

function ProfileStatBar({
  attendance,
  avatarSize,
  following,
  followers,
  sessionUser,
  user,
}: Props) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [isFollowing, setIsFollowing] = useState(
    followers.some(
      (f) => f.user === Number(sessionUser?.id) && f.followingUsername === user.username
    )
  );

  function showSnackbar(message: string, severity: "success" | "error") {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  function copyUrlToClipboard() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => showSnackbar("Profile link copied.", "success"))
      .catch(() => showSnackbar("Failed to copy.", "error"));
  }

  async function handleFollow() {
    if (!sessionUser) return;
    try {
      if (isFollowing) {
        await unfollowUser(Number(sessionUser.id), user.username);
        setIsFollowing(false);
        showSnackbar(`Unfollowed ${user.username}.`, "success");
      } else {
        await followUser(Number(sessionUser.id), user.username);
        setIsFollowing(true);
        showSnackbar(`Following ${user.username}.`, "success");
      }
    } catch {
      showSnackbar("Failed to update follow status.", "error");
    }
    setHovered(false);
  }

  const currentYear = moment().format("YYYY");
  const musicalsAttended = attendance.filter((a) => a.performances.type === "MUSICAL").length;
  const playsAttended = attendance.filter((a) => a.performances.type === "PLAY").length;
  const attendanceThisYear = attendance.filter(
    (a) => moment(a.performances.startTime).format("YYYY") === currentYear
  ).length;

  const isOwnProfile = sessionUser && sessionUser.username === user.username;

  const stats = [
    { value: musicalsAttended, label: "Musicals", href: `${user.username}/musicals` },
    { value: playsAttended, label: "Plays", href: `${user.username}/plays` },
    { value: attendanceThisYear, label: "This Year", href: `${user.username}/musicals` },
    { value: following?.length ?? 0, label: "Following", href: `${user.username}/following` },
    { value: followers?.length ?? 0, label: "Followers", href: `${user.username}/followers` },
  ];

  return (
    <>
      {/* Profile header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(212,175,85,0.12)",
          background: "linear-gradient(180deg, #0D1520 0%, #080C14 100%)",
          py: 3,
          px: { xs: 2, md: 4 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "center", sm: "center" }}
          justifyContent="space-between"
          spacing={3}
        >
          {/* Left: avatar + name + actions */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <UserAvatar avatarSize={avatarSize} name={fullName} />
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  color: "#E8DCC8",
                  lineHeight: 1,
                  letterSpacing: "0.01em",
                }}
              >
                {user.username}
              </Typography>
              {(user.firstName || user.lastName) && (
                <Typography
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.75rem",
                    color: "rgba(232,220,200,0.4)",
                    mt: 0.25,
                  }}
                >
                  {fullName}
                </Typography>
              )}
            </Box>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1 }}>
              {isOwnProfile ? (
                <Button
                  href="/settings"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.68rem", letterSpacing: "0.08em", px: 2 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  size="small"
                  variant={isFollowing ? "outlined" : "contained"}
                  onClick={handleFollow}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  sx={{ fontSize: "0.68rem", letterSpacing: "0.08em", px: 2, minWidth: 90 }}
                >
                  {isFollowing ? (hovered ? "Unfollow" : "Following") : "Follow"}
                </Button>
              )}
              <Tooltip title="Copy profile link">
                <IconButton
                  size="small"
                  onClick={copyUrlToClipboard}
                  sx={{ color: "rgba(212,175,85,0.5)", "&:hover": { color: "#D4AF55" } }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Right: stat pills */}
          <Stack
            direction="row"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: "rgba(212,175,85,0.1)" }}
              />
            }
            sx={{
              background: "rgba(212,175,85,0.04)",
              border: "1px solid rgba(212,175,85,0.1)",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {stats.map((stat) => (
              <Box
                key={stat.label}
                component="a"
                href={stat.href}
                sx={{
                  px: { xs: 1.5, md: 2.5 },
                  py: 1.5,
                  textAlign: "center",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  "&:hover": { background: "rgba(212,175,85,0.08)" },
                  "&:hover .stat-n": { color: "#D4AF55" },
                }}
              >
                <Typography
                  className="stat-n"
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "#E8DCC8",
                    lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.52rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(232,220,200,0.35)",
                    mt: 0.25,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Snackbar autoHideDuration={4000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ProfileStatBar;
