import { X } from 'lucide-react';
import { PaperFilters } from '@/lib/api';
import { SEARCH_LABELS, SEARCH_PLACEHOLDERS } from '@/constants/search';
import { TextArrayFilter } from './filters/TextArrayFilter';
import { YearRangeFilter } from './filters/YearRangeFilter';

interface FilterPanelProps {
  filters: PaperFilters;
  onUpdateFilter: (key: keyof PaperFilters, value: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterPanel = ({ 
  filters, 
  onUpdateFilter, 
  onClearFilters, 
  hasActiveFilters 
}: FilterPanelProps) => {
  return (
    <div className="border-t pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {SEARCH_LABELS.ADVANCED_FILTERS}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-800 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>{SEARCH_LABELS.CLEAR_ALL}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextArrayFilter
          label={SEARCH_LABELS.AUTHORS}
          placeholder={SEARCH_PLACEHOLDERS.AUTHORS}
          value={filters.author}
          onChange={(value) => onUpdateFilter('author', value)}
        />

        <TextArrayFilter
          label={SEARCH_LABELS.COUNTRIES}
          placeholder={SEARCH_PLACEHOLDERS.COUNTRIES}
          value={filters.country}
          onChange={(value) => onUpdateFilter('country', value)}
        />

        <TextArrayFilter
          label={SEARCH_LABELS.INSTITUTIONS}
          placeholder={SEARCH_PLACEHOLDERS.INSTITUTIONS}
          value={filters.location}
          onChange={(value) => onUpdateFilter('location', value)}
        />

        <YearRangeFilter
          value={filters.year_range}
          onChange={(value) => onUpdateFilter('year_range', value)}
        />
      </div>
    </div>
  );
};
