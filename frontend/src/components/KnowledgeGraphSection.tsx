'use client';

import React, { useRef, useEffect } from 'react';
import { KnowledgeGraphSectionProps } from '@/types/knowledgeGraph';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { NETWORK_TYPES } from '@/constants/knowledgeGraph';
import {
  FilterPanel,
  NetworkControls,
  NetworkLegend,
  NetworkToolbar,
  NetworkStats,
  NetworkVisualization
} from './knowledgeGraph';

export default function KnowledgeGraphSection({ 
  isVisible, 
  sessionId, 
  onNodeSelect, 
  onNodeDetailsUpdate 
}: KnowledgeGraphSectionProps) {
  const networkInstanceRef = useRef<any>(null);

  const {
    activeTab,
    networkData,
    filteredData,
    loading,
    error,
    showFilters,
    selectedNodeId,
    activeLegendItems,
    filters,
    contentFilters,
    nodeSizing,
    filterOptions,
    activeFiltersCount,
    hasNetworkData,
    hasFilteredData,
    
    setFilters,
    setContentFilters,
    setNodeSizing,
    fetchNetworkData,
    filterToNode,
    resetNodeFilter,
    handleTabChange,
    handleLegendToggle,
    toggleFilters,
    resetAllFilters
  } = useKnowledgeGraph({
    sessionId,
    isVisible,
    onNodeSelect,
    onNodeDetailsUpdate
  });

  const handleFitNetwork = () => {
    networkInstanceRef.current?.fit();
  };

  const handleZoomIn = () => {
    networkInstanceRef.current?.moveTo({ scale: 1.2 });
  };

  const handleZoomOut = () => {
    networkInstanceRef.current?.moveTo({ scale: 0.8 });
  };

  const handleNetworkReady = (networkInstance: any) => {
    networkInstanceRef.current = networkInstance;
  };

  useEffect(() => {
    if (networkInstanceRef.current) {
      networkInstanceRef.current.destroy();
      networkInstanceRef.current = null;
    }
  }, [activeTab]);

  const handleResetNetwork = () => {
    if (networkInstanceRef.current && filteredData) {
      networkInstanceRef.current.setData({
        nodes: filteredData.nodes.map(node => ({
          id: node.id,
          label: node.type === 'topic' ? 
            require('@/utils/knowledgeGraph').formatTopicLabel(node.label || node.id) : 
            (node.label || node.id),
          size: node.size || 6,
          color: node.color || '#3b82f6'
        })),
        edges: filteredData.edges.map(edge => ({
          from: edge.source,
          to: edge.target,
          width: edge.weight || 1
        }))
      });
      networkInstanceRef.current.fit();
    }
  };

  const handleExport = () => {
    if (!networkInstanceRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const link = document.createElement('a');
      link.download = `${activeTab}_network.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!isVisible) return null;

  if (!sessionId) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Graph</h2>
          <p className="text-gray-600">Interactive network visualization of relationships in scientific literature</p>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Analysis Session Available</p>
            <p>Please run a search and analysis first to generate network visualizations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Graph</h2>
        <p className="text-gray-600">Interactive network visualization of relationships in scientific literature</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {NETWORK_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTabChange(type.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === type.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="text-center">
              <div className="font-semibold">{type.label}</div>
              <div className="text-xs opacity-75">{type.description}</div>
            </div>
          </button>
        ))}
      </div>

      <NetworkControls
        loading={loading}
        onGenerateNetwork={fetchNetworkData}
        onToggleFilters={toggleFilters}
        showFilters={showFilters}
        activeFiltersCount={activeFiltersCount}
        networkData={networkData}
        filteredData={filteredData}
      />

      {showFilters && (
        <FilterPanel
          filters={filters}
          contentFilters={contentFilters}
          filterOptions={filterOptions}
          onFiltersChange={setFilters}
          onContentFiltersChange={setContentFilters}
          onApplyFilters={fetchNetworkData}
          onResetFilters={resetAllFilters}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      <div className="relative">
        <NetworkToolbar
          onFitNetwork={handleFitNetwork}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetNetwork={handleResetNetwork}
          onResetNodeFilter={resetNodeFilter}
          onExport={handleExport}
          selectedNodeId={selectedNodeId}
          nodeSizing={nodeSizing}
          onNodeSizingChange={setNodeSizing}
          maxNodes={contentFilters.max_nodes}
          onMaxNodesChange={(maxNodes) => setContentFilters({...contentFilters, max_nodes: maxNodes})}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <NetworkLegend
          activeLegendItems={activeLegendItems}
          onToggle={handleLegendToggle}
          activeTab={activeTab}
        />

        <div 
          className="border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-inner" 
          style={{ height: '1000px' }}
        >
          <NetworkVisualization
            filteredData={filteredData}
            networkData={networkData}
            filters={filters}
            contentFilters={contentFilters}
            nodeSizing={nodeSizing}
            activeTab={activeTab}
            loading={loading}
            error={error}
            onNodeSelect={onNodeSelect || (() => {})}
            onNodeDetailsUpdate={onNodeDetailsUpdate || (() => {})}
            onNodeFilter={filterToNode}
            onResetNodeFilter={resetNodeFilter}
            onNetworkReady={handleNetworkReady}
          />
        </div>
      </div>

      <NetworkStats
        filteredData={filteredData}
        networkData={networkData}
        activeTab={activeTab}
      />
    </div>
  );
}
