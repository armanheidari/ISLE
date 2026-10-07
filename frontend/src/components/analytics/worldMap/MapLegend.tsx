import React from 'react';
import { LegendProps } from '@/types/worldMap';
import { LEGEND_ITEMS } from '@/constants/worldMap';

export const MapLegend: React.FC<LegendProps> = ({ selectedMetric }) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">Intensity:</span>
        {LEGEND_ITEMS.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500">
        Showing: {selectedMetric === 'papers' ? 'Number of Papers' : 'Number of Citations'} (Log Scale)
      </div>
    </div>
  );
};
