import LinkIcon from "@mui/icons-material/Link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
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
  const fullName = user.firstName + " " + user.lastName;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  function copyUrlToClipboard() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setSnackbarMessage("Successfully copied.");
        setSnackbarOpen(true);
        setSnackbarSeverity("success");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        setSnackbarMessage("Failed to copy.");
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
      });
    setAnchorEl(null);
  }

  const [isFollowing, setIsFollowing] = useState(
    followers.some(
      (f) => f.user === Number(sessionUser?.id) && f.followingUsername === user.username
    )
  );

  async function handleFollow() {
    if (sessionUser) {
      try {
        if (isFollowing) {
          await unfollowUser(Number(sessionUser.id), user.username);
          setSnackbarMessage("Successfully unfollowed user.");
          setIsFollowing(false);
          setSnackbarSeverity("success");
        } else {
          await followUser(Number(sessionUser.id), user.username);
          setSnackbarMessage("Successfully followed user.");
          setIsFollowing(true);
          setSnackbarSeverity("success");
        }
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage("Failed to update follow status.");
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
      }
      setHovered(false);
    }
  }

  const editButton = (
    <Button href={`/settings`} size="small" variant="outlined">
      Edit Profile
    </Button>
  );

  const followButton = (
    <Button
      size="small"
      variant="outlined"
      onClick={handleFollow}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isFollowing ? (hovered ? "Unfollow" : "Following") : "Follow"}
    </Button>
  );

  const currentYear = moment().format("YYYY");
  const attendanceThisYear = attendance.filter((a) => {
    const startTime = moment(a.performances.startTime);
    return moment(startTime).format("YYYY") === currentYear;
  });

  return (
    <Grid container sx={{ marginTop: "10px" }}>
      <Grid container alignItems="center" justifyContent="center" size={{ xs: 6 }}>
        <UserAvatar avatarSize={avatarSize} name={fullName} />
        <Typography sx={{ margin: "0 10px" }} variant="h5">
          {user.username}
        </Typography>
        {sessionUser && sessionUser.username === user.username ? editButton : followButton}
        <Grid>
          <Button
            aria-controls={open ? "basic-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            size="small"
            onClick={handleClick}
          >
            ...
          </Button>
          <Menu
            anchorEl={anchorEl}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={copyUrlToClipboard}>
              <LinkIcon /> &nbsp; Copy profile link
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
      <Grid container justifyContent="center" size={{ xs: 6 }}>
        <Button href={`${user.username}/musicals`} size="small">
          {`${attendance.length} MUSICALS`}
        </Button>
        <Button href={`${user.username}/musicals`} size="small">
          {`${attendanceThisYear?.length} THIS YEAR`}
        </Button>
        <Button href={`${user.username}/following`} size="small">
          {`${following?.length} FOLLOWING`}
        </Button>
        <Button href={`${user.username}/followers`} size="small">
          {`${followers?.length} FOLLOWERS`}
        </Button>
      </Grid>
      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default ProfileStatBar;
