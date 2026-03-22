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
      labels: {
        color: "rgba(232, 220, 200, 0.6)",
        font: { family: "DM Sans", size: 11 },
        boxWidth: 12,
      },
    },
    title: {
      display: false,
    },
  },
};

const CHART_COLORS = [
  "rgba(212, 175, 85, 0.7)",
  "rgba(207, 68, 68, 0.7)",
  "rgba(26, 58, 90, 0.9)",
  "rgba(180, 140, 60, 0.7)",
  "rgba(90, 26, 26, 0.9)",
  "rgba(45, 90, 130, 0.9)",
  "rgba(140, 100, 30, 0.7)",
];

const CHART_BORDERS = [
  "rgba(212, 175, 85, 1)",
  "rgba(207, 68, 68, 1)",
  "rgba(46, 88, 130, 1)",
  "rgba(180, 140, 60, 1)",
  "rgba(130, 46, 46, 1)",
  "rgba(45, 90, 160, 1)",
  "rgba(160, 120, 40, 1)",
];

function LocationsChart(props: Props) {
  const { stats } = props;
  const locationOccurrence: Record<string, number> = {};
  stats.forEach((s) => {
    const loc = s.performances.theatres.location;
    locationOccurrence[loc] = (locationOccurrence[loc] ?? 0) + 1;
  });

  const locationData = {
    labels: Object.keys(locationOccurrence),
    datasets: [
      {
        label: "# of Shows",
        data: Object.values(locationOccurrence),
        backgroundColor: CHART_COLORS,
        borderColor: CHART_BORDERS,
        borderWidth: 1,
      },
    ],
  };

  return <Doughnut data={locationData} options={options} />;
}

export default LocationsChart;
