import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import useAxios from '../../utils/useAxios';

const EnrollmentTrendsChart = ({ teacherId }) => {
    const [enrollmentData, setEnrollmentData] = useState({ intervals: [], counts: [] });
    const [loading, setLoading] = useState(true);
    const [interval, setInterval] = useState('day');  // Default to month

    useEffect(() => {
        fetchEnrollmentData();
    }, [teacherId, interval]);

    const fetchEnrollmentData = () => {
        setLoading(true);
        useAxios()
            .get(`/teacher/enrollment-trends/${teacherId}/?interval=${interval}`)
            .then((res) => {
                setEnrollmentData(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching enrollment trends:', error);
                setLoading(false);
            });
    };

    if (loading) return <div>Loading...</div>;

    const chartData = {
        labels: enrollmentData.intervals,
        datasets: [
            {
                label: 'Enrollments',
                data: enrollmentData.counts,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                pointRadius: 5, 
                pointHoverRadius: 3
            },
        ],
    };

    return (
        <div className="chart">
            <h3>Student Enrollment Trends</h3>
            <div>
                <label>View by: </label>
                <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>
            </div>
            <Line data={chartData} />
        </div>
    );
};

export default EnrollmentTrendsChart;