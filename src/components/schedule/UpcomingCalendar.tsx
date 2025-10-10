import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import moment from "moment";
import React, { useEffect, useState } from "react";

interface Props {
  identifier: number;
}

interface Program {
  startDate: Date;
  endDate: Date;
  duration: string;
  source: string;
  title: string;
  theatre: string;
  dayTimes: Record<string, string[]>;
}

interface Event {
  start: Date;
  end: Date;
  theatre: string;
  title: string;
  source?: string;
}

function UpcomingCalendar({ identifier }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const defaultDayTimes = {
    Tuesday: ["20:00"],
    Wednesday: ["20:00"],
    Thursday: ["20:00"],
    Friday: ["20:00"],
    Saturday: ["14:00", "20:00"],
    Sunday: ["13:00", "18:30"],
  };

  function generateEventDates(programming: Program, dayTimes: Record<string, string[]>): Event[] {
    const { startDate, endDate, duration, source, theatre, title } = programming;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const events: Event[] = [];

    for (let date = startMoment; date.isSameOrBefore(endMoment); date.add(1, "day")) {
      const dayName = date.format("dddd");
      const times = dayTimes[dayName] || [];
      times.forEach((time) => {
        const [hour, minute] = time.split(":").map(Number);
        const startTime = moment(date).set({ hour, minute });
        const endTime = moment(startTime).add(duration || 150, "minutes");
        events.push({
          start: startTime.toDate(),
          end: endTime.toDate(),
          theatre: theatre,
          title: title,
          source: source,
        });
      });
    }

    return events;
  }

  useEffect(() => {
    async function fetchAndGenerateEvents() {
      try {
        const response = await fetch(`/api/user/programming?userId=${identifier}`);
        if (!response.ok) {
          throw new Error("Failed to fetch performances.");
        }
        const programmingData: Program[] = await response.json();

        const allEvents = programmingData.flatMap((program) =>
          generateEventDates(program, program.dayTimes || defaultDayTimes)
        );

        if (allEvents.length > 0) {
          const earliestDate = new Date(Math.min(...allEvents.map((e) => e.start.getTime())));
          setInitialDate(earliestDate);
        }
        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching performances:", error);
      }
    }

    fetchAndGenerateEvents();
  }, [identifier]);

  const colorMapping: Record<string, string> = {
    watchlist: "primary",
    programming: "#50CB78",
  };

  function eventDidMount(info: any) {
    const event = info.event;
    const color = colorMapping[event.extendedProps.source] || "purple";

    const dot = info.el.querySelector(".fc-daygrid-event-dot");
    if (dot) {
      dot.style.borderColor = color;
    }
  }

  function handleEventClick(info: any) {
    const event = info.event;
    const eventDetails = {
      title: event.title,
      start: event.start,
      end: event.end,
      theatre: event.extendedProps.theatre || "N/A",
    };

    setSelectedEvent(eventDetails);
  }
  return (
    <div style={{ margin: "0 auto", maxWidth: "75%" }}>
      <FullCalendar
        eventClick={handleEventClick}
        eventDidMount={eventDidMount}
        events={events}
        fixedWeekCount={false}
        initialDate={initialDate}
        initialView="dayGridMonth"
        plugins={[dayGridPlugin]}
      />
      <Modal open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #FFF",
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedEvent && (
            <>
              <Typography component="h2" variant="h6">
                {selectedEvent.title}
              </Typography>
              <Typography variant="subtitle1">{selectedEvent.theatre}</Typography>
              <Typography variant="subtitle2">
                {moment(selectedEvent.start).format("LT")}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default UpcomingCalendar;
