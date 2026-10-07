import React from 'react';
import { RankByType } from '@/types/analytics';
import { RANK_BY_OPTIONS } from '@/constants/analytics';

interface RankBySelectorProps {
  rankBy: RankByType;
  onRankByChange: (rankType: RankByType) => void;
}

export const RankBySelector: React.FC<RankBySelectorProps> = ({ 
  rankBy, 
  onRankByChange 
}) => {
  return (
    <div className="mb-6 flex items-center justify-between sticky top-0 bg-white py-3 z-10 border-b border-gray-200 pl-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Rank by:</span>
        {Object.entries(RANK_BY_OPTIONS).map(([key, option]) => (
          <button
            key={key}
            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              rankBy === key 
                ? 'bg-blue-600 text-white border-blue-600 shadow' 
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
            onClick={() => onRankByChange(key as RankByType)}
            aria-pressed={rankBy === key}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
