import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TicketsPieChartProps {
  data: Array<{ name: string; count: number; revenue: number }>;
}

const COLORS = ['#0047AB', '#FFC93C', '#1A1A2E', '#E8DCC8', '#5E60CE'];

export const TicketsPieChart: React.FC<TicketsPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-brand-ink-subtle">
        No ticket sales breakdown recorded yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FBF7EE',
              borderColor: '#E8DCC8',
              borderRadius: '16px',
              fontSize: '12px',
            }}
            formatter={(val: any, name: any) => [`${val} tickets`, `${name}`]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#4B4B60' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
