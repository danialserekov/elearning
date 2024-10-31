import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import useAxios from '../../utils/useAxios';
import moment from 'moment';

// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ teacherId }) => {
    const [earningsData, setEarningsData] = useState({ intervals: [], earnings: [] });
    const [loading, setLoading] = useState(true);
    const [interval, setInterval] = useState('day');  // Default to month

    useEffect(() => {
        fetchEarningsData();
    }, [teacherId, interval]);

    const fetchEarningsData = () => {
        setLoading(true);
        useAxios()
            .get(`/teacher/all-months-earning/${teacherId}/?interval=${interval}`)
            .then((res) => {
                setEarningsData(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching earnings trends:', error);
                setLoading(false);
            });
    };

    if (loading) return <div>Loading...</div>;

    const chartData = {
        labels: earningsData.intervals.map(interval => 
            interval.length === 7 ? moment(interval, 'YYYY-MM').format('MMMM YYYY') : 
            interval.length === 10 ? moment(interval, 'YYYY-MM-DD').format('MMMM DD, YYYY') :
            interval
        ),
        datasets: [
            {
                label: `Earnings by ${interval}`,
                data: earningsData.earnings,
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
            <h3>Earnings Trends</h3>
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

export default LineChart;
