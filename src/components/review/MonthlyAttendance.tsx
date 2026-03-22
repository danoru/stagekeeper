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
      labels: {
        color: "rgba(232, 220, 200, 0.6)",
        font: { family: "DM Sans", size: 11 },
        boxWidth: 12,
      },
    },
    title: { display: false },
  },
  scales: {
    x: {
      ticks: { color: "rgba(232, 220, 200, 0.4)", font: { family: "DM Sans", size: 10 } },
      grid: { color: "rgba(212, 175, 85, 0.06)" },
    },
    y: {
      ticks: { color: "rgba(232, 220, 200, 0.4)", font: { family: "DM Sans", size: 10 } },
      grid: { color: "rgba(212, 175, 85, 0.06)" },
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
    (acc, stat) => {
      const month = moment(stat.performances.startTime).format("MMMM");
      const type = stat.performances.type;
      if (!acc[month]) acc[month] = { musical: 0, play: 0 };
      if (type === "MUSICAL") acc[month].musical += 1;
      if (type === "PLAY") acc[month].play += 1;
      return acc;
    },
    {}
  );

  const monthlyData = {
    labels,
    datasets: [
      {
        label: "Musicals",
        data: labels.map((m) => monthlyOccurrences[m]?.musical ?? 0),
        backgroundColor: "rgba(212, 175, 85, 0.7)",
        borderColor: "rgba(212, 175, 85, 1)",
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: "Plays",
        data: labels.map((m) => monthlyOccurrences[m]?.play ?? 0),
        backgroundColor: "rgba(207, 68, 68, 0.6)",
        borderColor: "rgba(207, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  return <Bar data={monthlyData} options={options} />;
}

export default MonthlyAttendanceChart;
