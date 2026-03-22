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

function MusicalByPremiereChart({ stats }: Props) {
  const yearlyOccurrence = stats.reduce<Record<string, { musical: number; play: number }>>(
    (acc, stat) => {
      const musicalYear = stat.performances.musicals?.premiere
        ? moment(stat.performances.musicals.premiere).format("YYYY")
        : null;
      const playYear = stat.performances.plays?.premiere
        ? moment(stat.performances.plays.premiere).format("YYYY")
        : null;
      if (musicalYear) {
        if (!acc[musicalYear]) acc[musicalYear] = { musical: 0, play: 0 };
        acc[musicalYear].musical += 1;
      }
      if (playYear) {
        if (!acc[playYear]) acc[playYear] = { musical: 0, play: 0 };
        acc[playYear].play += 1;
      }
      return acc;
    },
    {}
  );

  const labels = Object.keys(yearlyOccurrence).sort();

  const premiereData = {
    labels,
    datasets: [
      {
        label: "Musicals",
        data: labels.map((y) => yearlyOccurrence[y].musical),
        backgroundColor: "rgba(212, 175, 85, 0.7)",
        borderColor: "rgba(212, 175, 85, 1)",
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: "Plays",
        data: labels.map((y) => yearlyOccurrence[y].play),
        backgroundColor: "rgba(207, 68, 68, 0.6)",
        borderColor: "rgba(207, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  return <Bar data={premiereData} options={options} />;
}

export default MusicalByPremiereChart;
