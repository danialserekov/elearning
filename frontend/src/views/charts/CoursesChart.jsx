/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./charts.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels,
  Filler
);

const CoursesChart = ({
  pieData,
  barData,
  onBarClick,
  centerChart,
  showRatingCounts,
  selectedCourse,
  onToggleView,
}) => {
  const chartRef = useRef(null);

  const handleBarClick = (elements) => {
    if (elements.length > 0) {
      const courseTitle = barData.labels[elements[0].index];
      onBarClick(courseTitle);
    }
  };

  return (
    <div>
      <button onClick={onToggleView} className="toggle-view-btn">
        {showRatingCounts ? "Show Bar Chart" : "Show Pie Chart"}
      </button>
      {showRatingCounts && selectedCourse ? (
        <>
          <h3>{selectedCourse.title} - Rating Counts</h3>
          <div  className="chart">
            <Pie
              data={pieData}
              options={{
                plugins: {
                  datalabels: {
                    formatter: (value, context) => {
                      return `${value} (${context.chart.data.labels[context.dataIndex]})`;
                    },
                    color: "#fff",
                  },
                  legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                      font: {
                        size: 12,
                      },
                      generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => ({
                          text: `${label}: ${data.datasets[0].data[i]}`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                        }));
                      },
                    },
                  },
                },
              }}
              ref={chartRef}
            />
          </div>
        </>
      ) : (
        <div>
          <h3>Average Ratings</h3>
          <Bar
            data={barData}
            options={{
              onClick: (event, elements) => handleBarClick(elements),
              responsive: true,
            }}
            ref={chartRef}
          />
        </div>
      )}
    </div>
  );
};

export default CoursesChart;
