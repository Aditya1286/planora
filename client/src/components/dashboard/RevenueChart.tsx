import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number; tickets: number }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-brand-ink-subtle">
        No revenue data recorded yet.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0047AB" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0047AB" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#86869E"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => {
              try {
                const parts = val.split('-');
                return `${parts[1]}/${parts[2]}`;
              } catch {
                return val;
              }
            }}
          />
          <YAxis
            stroke="#86869E"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FBF7EE',
              borderColor: '#E8DCC8',
              borderRadius: '16px',
              fontSize: '12px',
              color: '#1A1A2E',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            }}
            formatter={(value: any) => [formatCurrency(Number(value)), 'Gross Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0047AB"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
