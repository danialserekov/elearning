/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Bubble } from "react-chartjs-2";
import useAxios from "../../utils/useAxios"; // Make sure to import your custom hook

const PopularityRevenue = ({ teacherId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [teacherId]);

  const fetchChartData = async () => {
    try {
      const response = await useAxios().get(
        `/teacher/course-popularity-vs-revenue/${teacherId}/`
      );
      setChartData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course popularity vs revenue data:", error);
      setError(error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return <div>No data available</div>;
  }

  const data = {
    labels: chartData.map((item) => item.course_title),
    datasets: [
      {
        label: "Popularity vs Revenue",
        data: chartData.map((item) => ({
          x: item.enrollments,
          y: item.revenue,
          r: Math.sqrt(item.completion_rate, 100), // Use the completion rate directly for the bubble size
        })),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Number of Enrollments",
        },
      },
      y: {
        title: {
          display: true,
          text: "Revenue Generated",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = chartData[context.dataIndex];
            return [
              `Course: ${item.course_title}`,
              `Enrollments: ${item.enrollments}`,
              `Revenue: $${item.revenue.toFixed(2)}`,
              `Completion Rate: ${Math.round(item.completion_rate)}%`,
            ];
          },
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const item = chartData[context.dataIndex];
          return `${Math.round(item.completion_rate)}%`; // Display the completion rate as a percentage
        },
        color: "#000", // Set the color of the percentage text
        font: {
          size: 12, // Adjust the text size as needed
        },
        align: "center",
        anchor: "center",
      },
    },
  };

  return (
    <div className="chart">
      <h3>Popularity vs Revenue</h3>
      <Bubble data={data} options={options} />
    </div>
  );
};

export default PopularityRevenue;