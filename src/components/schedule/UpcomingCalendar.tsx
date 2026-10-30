import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { expandRun, resolveDayTimes } from "../../utils/schedule";

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

  function generateEventDates(programming: Program): Event[] {
    const { duration, source, theatre, title } = programming;
    return expandRun(programming, resolveDayTimes(programming.dayTimes)).map((start) => ({
      start,
      end: moment(start)
        .add(Number(duration) || 150, "minutes")
        .toDate(),
      theatre,
      title,
      source,
    }));
  }

  useEffect(() => {
    async function fetchAndGenerateEvents() {
      try {
        const response = await fetch(`/api/user/programming?userId=${identifier}`);
        if (!response.ok) throw new Error("Failed to fetch performances.");
        const programmingData: Program[] = await response.json();

        const allEvents = programmingData.flatMap((program) => generateEventDates(program));

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
    watchlist: "#D4AF55",
    programming: "#50CB78",
    going: "#50CB78",
  };

  function eventDidMount(info: any) {
    const color = colorMapping[info.event.extendedProps.source] || "#D4AF55";
    const dot = info.el.querySelector(".fc-daygrid-event-dot");
    if (dot) dot.style.borderColor = color;
    // Tint the event pill background based on source
    info.el.style.background =
      color === "#50CB78" ? "rgba(80, 203, 120, 0.18)" : "rgba(212, 175, 85, 0.15)";
    info.el.style.color = color;
    info.el.style.border = "none";
  }

  function handleEventClick(info: any) {
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      theatre: info.event.extendedProps.theatre || "N/A",
      source: info.event.extendedProps.source,
    });
  }

  return (
    <Box>
      {/* Legend */}
      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        {[
          { color: "#D4AF55", label: "Watchlist" },
          { color: "#50CB78", label: "Attending" },
        ].map(({ color, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{ width: 10, height: 10, borderRadius: "50%", background: color, opacity: 0.8 }}
            />
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.45)",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <FullCalendar
        eventClick={handleEventClick}
        eventDidMount={eventDidMount}
        events={events}
        fixedWeekCount={false}
        initialDate={initialDate}
        initialView="dayGridMonth"
        plugins={[dayGridPlugin]}
      />

      {/* Event detail modal */}
      <Modal open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 360,
            background: "#0D1520",
            border: "1px solid rgba(212,175,85,0.2)",
            borderRadius: 1,
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            p: 4,
            outline: "none",
          }}
        >
          {/* Gold top line */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(212,175,85,0.5), transparent)",
              borderRadius: "4px 4px 0 0",
            }}
          />

          {selectedEvent && (
            <>
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#E8DCC8",
                  lineHeight: 1.2,
                  mb: 1.5,
                }}
              >
                {selectedEvent.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.75rem",
                  color: "rgba(212,175,85,0.7)",
                  mb: 0.5,
                }}
              >
                {selectedEvent.theatre}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.72rem",
                  color: "rgba(232,220,200,0.4)",
                }}
              >
                {moment(selectedEvent.start).format("dddd, MMMM Do · h:mm A")}
                {" — "}
                {moment(selectedEvent.end).format("h:mm A")}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default UpcomingCalendar;
