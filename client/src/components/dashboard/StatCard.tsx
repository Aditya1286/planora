import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  color?: 'blue' | 'yellow' | 'ink';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  color = 'blue',
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white border border-brand-beige shadow-brand card-hover-effect flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-brand-ink-muted uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            color === 'blue'
              ? 'bg-brand-blue/10 text-brand-blue'
              : color === 'yellow'
              ? 'bg-brand-yellow/20 text-brand-ink'
              : 'bg-brand-ink/10 text-brand-ink'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <h4 className="font-display font-extrabold text-2xl text-brand-ink tracking-tight mb-1">
          {value}
        </h4>
        <div className="flex items-center justify-between text-xs text-brand-ink-subtle">
          <span>{subtitle}</span>
          {badge && (
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
