import type { attendance, musicals, performances, theatres } from "@prisma/client";
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
import React from "react";
import { Bar } from "react-chartjs-2";

interface Props {
  stats: (attendance & {
    performances: performances & { musicals: musicals; theatres: theatres };
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
      text: "Musicals by Month",
    },
  },
};

function MonthlyAttendanceChart(props: Props) {
  const { stats } = props;

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

  const musicalMonths = stats.map((data) => moment(data.performances.startTime).format("MMMM"));

  const monthlyOccurence: Record<string, number> = {};

  musicalMonths.forEach((month) => {
    if (!monthlyOccurence[month]) {
      monthlyOccurence[month] = 1;
    } else {
      monthlyOccurence[month]++;
    }
  });

  const monthlyData = {
    labels,
    datasets: [
      {
        label: "# of Musicals Seen",
        data: monthlyOccurence,
        backgroundColor: "rgba(216, 0, 50, 0.7)",
      },
    ],
  };

  return (
    <div>
      <Bar data={monthlyData} options={options} />
    </div>
  );
}

export default MonthlyAttendanceChart;
