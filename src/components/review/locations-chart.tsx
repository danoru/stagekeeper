import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

import { MUSICAL_LIST_TYPE } from "../../types";

interface Props {
  stats: MUSICAL_LIST_TYPE[];
}

ChartJS.register(ArcElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Musicals by Location",
    },
  },
};

function LocationsChart(props: Props) {
  const { stats } = props;

  const filteredMusicals = stats.filter(
    (stat: MUSICAL_LIST_TYPE) => stat.groupAttended
  );

  const locationOccurence: Record<string, number> = {};

  filteredMusicals.forEach((stats: MUSICAL_LIST_TYPE) => {
    if (!locationOccurence[stats.location]) {
      locationOccurence[stats.location] = 1;
    } else {
      locationOccurence[stats.location]++;
    }
  });

  const locationData = {
    labels: Object.keys(locationOccurence),
    datasets: [
      {
        label: "# of Times Attended",
        data: Object.values(locationOccurence),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // console.log(locationOccurence);

  return (
    <div style={{ width: 500 }}>
      <Doughnut data={locationData} options={options} />
    </div>
  );
}

export default LocationsChart;
