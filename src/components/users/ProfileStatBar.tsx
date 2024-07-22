import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import LinkIcon from "@mui/icons-material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import UserAvatar from "./UserAvatar";
import { attendance, following, users } from "@prisma/client";
import { followUser, unfollowUser } from "../../data/users";

interface Props {
  attendance: attendance[];
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

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  const [copied, setCopied] = useState(false);
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

  const isSessionUser = sessionUser?.username === user.username;
  const followingStatus = followers.some(
    (f) => f.user === sessionUser?.id && f.followingUsername === user.username
  );

  const [isFollowing, setIsFollowing] = useState(followingStatus);

  async function handleFollow() {
    if (sessionUser) {
      if (isFollowing) {
        await unfollowUser(sessionUser.id, user.username);
        setIsFollowing(false);
      } else {
        await followUser(sessionUser.id, user.username);
        setIsFollowing(true);
      }
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
      onMouseEnter={(e) => {
        if (isFollowing) {
          e.currentTarget.textContent = "Unfollow";
        }
      }}
      onMouseLeave={(e) => {
        if (isFollowing) {
          e.currentTarget.textContent = "Following";
        }
      }}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );

  return (
    <Grid container item sx={{ marginTop: "10px" }}>
      <Grid container item xs={6} justifyContent="center" alignItems="center">
        <UserAvatar avatarSize={avatarSize} name={fullName} />
        <Typography variant="h5" sx={{ margin: "0 10px" }}>
          {user.username}
        </Typography>
        {sessionUser && isSessionUser ? editButton : followButton}
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
            <MenuItem>
              <Link href="/settings" underline="none">
                Settings
              </Link>
            </MenuItem>
            <MenuItem onClick={copyUrlToClipboard}>
              <LinkIcon /> &nbsp; Copy profile link
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
      <Grid container item xs={6} justifyContent="center">
        <Button
          size="small"
          href={`${user.username}/recipes`}
        >{`${attendance.length} RECIPES`}</Button>
        <Button
          size="small"
          href={`${user.username}/recipes`}
        >{`${attendance.length} THIS YEAR`}</Button>
        <Button
          size="small"
          href={`${user.username}/following`}
        >{`${following?.length} FOLLOWING`}</Button>
        <Button size="small" href={`${user.username}/followers`}>
          {`${followers?.length} FOLLOWERS`}
        </Button>
      </Grid>
    </Grid>
  );
}

export default ProfileStatBar;
