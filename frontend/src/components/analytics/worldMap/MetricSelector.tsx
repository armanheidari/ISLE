import React from 'react';
import { MetricSelectorProps } from '@/types/worldMap';

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedMetric,
  onMetricChange
}) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onMetricChange('papers')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          selectedMetric === 'papers'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Papers
      </button>
      <button
        onClick={() => onMetricChange('citations')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          selectedMetric === 'citations'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Citations
      </button>
    </div>
  );
};
