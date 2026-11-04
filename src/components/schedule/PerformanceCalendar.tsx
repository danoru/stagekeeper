import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { musicals, PerformanceType, plays, programming } from "@prisma/client";
import moment from "moment";
import React from "react";

import { expandRun, hasDayTimes, resolveDayTimes } from "../../utils/schedule";

const ESTIMATED_CLASS = "sk-estimated";

interface Props {
  viewType: "show" | "theatre";
  identifier: string;
  showType?: PerformanceType;
}

interface Event {
  start: Date;
  end: Date;
  title: string;
  classNames?: string[];
}

function PerformanceCalendar({ viewType, identifier, showType }: Props) {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [initialDate, setInitialDate] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(true);

  function generateEventDates(
    programming: programming & { musicals?: musicals; plays?: plays }
  ): Event[] {
    const { musicals, plays, type } = programming;
    const duration = (type === "MUSICAL" ? musicals?.duration : plays?.duration) ?? 150;
    const title = (type === "MUSICAL" ? musicals?.title : plays?.title) ?? "";
    const estimated = !hasDayTimes(programming.dayTimes);

    return expandRun(programming, resolveDayTimes(programming.dayTimes)).map((start) => ({
      start,
      end: moment(start).add(duration, "minutes").toDate(),
      title,
      classNames: estimated ? [ESTIMATED_CLASS] : [],
    }));
  }

  React.useEffect(() => {
    async function fetchAndGenerateEvents() {
      setLoading(true);
      try {
        const endpoint =
          viewType === "show"
            ? `/api/shows/programming?title=${encodeURIComponent(identifier)}&type=${showType}`
            : `/api/theatres/programming?theatreName=${encodeURIComponent(identifier)}`;
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch performances.");

        const programmingData: (programming & {
          musicals?: musicals;
          plays?: plays;
        })[] = await response.json();

        const allEvents = programmingData.flatMap((program) => generateEventDates(program));

        if (allEvents.length > 0) {
          // Open on the first upcoming showtime rather than a month that's already over.
          const now = Date.now();
          const times = allEvents.map((e) => e.start.getTime());
          const upcoming = times.filter((t) => t >= now);
          setInitialDate(new Date(Math.min(...(upcoming.length > 0 ? upcoming : times))));
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
  const hasEstimates = events.some((e) => e.classNames?.includes(ESTIMATED_CLASS));

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

      {hasEstimates && (
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.75rem",
            color: "rgba(232,220,200,0.6)",
            mb: 1.5,
          }}
        >
          <Box component="span" sx={{ fontStyle: "italic", color: "#D4AF55" }}>
            Estimated times.
          </Box>{" "}
          {`Dimmed showtimes are a typical week, not the theatre's published schedule. Check with the theatre before you buy tickets.`}
        </Typography>
      )}

      {/* Calendar */}
      {initialDate && (
        <Box sx={{ [`& .${ESTIMATED_CLASS}`]: { opacity: 0.55, fontStyle: "italic" } }}>
          <FullCalendar
            events={events}
            fixedWeekCount={false}
            initialDate={initialDate}
            initialView="dayGridMonth"
            plugins={[dayGridPlugin]}
          />
        </Box>
      )}
    </Box>
  );
}

export default PerformanceCalendar;
