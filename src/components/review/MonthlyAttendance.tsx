import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import moment from "moment";
import { Bar } from "react-chartjs-2";

interface Props {
  stats: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Shows by Month",
    },
  },
};

function MonthlyAttendanceChart({ stats }: Props) {
  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyOccurrences = stats.reduce<Record<string, { musical: number; play: number }>>(
    (accumulator, stat) => {
      const month = moment(stat.performances.startTime).format("MMMM");
      const type = stat.performances.type;

      if (!accumulator[month]) {
        accumulator[month] = { musical: 0, play: 0 };
      }

      if (type === "MUSICAL") accumulator[month].musical += 1;
      if (type === "PLAY") accumulator[month].play += 1;

      return accumulator;
    },
    {}
  );

  const musicalData = labels.map((month) => monthlyOccurrences[month]?.musical ?? 0);

  const playData = labels.map((month) => monthlyOccurrences[month]?.play ?? 0);

  const monthlyData = {
    labels,
    datasets: [
      {
        label: "# of Musicals Seen",
        data: musicalData,
        backgroundColor: "rgba(216, 0, 50, 0.7)",
      },
      {
        label: "# of Plays Seen",
        data: playData,
        backgroundColor: "rgba(255, 238, 50, 0.4)",
      },
    ],
  };

  return (
    <>
      <Bar data={monthlyData} options={options} />
    </>
  );
}

export default MonthlyAttendanceChart;
