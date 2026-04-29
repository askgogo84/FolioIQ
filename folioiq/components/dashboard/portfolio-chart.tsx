// components/dashboard/portfolio-chart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function PortfolioChart({ 
  equity, 
  debt, 
  hybrid, 
  other 
}: { 
  equity: number; 
  debt: number; 
  hybrid: number; 
  other: number;
}) {
  const data = [
    { name: 'Equity', value: Math.round(equity), color: '#3b82f6' },
    { name: 'Debt', value: Math.round(debt), color: '#10b981' },
    { name: 'Hybrid', value: Math.round(hybrid), color: '#f59e0b' },
    { name: 'Other', value: Math.round(other), color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-text-primary">{payload[0].name}</p>
          <p className="text-accent font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Asset Allocation</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value: string) => <span className="text-sm text-text-secondary">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Allocation Bars */}
      <div className="mt-6 space-y-3">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">{item.name}</span>
              <span className="font-medium text-text-primary">{item.value}%</span>
            </div>
            <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${item.value}%`, 
                  backgroundColor: item.color 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
