import { useRouter } from "next/router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import { EVENT_LIST } from "../../data/event-list";
import styles from "../../styles/event-calendar.module.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function EventCalendar() {
  const router = useRouter();
  const userId = router.query.userId;

  function onDoubleClickEvent() {
    return alert("You've clicked on this.");
  }

  const filteredEventList = EVENT_LIST.filter((musical) => musical.attending);

  const calendarDisplay = () => {
    if (userId === "musicalsandmayhem") {
      return filteredEventList;
    } else if (userId === "all") {
      return EVENT_LIST;
    } else {
      return EVENT_LIST;
    }
  };

  return (
    <div className={styles.container}>
      <Calendar
        localizer={localizer}
        events={calendarDisplay()}
        onDoubleClickEvent={onDoubleClickEvent}
      />
    </div>
  );
}

export default EventCalendar;
