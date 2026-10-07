'use client';

import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Eye, 
  Maximize2,
  Settings,
  X
} from 'lucide-react';
import { NetworkToolbarProps } from '@/types/knowledgeGraph';
import NodeSizingSettings from './NodeSizingSettings';
import NetworkStructureFilters from './NetworkStructureFilters';

export default function NetworkToolbar({
  onFitNetwork,
  onZoomIn,
  onZoomOut,
  onResetNetwork,
  onResetNodeFilter,
  onExport,
  selectedNodeId,
  nodeSizing,
  onNodeSizingChange,
  maxNodes,
  onMaxNodesChange,
  filters,
  onFiltersChange
}: NetworkToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <>
      {showSettings && (
        <div className="absolute top-4 right-4 z-20 w-[550px] max-h-[85vh] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Network Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                title="Close settings"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <NodeSizingSettings
              nodeSizing={nodeSizing}
              onNodeSizingChange={onNodeSizingChange}
              maxNodes={maxNodes}
              onMaxNodesChange={onMaxNodesChange}
            />
            
            <NetworkStructureFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
            />
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-2 flex space-x-1">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 ${
            showSettings ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'hover:shadow-md'
          }`}
          title="Network settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <div className="w-px bg-gray-200 mx-1"></div>
        <button
          onClick={onFitNetwork}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Fit to screen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <div className="w-px bg-gray-200 mx-1"></div>
        <button
          onClick={onResetNetwork}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Reset network"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={onResetNodeFilter}
          className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
            selectedNodeId 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
              : 'hover:bg-gray-100 hover:shadow-md'
          }`}
          title="Show all nodes"
        >
          <Eye className="h-5 w-5" />
        </button>
        <button
          onClick={onExport}
          className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          title="Export as PNG"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
