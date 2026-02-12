"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = [
    { name: 'Jan', total: 2000 },
    { name: 'Feb', total: 3000 },
    { name: 'Mar', total: 4500 },
    { name: 'Apr', total: 3200 },
    { name: 'May', total: 5100 },
    { name: 'Jun', total: 4200 },
    { name: 'Jul', total: 3800 },
    { name: 'Aug', total: 4900 },
    { name: 'Sep', total: 5400 },
    { name: 'Oct', total: 4100 },
    { name: 'Nov', total: 5800 },
    { name: 'Dec', total: 6000 },
];

export function OverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${value}`}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
