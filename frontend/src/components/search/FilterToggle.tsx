import { Filter } from 'lucide-react';
import { SEARCH_LABELS } from '@/constants/search';

interface FilterToggleProps {
  onClick: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  disabled: boolean;
}

export const FilterToggle = ({ 
  onClick, 
  hasActiveFilters, 
  activeFilterCount, 
  disabled 
}: FilterToggleProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 border rounded-lg flex items-center space-x-2 transition-colors ${
        hasActiveFilters 
          ? 'bg-blue-50 border-blue-300 text-blue-700' 
          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      <Filter className="w-5 h-5" />
      <span>{SEARCH_LABELS.FILTERS}</span>
      {hasActiveFilters && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
};
