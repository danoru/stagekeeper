import React, { useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LinkIcon from "@mui/icons-material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import UserAvatar from "./UserAvatar";
import { attendance, following, performances, users } from "@prisma/client";
import { followUser, unfollowUser } from "../../data/users";
import moment from "moment";

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
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
    setAnchorEl(null);
  }

  const [isFollowing, setIsFollowing] = useState(
    followers.some(
      (f) =>
        f.user === Number(sessionUser?.id) &&
        f.followingUsername === user.username
    )
  );

  async function handleFollow() {
    if (sessionUser) {
      try {
        if (isFollowing) {
          await unfollowUser(Number(sessionUser.id), user.username);
          setSnackbarMessage("Successfully unfollowed user.");
          setIsFollowing(false);
        } else {
          await followUser(Number(sessionUser.id), user.username);
          setSnackbarMessage("Successfully followed user.");
          setIsFollowing(true);
        }
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage("Failed to update follow status.");
        setSnackbarOpen(true);
      }
      setHovered(false);
    }
  }

  const editButton = (
    <Button variant="outlined" size="small" href={`/settings`}>
      Edit Profile
    </Button>
  );

  const followButton = (
    <Button
      variant="outlined"
      size="small"
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
    <Grid container item sx={{ marginTop: "10px" }}>
      <Grid container item xs={6} justifyContent="center" alignItems="center">
        <UserAvatar avatarSize={avatarSize} name={fullName} />
        <Typography variant="h5" sx={{ margin: "0 10px" }}>
          {user.username}
        </Typography>
        {sessionUser && sessionUser.username === user.username
          ? editButton
          : followButton}
        <Grid item>
          <Button
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            size="small"
          >
            ...
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={copyUrlToClipboard}>
              <LinkIcon /> &nbsp; Copy profile link
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
      <Grid container item xs={6} justifyContent="center">
        <Button size="small" href={`${user.username}/musicals`}>
          {`${attendance.length} MUSICALS`}
        </Button>
        <Button size="small" href={`${user.username}/musicals`}>
          {`${attendanceThisYear?.length} THIS YEAR`}
        </Button>
        <Button size="small" href={`${user.username}/following`}>
          {`${following?.length} FOLLOWING`}
        </Button>
        <Button size="small" href={`${user.username}/followers`}>
          {`${followers?.length} FOLLOWERS`}
        </Button>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default ProfileStatBar;
