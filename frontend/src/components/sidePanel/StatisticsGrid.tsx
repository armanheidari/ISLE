import React from 'react';
import { STATISTICS_COLORS } from '@/constants/sidePanel';

interface StatisticItem {
  value: number | string;
  label: string;
  color?: keyof typeof STATISTICS_COLORS;
}

interface StatisticsGridProps {
  items: StatisticItem[];
  columns?: number;
}

export function StatisticsGrid({ 
  items, 
  columns = 3 
}: StatisticsGridProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {items.map((item, index) => (
        <div key={index} className="text-center flex-1 min-w-0">
          <p className={`text-lg font-bold ${item.color ? STATISTICS_COLORS[item.color] : 'text-gray-600'}`}>
            {typeof item.value === 'number' && item.value % 1 !== 0 
              ? item.value.toFixed(1) 
              : item.value
            }
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
