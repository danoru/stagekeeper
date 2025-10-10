import Add from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { users } from "@prisma/client";
import Head from "next/head";
import superjson from "superjson";

import { getUsers } from "../../src/data/users";

interface Props {
  users: users[];
}

function UsersPage({ users }: Props) {
  const filteredUsers = users.filter((user) => user.username !== "guest");

  return (
    <div>
      <Head>
        <title>Users • StageKeeper</title>
      </Head>
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center" }}>
          <h2>Musical lovers, critics and friends — find popular members.</h2>
        </Grid>
        <Grid size={{ xs: 8 }}>
          <Stack divider={<Divider flexItem orientation="horizontal" />} spacing={1}>
            {filteredUsers.map((user) => (
              <Stack
                key={user.username}
                direction="row"
                sx={{ alignItems: "center", paddingLeft: "10px" }}
              >
                <div style={{ width: "25%" }}>
                  <Link href={`/users/${user.username}`} underline="none">
                    {user.username}
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Link href={`/users/${user.username}/musicals`} underline="none">
                    <Tooltip placement="top-start" title={`${user.username}'s Musicals`}>
                      <TheaterComedyIcon />
                    </Tooltip>
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Link href={`/users/${user.username}/watchlist`} underline="none">
                    <Tooltip placement="top-start" title={`${user.username}'s Watchlist`}>
                      <WatchLaterIcon />
                    </Tooltip>
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Link href={`/users/${user.username}/likes`} underline="none">
                    <Tooltip placement="top-start" title={`${user.username}'s Likes`}>
                      <FavoriteIcon />
                    </Tooltip>
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Button disabled>
                    <Add />
                  </Button>
                </div>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export async function getStaticProps() {
  const users = await getUsers();

  return {
    props: superjson.serialize({
      users,
    }).json,
  };
}

export default UsersPage;
