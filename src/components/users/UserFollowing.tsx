import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { following } from "@prisma/client";

import UserAvatar from "./UserAvatar";

interface Props {
  following: following[];
}

function UserFollowing({ following }: Props) {
  return (
    <Grid>
      <Grid
        item
        style={{
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "theme.palette.secondary",
          display: "flex",
          justifyContent: "space-between",
          lineHeight: "0",
          margin: "0 auto",
          width: "75%",
        }}
      >
        <Typography component="div" variant="h6">
          FOLLOWING
        </Typography>
      </Grid>
      <Grid
        container
        item
        columnSpacing={1}
        rowSpacing={1}
        sx={{
          margin: "10px auto",
          maxWidth: "75%",
        }}
      >
        {following?.map((user: any, i: number) => (
          <Grid key={i}>
            <Button href={`/users/${user.followingUsername}`}>
              <UserAvatar avatarSize="56px" name={user.followingUsername} />
            </Button>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

export default UserFollowing;
