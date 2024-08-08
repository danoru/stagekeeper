import React, { useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import moment from "moment";
import { musicals, programming } from "@prisma/client";

interface Props {
  viewType: "musical" | "theatre";
  identifier: string;
}

interface Event {
  start: Date;
  end: Date;
  title: string;
}

function PerformanceCalendar({ viewType, identifier }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const defaultDayTimes = {
    Tuesday: ["20:00"],
    Wednesday: ["20:00"],
    Thursday: ["20:00"],
    Friday: ["20:00"],
    Saturday: ["14:00", "20:00"],
    Sunday: ["13:00", "18:30"],
  };

  function generateEventDates(
    programming: programming & { musicals: musicals },
    dayTimes: Record<string, string[]>
  ): Event[] {
    const { startDate, endDate, musicals } = programming;
    const startMoment = moment.tz(startDate, "America/Los_Angeles");
    const endMoment = moment.tz(endDate, "America/Los_Angeles");
    const events: Event[] = [];

    for (
      let date = startMoment;
      date.isSameOrBefore(endMoment);
      date.add(1, "day")
    ) {
      const dayName = date.format("dddd");
      const times = dayTimes[dayName] || [];
      times.forEach((time) => {
        const [hour, minute] = time.split(":").map(Number);
        const startTime = moment
          .tz(date, "America/Los_Angeles")
          .set({ hour, minute });
        const endTime = moment
          .tz(startTime, "America/Los_Angeles")
          .add(musicals.duration || 150, "minutes");
        events.push({
          start: startTime.toDate(),
          end: endTime.toDate(),
          title: musicals.title,
        });
      });
    }

    return events;
  }

  useEffect(() => {
    async function fetchAndGenerateEvents() {
      try {
        const endpoint =
          viewType === "musical"
            ? `/api/musicals/programming?musicalTitle=${identifier}`
            : `/api/theatres/programming?theatreName=${identifier}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch performances.");
        }
        const programmingData: (programming & {
          musicals: musicals;
          dayTimes?: Record<string, string[]>;
        })[] = await response.json();
        const allEvents = programmingData.flatMap((program) =>
          generateEventDates(program, program.dayTimes || defaultDayTimes)
        );

        if (allEvents.length > 0) {
          const earliestDate = new Date(
            Math.min(...allEvents.map((e) => e.start.getTime()))
          );
          setInitialDate(earliestDate);
        }

        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching performances:", error);
      }
    }

    fetchAndGenerateEvents();
  }, [viewType, identifier]);

  if (initialDate) {
    return (
      <div style={{ margin: "0 auto", maxWidth: "75%" }}>
        <FullCalendar
          events={events}
          fixedWeekCount={false}
          initialDate={initialDate}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin]}
        />
      </div>
    );
  }

  return <></>;
}

export default PerformanceCalendar;
