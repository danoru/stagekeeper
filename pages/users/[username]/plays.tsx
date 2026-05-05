import { attendance, plays, performances, theatres, users } from "@prisma/client";
import moment from "moment";
import superjson from "superjson";

import ShowList from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserPlayAttendance } from "../../../src/data/plays";
import { getUsers, findUserByUsername } from "../../../src/data/users";

interface Props {
  user: users;
  attendance: (attendance & {
    performances: (performances & { plays: plays | null; theatres: theatres }) | null;
    plays: plays | null;
    theatres: theatres | null;
  })[];
}

interface Params {
  params: { username: string };
}

function UserPlaysList({ attendance, user }: Props) {
  const currentDate = moment();
  const uniqueTitles = new Set<string>();
  const shows: plays[] = [];

  for (const a of attendance) {
    // Resolve the show + effective date from either the precise or vague side.
    const play = a.performances?.plays ?? a.plays;
    if (!play) continue;
    const date = a.performances?.startTime
      ? moment(a.performances.startTime)
      : a.seenDate
        ? moment(a.seenDate)
        : null;
    // Future dates are upcoming, not seen yet. Vague rows with no date count as seen.
    if (date && date.isAfter(currentDate)) continue;
    if (uniqueTitles.has(play.title)) continue;
    uniqueTitles.add(play.title);
    shows.push(play);
  }

  return (
    <ProfilePageWrapper title={`${user.username}'s Plays • StageKeeper`} username={user.username}>
      <ShowList
        emptyMessage="No plays logged yet."
        header={`${user.username}'s Plays`}
        shows={shows}
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
  const attendance = await getUserPlayAttendance(user.id);
  return {
    props: superjson.serialize({ attendance, user }).json,
    revalidate: 1800,
  };
}

export default UserPlaysList;
