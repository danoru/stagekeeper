import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import moment from "moment";
import { musicals, programming } from "@prisma/client";

interface Props {
  theatreName: string;
}

interface Event {
  start: Date;
  end: Date;
  title: string;
}

function PerformanceCalendar({ theatreName }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const daysTimes = {
    Thursday: ["20:00"],
    Friday: ["20:00"],
    Saturday: ["14:00", "20:00"],
    Sunday: ["13:00", "18:30"],
  };

  function generateEventDates(
    programming: programming & { musicals: musicals },
    daysTimes: Record<string, string[]>
  ): Event[] {
    const { startDate, endDate, musicals } = programming;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    const events: Event[] = [];

    for (
      let date = startMoment;
      date.isSameOrBefore(endMoment);
      date.add(1, "day")
    ) {
      const dayName = date.format("dddd");
      const times = daysTimes[dayName] || [];
      times.forEach((time) => {
        const [hour, minute] = time.split(":").map(Number);
        const startTime = moment(date).set({ hour, minute });
        const endTime = moment(startTime).add(
          musicals.duration || 150,
          "minutes"
        );
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
        const response = await fetch(
          `/api/theatres/programming?theatreName=${theatreName}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch performances.");
        }
        const programmingData: (programming & { musicals: musicals })[] =
          await response.json();

        const allEvents = programmingData.flatMap((program) =>
          generateEventDates(program, daysTimes)
        );
        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching performances:", error);
      }
    }

    fetchAndGenerateEvents();
  }, [theatreName]);

  return (
    <div style={{ margin: "0 auto", maxWidth: "75%" }}>
      <FullCalendar
        events={events}
        fixedWeekCount={false}
        initialView="dayGridMonth"
        plugins={[dayGridPlugin]}
      />
    </div>
  );
}

export default PerformanceCalendar;
