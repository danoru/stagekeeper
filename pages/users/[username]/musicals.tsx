import { attendance, musicals, performances, theatres, users } from "@prisma/client";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import superjson from "superjson";

import ShowList from "../../../src/components/shows/ShowList";
import ProfilePageWrapper from "../../../src/components/users/ProfilePageWrapper";
import { getUserMusicalAttendance } from "../../../src/data/musicals";
import { findUserByUsername } from "../../../src/data/users";

interface Props {
  user: users;
  attendance: (attendance & {
    performances: (performances & { musicals: musicals | null; theatres: theatres }) | null;
    musicals: musicals | null;
    theatres: theatres | null;
  })[];
}

function UserMusicalsList({ attendance, user }: Props) {
  const currentDate = moment();
  const uniqueTitles = new Set<string>();
  const shows: musicals[] = [];

  for (const a of attendance) {
    const musical = a.performances?.musicals ?? a.musicals;
    if (!musical) continue;
    const date = a.performances?.startTime
      ? moment(a.performances.startTime)
      : a.seenDate
        ? moment(a.seenDate)
        : null;
    if (date && date.isAfter(currentDate)) continue;
    if (uniqueTitles.has(musical.title)) continue;
    uniqueTitles.add(musical.title);
    shows.push(musical);
  }

  return (
    <ProfilePageWrapper
      title={`${user.username}'s Musicals • StageKeeper`}
      username={user.username}
    >
      <ShowList
        emptyMessage="No musicals logged yet."
        header={`${user.username}'s Musicals`}
        shows={shows}
      />
    </ProfilePageWrapper>
  );
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const username = String(params?.username);
  const user = await findUserByUsername(username);
  if (!user) return { notFound: true };
  const attendance = await getUserMusicalAttendance(user.id);
  return {
    props: superjson.serialize({ attendance, user }).json,
  };
}

export default UserMusicalsList;
