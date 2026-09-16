import { likedShows, musicals, plays, users } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ShowList, { type ShowListItem } from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserLikes } from "../../../src/data/users";

interface Props {
  user: users & {
    likedShows: (likedShows & { musicals: musicals; plays: plays })[];
  };
}

function UserLikes({ user }: Props) {
  const shows: ShowListItem[] = user.likedShows.flatMap((item) => {
    const show = item.type === "MUSICAL" ? item.musicals : item.plays;
    return show ? [{ ...show, type: item.type }] : [];
  });

  return (
    <ProfilePageWrapper title={`${user.username}'s Likes • StageKeeper`} username={user.username}>
      <ShowList
        emptyMessage="No liked shows yet."
        header={`${user.username}'s Liked Shows`}
        shows={shows}
      />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const username = String(params?.username);
  const user = await getUserLikes(username);
  if (!user) return { notFound: true };
  return {
    props: superjson.serialize({ user }).json,
  };
}

export default UserLikes;
