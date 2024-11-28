import React from "react";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
const FundLineChart = ({ campaignsPerYearList }) => {
    const transformData = () => {
        const data = [];
        if (campaignsPerYearList && campaignsPerYearList.length > 0) {
            campaignsPerYearList.forEach(yearData => {
                yearData.campaignsByMonth.forEach(monthData => {
                    data.push({
                        month: `Tháng ${monthData.month}/${yearData.year}`,
                        campaigns: monthData.campaignCount
                    });
                });
            });
        }
        return data.sort((a, b) => {
            const [aMonth, aYear] = a.month.split('/');
            const [bMonth, bYear] = b.month.split('/');
            return new Date(aYear, aMonth) - new Date(bYear, bMonth);
        });
    };

    const chartData = transformData();

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tăng trưởng số chiến dịch theo tháng</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="campaigns"
                        name="Số chiến dịch"
                        stroke="#50c878"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FundLineChart;