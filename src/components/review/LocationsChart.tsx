import type { attendance, performances, theatres } from "@prisma/client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";

interface Props {
  stats: (attendance & {
    performances: performances & { theatres: theatres };
  })[];
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

  stats.forEach((stats) => {
    if (!locationOccurence[stats.performances.theatres.location]) {
      locationOccurence[stats.performances.theatres.location] = 1;
    } else {
      locationOccurence[stats.performances.theatres.location]++;
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
