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
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Musicals by Location",
    },
  },
};

function LocationsChart(props: Props) {
  const { stats } = props;

  const locationOccurence: Record<string, number> = {};

  stats.forEach((stats: MUSICAL_LIST_TYPE) => {
    if (!locationOccurence[stats.location]) {
      locationOccurence[stats.location] = 1;
    } else {
      locationOccurence[stats.location]++;
    }
  });

  // const playhouseOccurence: Record<string, number> = {};

  // stats.forEach((stats: MUSICAL_LIST_TYPE) => {
  //   if (!playhouseOccurence[stats.playhouse]) {
  //     playhouseOccurence[stats.playhouse] = 1;
  //   } else {
  //     playhouseOccurence[stats.playhouse]++;
  //   }
  // });

  const locationData = {
    labels: Object.keys(locationOccurence),
    datasets: [
      {
        label: "# of Times Attended",
        data: Object.values(locationOccurence),
        backgroundColor: [
          "rgba(216, 0, 50, 0.4)",
          "rgba(251, 133, 0, 0.4)",
          "rgba(230, 57, 70, 0.4)",
          "rgba(239, 35, 60, 0.4)",
          "rgba(255, 238, 50, 0.4)",
          "rgba(255, 209, 0, 0.4)",
          "rgba(214, 214, 214, 0.4)",
        ],
        borderColor: [
          "rgba(216, 0, 50, 1)",
          "rgba(251, 133, 0, 1)",
          "rgba(230, 57, 70, 1)",
          "rgba(239, 35, 60, 1)",
          "rgba(255, 238, 50, 1)",
          "rgba(255, 209, 0, 1)",
          "rgba(214, 214, 214, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <Doughnut data={locationData} options={options} />
    </div>
  );
}

export default LocationsChart;
