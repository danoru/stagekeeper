import { useRouter } from "next/router";
import { filteredEventList } from "../../../src/data/events";
import { List, ListItem, ListItemText } from "@mui/material";
import moment from "moment";

function ProfilePage(session: any) {
  const router = useRouter();
  const username = router.query.username;

  return (
    <div>
      <h1>Hello, {username}!</h1>
      {/* <EventCalendar /> */}
      <div>
        <h1>Upcoming Events</h1>
        <List>
          {filteredEventList?.map((event, i) => {
            return (
              <ListItem key={event.id}>
                <ListItemText
                  primary={`You have an upcoming event, ${
                    event.title
                  }, on ${moment(event.start).format("LLL")}, at ${
                    event.playhouse
                  } in ${event.location}.`}
                />
              </ListItem>
            );
          })}
        </List>
      </div>
    </div>
  );
}

export default ProfilePage;
