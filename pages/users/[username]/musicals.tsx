import { attendance, musicals, performances, theatres, users } from "@prisma/client";
import moment from "moment";
import superjson from "superjson";

import ShowList from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserMusicalAttendance } from "../../../src/data/musicals";
import { getUsers, findUserByUsername } from "../../../src/data/users";

interface Props {
  user: users;
  attendance: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
}

interface Params {
  params: { username: string };
}

function UserMusicalsList({ attendance, user }: Props) {
  const currentDate = moment();
  const uniqueTitles = new Set<string>();
  const filteredAttendance = attendance.filter((a) => {
    const startTime = moment(a.performances.startTime);
    const title = a.performances.musicals?.title;
    if (startTime <= currentDate && title && !uniqueTitles.has(title)) {
      uniqueTitles.add(title);
      return true;
    }
    return false;
  });
  const shows = filteredAttendance.map((a) => a.performances.musicals);

  return (
    <ProfilePageWrapper
      title={`${user.username}'s Musicals • StageKeeper`}
      username={user.username}
    >
      <ShowList
        header={`${user.username}'s Musicals`}
        shows={shows}
        emptyMessage="No musicals logged yet."
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
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const attendance = await getUserMusicalAttendance(user.id);
  return {
    props: superjson.serialize({ attendance, user }).json,
    revalidate: 1800,
  };
}

export default UserMusicalsList;
