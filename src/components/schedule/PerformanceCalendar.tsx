import React, { useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import moment from "moment";
import { musicals, PerformanceType, plays, programming } from "@prisma/client";

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
    programming: programming & { musicals?: musicals; plays?: plays },
    dayTimes: Record<string, string[]>
  ): Event[] {
    const { startDate, endDate, musicals, plays, type } = programming;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const events: Event[] = [];
    const duration = type === "MUSICAL" ? musicals?.duration : plays?.duration;
    const title = type === "MUSICAL" ? musicals?.title : plays?.title;

    for (
      let date = startMoment;
      date.isSameOrBefore(endMoment);
      date.add(1, "day")
    ) {
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

  useEffect(() => {
    async function fetchAndGenerateEvents() {
      try {
        const endpoint =
          viewType === "show"
            ? `/api/shows/programming?title=${identifier}&type=${showType}`
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
  }, [viewType, identifier, showType]);

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
