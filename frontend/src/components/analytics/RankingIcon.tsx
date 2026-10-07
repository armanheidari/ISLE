import React from 'react';

interface RankingIconProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RankingIcon: React.FC<RankingIconProps> = ({ 
  rank, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white font-bold ';
    }
    if (rank === 2) {
      return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white font-bold';
    }
    if (rank === 3) {
      return 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white font-bold';
    }
    return 'bg-gray-100 text-gray-600 font-semibold border border-gray-200';
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${getRankStyle(rank)} ${className} rounded-lg flex items-center justify-center transition-all duration-200`}
    >
      <span className="font-bold">{rank}</span>
    </div>
  );
};
