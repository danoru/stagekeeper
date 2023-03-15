import { useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import { EVENT_LIST } from "../../data/event-list";
import styles from "../../styles/event-calendar.module.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function EventCalendar() {
  function onDoubleClickEvent() {
    return alert("You've clicked on this.");
  }

  return (
    <div className={styles.container}>
      <Calendar
        localizer={localizer}
        events={EVENT_LIST}
        onDoubleClickEvent={onDoubleClickEvent}
      />
    </div>
  );
}

export default EventCalendar;
