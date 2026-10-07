import { useState, useCallback } from 'react';
import { api, AnalysisQuery, AnalysisResult, PaperFilters } from '@/lib/api';
import { GlobalSettings } from '@/components/GlobalSettings';

interface UseSearchProps {
  onAnalysisComplete: (data: AnalysisResult) => void;
  onSearchStart: () => void;
  onBuiltQuery?: (q: AnalysisQuery) => void;
  settings?: GlobalSettings;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  handleSearch: (filters: PaperFilters) => Promise<void>;
  clearError: () => void;
}

export const useSearch = ({ 
  onAnalysisComplete, 
  onSearchStart, 
  onBuiltQuery,
  settings
}: UseSearchProps): UseSearchReturn => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSearch = useCallback(async (filters: PaperFilters) => {
    const hasQuery = query.trim().length > 0;
    const hasActiveFilters = Object.keys(filters).some(key => {
      const value = filters[key as keyof PaperFilters];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });

    if (!hasQuery && !hasActiveFilters) {
      setError('Please enter a search query or select at least one filter');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      onSearchStart();
      
      const searchQuery: AnalysisQuery = {
        query: hasQuery ? query.trim() : undefined,
        filters,
        limit: settings?.maxRequestedPapers || 1000,
        settings: settings ? {
          model: settings.model,
          max_papers_limit: settings.maxRequestedPapers,
          max_nodes_limit: settings.maxNodesLimit,
          max_edges_limit: settings.maxEdgesLimit
        } : undefined
      };

      if (onBuiltQuery) {
        onBuiltQuery(searchQuery);
      }

      const result = await api.searchAndAnalyze(searchQuery);
      onAnalysisComplete(result);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [query, onAnalysisComplete, onSearchStart, onBuiltQuery]);

  return {
    query,
    setQuery,
    isLoading,
    error,
    setError,
    handleSearch,
    clearError
  };
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('Network error')) {
      return 'The request is taking longer than expected. The server may still be processing your request. Please wait a moment and try again.';
    }
    if (error.message.includes('500')) {
      return 'Server error occurred. Please try again with a different search query.';
    }
    return error.message;
  }
  return 'An error occurred';
};
