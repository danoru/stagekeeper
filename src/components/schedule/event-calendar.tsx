import { useRouter } from "next/router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import { EVENT_LIST, filteredEventList } from "../../data/events";
import styles from "../../styles/event-calendar.module.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useEffect, useRef } from "react";

const localizer = momentLocalizer(moment);

function EventCalendar() {
  const router = useRouter();
  const userId = router.query.userId;
  const clickRef: any = useRef(null);

  const calendarDisplay = () => {
    if (userId === "musicalsandmayhem") {
      return filteredEventList;
    } else if (userId === "all") {
      return EVENT_LIST;
    } else {
      return EVENT_LIST;
    }
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(clickRef?.current);
    };
  }, []);

  const onSelectEvent = useCallback((calEvent: any) => {
    window.clearTimeout(clickRef?.current);
    clickRef.current = window.setTimeout(() => {
      window.alert(JSON.stringify(calEvent));
    }, 250);
  }, []);

  const onDoubleClickEvent = useCallback((calEvent: any) => {
    window.clearTimeout(clickRef?.current);
    clickRef.current = window.setTimeout(() => {
      window.alert(JSON.stringify(calEvent));
    }, 250);
  }, []);

  return (
    <div className={styles.container}>
      <Calendar
        localizer={localizer}
        onSelectEvent={onSelectEvent}
        onDoubleClickEvent={onDoubleClickEvent}
        events={calendarDisplay()}
      />
    </div>
  );
}

export default EventCalendar;
