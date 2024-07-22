import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Grid from "@mui/material/Grid";
import Head from "next/head";
import Link from "@mui/material/Link";
import ProfileLinkBar from "../../../src/components/users/ProfileLinkBar";
import Stack from "@mui/material/Stack";
import superjson from "superjson";
import {
  findUserByUsername,
  getUsers,
  getFollowers,
} from "../../../src/data/users";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { users, following } from "@prisma/client";

interface Props {
  user: users;
  followers: (following & { users: users })[];
}

interface Params {
  params: {
    username: string;
  };
}

function UserFollowers({ user, followers }: Props) {
  const title = `${user.username}'s Followers • Savry`;

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <Grid container>
        <Grid item xs={12}>
          <ProfileLinkBar username={user.username} />
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup
            variant="outlined"
            aria-label="Button Group"
            sx={{ flexWrap: "wrap" }}
          >
            <Button href="following">Following</Button>
            <Button href="followers">Followers</Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12}>
          <Stack
            spacing={1}
            divider={<Divider orientation="horizontal" flexItem />}
          >
            {followers.map((follower) => (
              <Stack
                key={follower.users.username}
                direction="row"
                sx={{ alignItems: "center", paddingLeft: "10px" }}
              >
                <div style={{ width: "25%" }}>
                  <Link href={`/${follower.users.username}`} underline="none">
                    {follower.users.username}
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <TheaterComedyIcon />
                </div>
                <div style={{ width: "25%" }}>
                  <WatchLaterIcon />
                </div>
                <div style={{ width: "25%" }}>
                  <FavoriteIcon />
                </div>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  const paths = users.map((user) => ({
    params: { username: user.username },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: Params) {
  const { username } = params;
  const user = await findUserByUsername(username);
  const followers = await getFollowers(username);

  return {
    props: superjson.serialize({
      user,
      followers,
    }).json,
    revalidate: 1800,
  };
}

export default UserFollowers;
