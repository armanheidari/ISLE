import React, { memo } from 'react';
import { StatCard } from './StatCard';
import { createStatCards } from '@/constants/analytics';
import { AnalysisResult } from '@/types/analytics';

interface StatsSectionProps {
  data: AnalysisResult;
}

export const StatsSection: React.FC<StatsSectionProps> = memo(({ data }) => {
  const stats = createStatCards(data.basic_stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
});
