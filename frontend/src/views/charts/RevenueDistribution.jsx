/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import useAxios from "../../utils/useAxios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register required components
ChartJS.register(ArcElement, Tooltip, Legend, Filler);

const RevenueDistribution = ({ teacherId }) => {
  const [revenueData, setRevenueData] = useState({ courses: [], revenues: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [teacherId]);

  const fetchRevenueData = () => {
    setLoading(true);
    useAxios()
      .get(`/teacher/revenue-distribution/${teacherId}/`)
      .then((res) => {
        setRevenueData(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching revenue distribution:", error);
        setLoading(false);
      });
  };

  if (loading) return <div>Loading...</div>;

  const chartData = {
    labels: revenueData.courses,
    datasets: [
      {
        label: "Revenue Distribution",
        data: revenueData.revenues,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF9F40",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF9F40",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
        ],
      },
    ],
  };

  return (
    <>
      <h3>Revenue Distribution by Course</h3>
    <div className="chart">
      <Pie
        data={chartData}
        options={{
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            },
          },
        }}
      />
    </div>
    </>
  );
};

export default RevenueDistribution;
