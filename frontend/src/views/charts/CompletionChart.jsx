/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import "./charts.css";

const CourseCompletionBarChart = ({ courses }) => {
  //console.log("courses", courses)
  const chartRef = useRef();

  const courseData = courses.map((course) => {
    const totalStudents = course.students.length;
    const totalLectures = course.lectures.length;
    //console.log("totalStudents-totalLectures", totalStudents,totalLectures)
    const completedStudents = course.students.filter((student) => {
      const completedLessons = student.completed_lesson.length;
      return completedLessons === totalLectures;
    }).length;

    const completionRate =
      totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
    return {
      title: course.title,
      completionRate: completionRate,
    };
  });

  const chartData = {
    labels: courseData.map((course) => course.title),
    datasets: [
      {
        label: "Course Completion Rate (%)",
        data: courseData.map((course) => course.completionRate),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, [courses]);

  return (
    <div className="chart">
      <h3>Course Completion</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CourseCompletionBarChart;
