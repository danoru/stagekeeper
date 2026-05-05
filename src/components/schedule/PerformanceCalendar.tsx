import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { musicals, PerformanceType, plays, programming } from "@prisma/client";
import moment from "moment";
import React from "react";

interface Props {
  viewType: "show" | "theatre";
  identifier: string;
  showType?: PerformanceType;
}

interface Event {
  start: Date;
  end: Date;
  title: string;
}

function PerformanceCalendar({ viewType, identifier, showType }: Props) {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [initialDate, setInitialDate] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(true);

  const defaultDayTimes = {
    Tuesday: ["20:00"],
    Wednesday: ["20:00"],
    Thursday: ["20:00"],
    Friday: ["20:00"],
    Saturday: ["14:00", "20:00"],
    Sunday: ["13:00", "18:30"],
  };

  function generateEventDates(
    programming: programming & { musicals?: musicals; plays?: plays },
    dayTimes: Record<string, string[]>
  ): Event[] {
    const { startDate, endDate, musicals, plays, type } = programming;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const events: Event[] = [];
    const duration = type === "MUSICAL" ? musicals?.duration : plays?.duration;
    const title = type === "MUSICAL" ? musicals?.title : plays?.title;

    for (let date = startMoment; date.isSameOrBefore(endMoment); date.add(1, "day")) {
      const dayName = date.format("dddd");
      const times = dayTimes[dayName] || [];
      times.forEach((time) => {
        const [hour, minute] = time.split(":").map(Number);
        const startTime = moment(date).set({ hour, minute });
        const endTime = moment(startTime).add(duration, "minutes");
        events.push({
          start: startTime.toDate(),
          end: endTime.toDate(),
          title: title || "",
        });
      });
    }

    return events;
  }

  React.useEffect(() => {
    async function fetchAndGenerateEvents() {
      setLoading(true);
      try {
        const endpoint =
          viewType === "show"
            ? `/api/shows/programming?title=${identifier}&type=${showType}`
            : `/api/theatres/programming?theatreName=${identifier}`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch performances.");

        const programmingData: (programming & {
          musicals: musicals;
          dayTimes?: Record<string, string[]>;
        })[] = await response.json();

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
      } finally {
        setLoading(false);
      }
    }

    fetchAndGenerateEvents();
  }, [viewType, identifier, showType]);

  const sectionLabel = viewType === "theatre" ? "Season Schedule" : "Upcoming Performances";

  return (
    <Box sx={{ mt: 4, px: { xs: 2, md: 4 }, pb: 4 }}>
      {/* Section header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            whiteSpace: "nowrap",
          }}
        >
          {sectionLabel}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 5,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(232,220,200,0.3)",
            }}
          >
            No upcoming performances scheduled.
          </Typography>
        </Box>
      )}

      {/* Calendar */}
      {initialDate && (
        <FullCalendar
          events={events}
          fixedWeekCount={false}
          initialDate={initialDate}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin]}
        />
      )}
    </Box>
  );
}

export default PerformanceCalendar;
