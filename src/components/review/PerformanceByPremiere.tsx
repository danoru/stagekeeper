import { StayCurrentLandscape } from "@mui/icons-material";
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
      text: "Shows by Premiere",
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

  const musicalPremieres = labels.map((year) => yearlyOccurrence[year].musical);

  const playPremieres = labels.map((year) => yearlyOccurrence[year].play);

  const premiereData = {
    datasets: [
      {
        label: "# of Musicals Seen",
        data: musicalPremieres,
        backgroundColor: "rgba(216, 0, 50, 0.7)",
      },
      {
        label: "# of Plays Seen",
        data: playPremieres,
        backgroundColor: "rgba(255, 209, 0, 0.7)",
      },
    ],
    labels,
  };

  return (
    <div>
      <Bar data={premiereData} options={options} />
    </div>
  );
}

export default MusicalByPremiereChart;
