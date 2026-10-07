import React from 'react';
import { StatCard as StatCardType } from '@/types/analytics';

interface StatCardProps {
  stat: StatCardType;
}

export const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const IconComponent = stat.icon;
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${stat.bg}`}>
          <IconComponent className={`w-6 h-6 ${stat.color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      </div>
    </div>
  );
};
