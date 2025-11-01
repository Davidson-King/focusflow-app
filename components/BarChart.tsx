import React from 'react';

interface BarChartData {
    label: string;
    value: number;
    goal?: number;
}

interface BarChartProps {
    title: string;
    data: BarChartData[];
    color: string;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, color }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.value, d.goal || 0)), 1);

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-4">
                {data.length > 0 ? data.map(item => {
                    const goal = item.goal || maxValue;
                    const percentage = goal > 0 ? (item.value / goal) * 100 : 0;

                    return (
                        <div key={item.label}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-medium truncate pr-2">{item.label}</span>
                                <span className="font-semibold">{item.value.toLocaleString()} {item.goal ? `/ ${item.goal.toLocaleString()}` : ''}</span>
                            </div>
                            <div className="w-full bg-light-bg dark:bg-dark-border rounded-full h-2.5">
                                <div
                                    className="h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: color }}
                                ></div>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-sm text-center text-dark-text-secondary py-4">No data for this period.</p>
                )}
            </div>
        </div>
    );
};

export default BarChart;