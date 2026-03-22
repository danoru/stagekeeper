import { likedShows, musicals, plays, users } from "@prisma/client";
import superjson from "superjson";

import ShowList from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUsers, getUserLikes } from "../../../src/data/users";

interface Props {
  user: users & {
    likedShows: (likedShows & { musicals: musicals; plays: plays })[];
  };
}

interface Params {
  params: { username: string };
}

function UserLikes({ user }: Props) {
  const shows = user.likedShows.map((item) => item.musicals || item.plays).filter(Boolean);

  return (
    <ProfilePageWrapper title={`${user.username}'s Likes • StageKeeper`} username={user.username}>
      <ShowList
        header={`${user.username}'s Liked Shows`}
        shows={shows}
        emptyMessage="No liked shows yet."
      />
    </ProfilePageWrapper>
  );
}

export async function getStaticPaths() {
  const users = await getUsers();
  return {
    paths: users.map((user) => ({ params: { username: user.username } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: Params) {
  const { username } = params;
  const user = await getUserLikes(username);
  if (!user) return { notFound: true };
  return {
    props: superjson.serialize({ user }).json,
    revalidate: 1800,
  };
}

export default UserLikes;
