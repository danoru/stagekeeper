import Add from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Grid from "@mui/material/Grid";
import Head from "next/head";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import superjson from "superjson";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import Tooltip from "@mui/material/Tooltip";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { getUsers } from "../../src/data/users";
import { users } from "@prisma/client";

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
        <Grid item sx={{ textAlign: "center" }} xs={12}>
          <h2>Musical lovers, critics and friends — find popular members.</h2>
        </Grid>
        <Grid item xs={8}>
          <Stack
            spacing={1}
            divider={<Divider orientation="horizontal" flexItem />}
          >
            {filteredUsers.map((user) => (
              <Stack
                key={user.username}
                direction="row"
                sx={{ alignItems: "center", paddingLeft: "10px" }}
              >
                <div style={{ width: "25%" }}>
                  <Link href={`/${user.username}`} underline="none">
                    {user.username}
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Link href={`/${user.username}/musicals`} underline="none">
                    <Tooltip
                      title={`${user.username}'s Musicals`}
                      placement="top-start"
                    >
                      <TheaterComedyIcon />
                    </Tooltip>
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Link
                    href={`users/${user.username}/watchlist`}
                    underline="none"
                  >
                    <Tooltip
                      title={`${user.username}'s Watchlist`}
                      placement="top-start"
                    >
                      <WatchLaterIcon />
                    </Tooltip>
                  </Link>
                </div>
                <div style={{ width: "25%" }}>
                  <Link href={`users/${user.username}/likes`} underline="none">
                    <Tooltip
                      title={`${user.username}'s Likes`}
                      placement="top-start"
                    >
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
