'use client';

import React from 'react';
import { Play, Filter } from 'lucide-react';
import { NetworkControlsProps } from '@/types/knowledgeGraph';

export default function NetworkControls({
  loading,
  onGenerateNetwork,
  onToggleFilters,
  showFilters,
  activeFiltersCount,
  networkData,
  filteredData
}: NetworkControlsProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onGenerateNetwork}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2 transition-colors"
        >
          <Play className="h-4 w-4" />
          <span>{loading ? 'Loading...' : 'Generate Network'}</span>
        </button>
        
        <button
          onClick={onToggleFilters}
          className={`relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            showFilters 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {networkData && (
        <div className="text-sm text-gray-600">
          Showing {filteredData?.nodes?.length || 0} of {networkData.nodes?.length || 0} nodes
        </div>
      )}
    </div>
  );
}
