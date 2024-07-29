import React from "react";
import moment from "moment";
import { attendance, musicals, performances, theatres } from "@prisma/client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

interface Props {
  stats: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
  })[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Musicals by Premiere",
    },
  },
};

function MusicalByPremiereChart(props: Props) {
  const { stats } = props;

  const musicalPremieres = stats.map((data) =>
    moment(data.performances.musicals.premiere).format("YYYY")
  );

  const yearlyOccurence: Record<string, number> = {};

  musicalPremieres.forEach((year) => {
    if (!yearlyOccurence[year]) {
      yearlyOccurence[year] = 1;
    } else {
      yearlyOccurence[year]++;
    }
  });

  const premiereData = {
    labels: [],
    datasets: [
      {
        label: "# of Musicals Seen",
        data: yearlyOccurence,
        backgroundColor: "rgba(255, 209, 0, 0.7)",
      },
    ],
  };

  return (
    <div>
      <Bar data={premiereData} options={options} />
    </div>
  );
}

export default MusicalByPremiereChart;
