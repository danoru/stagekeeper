import { useRouter } from "next/router";
import { filteredEventList } from "../../../src/data/events";
import { List, ListItem, ListItemText } from "@mui/material";

import EventCalendar from "../../../src/components/schedule/event-calendar";

function ProfilePage() {
  const humanReadableUsername = () => {
    const router = useRouter();
    const userId = router.query.userId;

    if (userId === "musicalsandmayhem") {
      return "Musicals and Mayhem";
    } else if (userId === "all") {
      return "Everyone";
    } else {
      return userId;
    }
  };

  return (
    <div>
      <h1>Hello, {humanReadableUsername()}!</h1>
      <p>
        This page is under construction. Know what you'd want to see here?
        Contact the administrator with your ideas!
      </p>
      <EventCalendar />
      <div>
        <h1>Upcoming Events</h1>
        <List>
          {filteredEventList?.map((event, i) => {
            return (
              <ListItem key={event.id}>
                <ListItemText
                  primary={`You have an upcoming event, ${event.title}, on ${event.start}, at ${event.playhouse} in ${event.location}`}
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
