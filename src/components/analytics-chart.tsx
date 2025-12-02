"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function AnalyticsChart({ 
  total, 
  completed 
}: { 
  total: number; 
  completed: number 
}) {
  const data = [
    { name: "Completed", value: completed, color: "#9333ea" },
    { name: "Pending", value: total - completed, color: "#e2e8f0" },
  ];

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No data to visualize
      </div>
    );
  }

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="relative" style={{ width: "100%", height: "200px", minHeight: "200px" }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="text-3xl font-bold block">{percentage}%</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Done</span>
        </div>
      </div>
    </div>
  );
}