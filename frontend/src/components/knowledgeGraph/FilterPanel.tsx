'use client';

import React from 'react';
import { default as Select } from 'react-select';
const RS = Select as unknown as React.ComponentType<any>;
import { FilterPanelProps } from '@/types/knowledgeGraph';

export default function FilterPanel({
  filters,
  contentFilters,
  filterOptions,
  onFiltersChange,
  onContentFiltersChange,
  onApplyFilters,
  onResetFilters,
  activeFiltersCount
}: FilterPanelProps) {
  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Network Filters</h3>

      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Content Filters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authors
            </label>
            <RS
              isMulti
              options={filterOptions.authorOptions}
              value={filterOptions.authorOptions.filter(option => 
                contentFilters.author.includes(option.value as string)
              )}
              onChange={(selectedOptions: any) =>
                onContentFiltersChange({
                  ...contentFilters,
                  author: Array.isArray(selectedOptions) 
                    ? selectedOptions.map((option: any) => option.value) 
                    : []
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institutions
            </label>
            <RS
              isMulti
              options={filterOptions.institutionOptions}
              value={filterOptions.institutionOptions.filter(option => 
                contentFilters.location.includes(option.value as string)
              )}
              onChange={(selectedOptions: any) =>
                onContentFiltersChange({
                  ...contentFilters,
                  location: Array.isArray(selectedOptions) 
                    ? selectedOptions.map((option: any) => option.value) 
                    : []
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countries
            </label>
            <RS
              isMulti
              options={filterOptions.countryOptions}
              value={filterOptions.countryOptions.filter(option => 
                contentFilters.country.includes(option.value as string)
              )}
              onChange={(selectedOptions: any) =>
                onContentFiltersChange({
                  ...contentFilters,
                  country: Array.isArray(selectedOptions) 
                    ? selectedOptions.map((option: any) => option.value) 
                    : []
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics
            </label>
            <RS
              isMulti
              options={filterOptions.topicOptions}
              value={filterOptions.topicOptions.filter(option => 
                contentFilters.topic.includes(option.value as number)
              )}
              onChange={(selectedOptions: any) =>
                onContentFiltersChange({
                  ...contentFilters,
                  topic: Array.isArray(selectedOptions) 
                    ? selectedOptions.map((option: any) => option.value) 
                    : []
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </div>


      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Additional Filters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publication Year Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={contentFilters.year_range[0]}
                onChange={(e) => onContentFiltersChange({ 
                  ...contentFilters, 
                  year_range: [parseInt(e.target.value) || 1980, contentFilters.year_range[1]] as [number, number]
                })}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={contentFilters.year_range[1]}
                onChange={(e) => onContentFiltersChange({ 
                  ...contentFilters, 
                  year_range: [contentFilters.year_range[0], parseInt(e.target.value) || new Date().getFullYear()] as [number, number]
                })}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paper selection method</label>
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => onContentFiltersChange({ 
                  ...contentFilters, 
                  paper_rank_by: 'degree' 
                })}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  contentFilters.paper_rank_by === 'degree' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                aria-pressed={contentFilters.paper_rank_by === 'degree'}
              >
                By degree
              </button>
              <button
                type="button"
                onClick={() => onContentFiltersChange({ 
                  ...contentFilters, 
                  paper_rank_by: 'citation' 
                })}
                className={`px-3 py-1.5 text-sm border-l border-gray-300 transition-colors ${
                  contentFilters.paper_rank_by === 'citation' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                aria-pressed={contentFilters.paper_rank_by === 'citation'}
              >
                By citation count
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onApplyFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={onResetFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
          >
            Reset All
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">Active filters:</span> {
            [
              contentFilters.author.length > 0 && `${contentFilters.author.length} authors`,
              contentFilters.location.length > 0 && `${contentFilters.location.length} institutions`, 
              contentFilters.country.length > 0 && `${contentFilters.country.length} countries`,
              contentFilters.topic.length > 0 && `${contentFilters.topic.length} topics`,
              (contentFilters.year_range[0] !== 1980 || contentFilters.year_range[1] !== new Date().getFullYear()) && 'year range'
            ].filter(Boolean).join(', ') || 'none'
          }
        </div>
      </div>
    </div>
  );
}
