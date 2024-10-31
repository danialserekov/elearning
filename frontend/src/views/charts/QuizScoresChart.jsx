import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function QuizScoresChart() {
  const [chartData, setChartData] = useState(null);
  const axiosInstance = useAxios();
  const userId = UserData()?.user_id;

  useEffect(() => {
    const fetchQuizScores = async () => {
      try {
        const response = await axiosInstance.get(
          `/student/quiz-scores/${userId}/`
        );
        const data = response.data.quiz_scores;

        const formattedData = {
          labels: data.map((item) => item.course_name), // Course names as labels
          datasets: [
            {
              label: "Quiz Scores (%)",
              data: data.map((item) => item.percentage_score),
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 1,
            },
          ],
        };

        // Attach tooltips with score/total score
        const tooltips = data.map(
          (item) => `${item.quiz_title}: ${item.score_label}`
        );

        setChartData({
          ...formattedData,
          tooltips, 
        });
      } catch (error) {
        console.error("Error fetching quiz scores:", error);
      }
    };

    fetchQuizScores();
  }, [userId]);

  return (
    <div className="chart">
      <h5>Quiz Scores Overview</h5>
      {chartData && (
        <Bar
          data={chartData}
          options={{
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`, 
                },
              },
            },
            layout: {
              padding: {
                bottom: 30,
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const index = context.dataIndex;
                    return chartData.tooltips[index]; // Show score/total score in tooltip
                  },
                },
              },
            },
          }}
        />
      )}
    </div>
  );
}

export default QuizScoresChart;
