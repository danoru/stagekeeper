import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";

import styles from "../../styles/event-calendar.module.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function EventCalendar() {
  return (
    <div className={styles.container}>
      <Calendar localizer={localizer} />
    </div>
  );
}

export default EventCalendar;
