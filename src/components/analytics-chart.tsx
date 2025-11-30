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
    { name: "Completed", value: completed, color: "#9333ea" }, // Purple-600
    { name: "Pending", value: total - completed, color: "#e2e8f0" }, // Slate-200
  ];

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No data to visualize
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
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
      <div className="text-center -mt-24 pointer-events-none">
         <span className="text-3xl font-bold block">{Math.round((completed/total)*100)}%</span>
         <span className="text-xs text-gray-500 uppercase tracking-wider">Done</span>
      </div>
      <div className="mt-12"></div> 
    </div>
  );
}