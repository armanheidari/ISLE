'use client';

import { useCallback } from 'react';
import { AnalysisQuery, AnalysisResult } from '@/lib/api';
import { useSearch } from '@/hooks/useSearch';
import { useFilters } from '@/hooks/useFilters';
import { GlobalSettings } from '@/components/GlobalSettings';
import { 
  ErrorMessage, 
  SearchInput, 
  FilterPanel, 
  FilterToggle, 
  SearchButton 
} from './search';

interface SearchSectionProps {
  onAnalysisComplete: (data: AnalysisResult) => void;
  onSearchStart: () => void;
  isLoading: boolean;
  onBuiltQuery?: (q: AnalysisQuery) => void;
  settings?: GlobalSettings;
}

export default function SearchSection({ 
  onAnalysisComplete, 
  onSearchStart, 
  isLoading,
  onBuiltQuery,
  settings
}: SearchSectionProps) {
  const { 
    query, 
    setQuery, 
    error, 
    handleSearch, 
    clearError 
  } = useSearch({ 
    onAnalysisComplete, 
    onSearchStart, 
    onBuiltQuery,
    settings
  });

  const {
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  } = useFilters();

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch(filters);
    }
  }, [isLoading, handleSearch, filters]);

  const handleSearchClick = useCallback(() => {
    handleSearch(filters);
  }, [handleSearch, filters]);

  const handleRetry = useCallback(() => {
    clearError();
    handleSearch(filters);
  }, [clearError, handleSearch, filters]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-gray-900">
      <div className="flex items-center space-x-4 mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <FilterToggle
          onClick={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          disabled={isLoading}
        />

        <SearchButton
          onClick={handleSearchClick}
          disabled={isLoading || (!query.trim() && !hasActiveFilters)}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <ErrorMessage
          error={error}
          onRetry={handleRetry}
          onDismiss={clearError}
        />
      )}

      {showFilters && (
        <FilterPanel
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}
    </div>
  );
}