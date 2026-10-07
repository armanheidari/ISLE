import { useState, useCallback, useMemo } from 'react';
import { PaperFilters } from '@/lib/api';

interface UseFiltersReturn {
  filters: PaperFilters;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  updateFilter: (key: keyof PaperFilters, value: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export const useFilters = (): UseFiltersReturn => {
  const [filters, setFilters] = useState<PaperFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = useCallback((key: keyof PaperFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof PaperFilters];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof PaperFilters];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  }, [filters]);

  return {
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  };
};
