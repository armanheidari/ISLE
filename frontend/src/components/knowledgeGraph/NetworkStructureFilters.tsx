'use client';

import React from 'react';
import { FilterState } from '@/types/knowledgeGraph';

interface NetworkStructureFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function NetworkStructureFilters({
  filters,
  onFiltersChange
}: NetworkStructureFiltersProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Network Structure</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Node Range
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Degree</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={filters.minDegree}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  minDegree: parseInt(e.target.value) || 1 
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Degree</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={filters.maxDegree}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  maxDegree: parseInt(e.target.value) || 10000 
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Edge Range
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Weight</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.minWeight}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  minWeight: parseFloat(e.target.value) || 0 
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Weight</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.maxWeight}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  maxWeight: parseFloat(e.target.value) || 10 
                })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Display Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showLabels}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  showLabels: e.target.checked 
                })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Show labels</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.clusterLayout}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  clusterLayout: e.target.checked 
                })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Force-directed layout</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
