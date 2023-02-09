import React from "react";
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
import moment from "moment";

import { MUSICAL_LIST_TYPE } from "../../types";

interface Props {
  stats: MUSICAL_LIST_TYPE[];
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

  const filteredMusicals = stats.filter(
    (stat: MUSICAL_LIST_TYPE) => stat.groupAttended
  );

  const musicalPremieres = filteredMusicals.map((data) =>
    moment(data.premiere).format("YYYY")
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
    <div style={{ width: 700 }}>
      <Bar data={premiereData} options={options} />
    </div>
  );
}

export default MusicalByPremiereChart;
