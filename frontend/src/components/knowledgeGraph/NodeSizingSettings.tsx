'use client';

import React from 'react';
import { NodeSizingSettings as NodeSizingSettingsType } from '@/types/knowledgeGraph';
import { NODE_SIZING_OPTIONS } from '@/constants/knowledgeGraph';

interface NodeSizingSettingsProps {
  nodeSizing: NodeSizingSettingsType;
  onNodeSizingChange: (settings: NodeSizingSettingsType) => void;
  maxNodes: number;
  onMaxNodesChange: (maxNodes: number) => void;
}

export default function NodeSizingSettings({
  nodeSizing,
  onNodeSizingChange,
  maxNodes,
  onMaxNodesChange
}: NodeSizingSettingsProps) {
  const handleMethodChange = (method: 'degree' | 'citation' | 'fixed') => {
    onNodeSizingChange({
      ...nodeSizing,
      method
    });
  };

  const handleMinSizeChange = (minSize: number) => {
    onNodeSizingChange({
      ...nodeSizing,
      minSize: Math.max(1, Math.min(minSize, nodeSizing.maxSize - 1))
    });
  };

  const handleMaxSizeChange = (maxSize: number) => {
    onNodeSizingChange({
      ...nodeSizing,
      maxSize: Math.max(maxSize, nodeSizing.minSize + 1)
    });
  };

  const handleFixedSizeChange = (fixedSize: number) => {
    onNodeSizingChange({
      ...nodeSizing,
      fixedSize: Math.max(1, Math.min(fixedSize, 100))
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Node Structure</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Size by
        </label>
        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
          {NODE_SIZING_OPTIONS.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleMethodChange(option.value as 'degree' | 'citation' | 'fixed')}
              className={`px-4 py-2 text-sm transition-colors ${
                nodeSizing.method === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${index > 0 ? 'border-l border-gray-300' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {nodeSizing.method !== 'fixed' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Size Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Size</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="49"
                  value={nodeSizing.minSize}
                  onChange={(e) => handleMinSizeChange(parseInt(e.target.value))}
                  className="w-36"
                />
                <input
                  type="number"
                  min="1"
                  max="49"
                  value={nodeSizing.minSize}
                  onChange={(e) => handleMinSizeChange(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Size</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={nodeSizing.maxSize}
                  onChange={(e) => handleMaxSizeChange(parseInt(e.target.value))}
                  className="w-36"
                />
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={nodeSizing.maxSize}
                  onChange={(e) => handleMaxSizeChange(parseInt(e.target.value) || 50)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Max Nodes to Display
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={maxNodes}
            onChange={(e) => onMaxNodesChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min="10"
            max="1000"
            value={maxNodes}
            onChange={(e) => onMaxNodesChange(parseInt(e.target.value) || 100)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Adjust to control network complexity and performance
        </div>
      </div>

      {nodeSizing.method === 'fixed' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fixed Size
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="50"
              value={nodeSizing.fixedSize}
              onChange={(e) => handleFixedSizeChange(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="50"
                value={nodeSizing.fixedSize}
                onChange={(e) => handleFixedSizeChange(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <span className="font-medium">Preview:</span> {
          nodeSizing.method === 'fixed' 
            ? `${nodeSizing.fixedSize}px for all nodes`
            : `${nodeSizing.minSize}px - ${nodeSizing.maxSize}px based on ${nodeSizing.method}`
        }
      </div>
    </div>
  );
}
