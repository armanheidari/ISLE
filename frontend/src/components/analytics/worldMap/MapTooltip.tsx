import React from 'react';
import { BarChart3 } from 'lucide-react';
import { TooltipProps } from '@/types/worldMap';
import { getCountryValue, getCountryName, calculateCountryStats, getColorIntensityLabel } from '@/utils/worldMapUtils';
import { TOOLTIP_CONFIG } from '@/constants/worldMap';

export const MapTooltip: React.FC<TooltipProps> = ({
  countryName,
  countries,
  selectedMetric,
  isPinned,
  position,
  onTogglePin,
  onClose
}) => {
  const country = countries[countryName];
  if (!country) return null;

  const countryValue = getCountryValue(countryName, countries, selectedMetric);
  const displayName = getCountryName(countryName, countries);
  const stats = calculateCountryStats(countryName, countries, selectedMetric);
  
  const maxValue = Math.max(...Object.values(countries).map(c => 
    selectedMetric === 'papers' ? c.papers : c.citations
  ));
  const intensityLabel = getColorIntensityLabel(countryValue, maxValue);

  return (
    <div 
      className={`absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-4 ${TOOLTIP_CONFIG.maxWidth} z-50 transition-all duration-300 ease-in-out ${
        isPinned ? 'opacity-100 scale-100' : 'opacity-95 scale-95'
      }`}
      style={{
        left: isPinned ? TOOLTIP_CONFIG.pinnedPosition.left : `${position.x}px`,
        top: isPinned ? TOOLTIP_CONFIG.pinnedPosition.top : `${position.y}px`,
        transform: isPinned ? 'none' : 'translateY(-100%)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: country.color }}
          />
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-gray-900 text-base">
            {displayName}
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onTogglePin(countryName)}
            className={`p-1 rounded-md transition-colors ${
              isPinned
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={isPinned ? 'Unpin tooltip' : 'Pin tooltip'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Close tooltip"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedMetric === 'papers' ? 'Papers' : 'Citations'}
            </span>
            <span className="text-xs text-gray-500">
              {stats.rank} of {stats.totalCountries}
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-600">
              {countryValue.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              ({stats.percentage.toFixed(1)}% percentile)
            </span>
          </div>
        </div>
      
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {country.papers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Papers</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {country.citations.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Citations</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Color intensity:</span>
          <div className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: country.color }}
            />
            <span>{intensityLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
