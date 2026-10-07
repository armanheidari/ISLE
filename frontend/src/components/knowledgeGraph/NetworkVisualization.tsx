'use client';

import React, { useRef, useEffect } from 'react';
import { Network } from 'vis-network';
import { NetworkVisualizationProps } from '@/types/knowledgeGraph';
import { 
  NODE_COLOR_PALETTE, 
  NODE_SIZE_RANGES, 
  NETWORK_LAYOUT_CONFIG 
} from '@/constants/knowledgeGraph';
import { 
  formatTopicLabel, 
  hexToRgba, 
  trimLabel, 
  getNetworkLayoutConfig,
  calculateNodeSize 
} from '@/utils/knowledgeGraph';

export default function NetworkVisualization({
  filteredData,
  networkData,
  filters,
  contentFilters,
  nodeSizing,
  activeTab,
  loading,
  error,
  onNodeSelect,
  onNodeDetailsUpdate,
  onNodeFilter,
  onResetNodeFilter,
  onNetworkReady
}: NetworkVisualizationProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (networkInstanceRef.current) {
      networkInstanceRef.current.destroy();
      networkInstanceRef.current = null;
    }

    if (!networkRef.current || !filteredData) {
      if (networkRef.current) {
        networkRef.current.innerHTML = '';
      }
      return;
    }

    const visNetworkData = buildVisData();
    const options = buildVisOptions();
    networkInstanceRef.current = new Network(networkRef.current, visNetworkData, options);

    if (onNetworkReady) {
      onNetworkReady(networkInstanceRef.current);
    }

    setupEventHandlers();

    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }
    };
  }, [filteredData, filters, contentFilters, activeTab, nodeSizing]);

  const buildVisData = () => {
    if (!filteredData) return { nodes: [], edges: [] };

    const nodeCount = filteredData.nodes.length;
    const edgeCount = filteredData.edges.length;

    const degreeMap: Record<string, number> = {};
    filteredData.edges.forEach(edge => {
      degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
      degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
    });

    const citationMap: Record<string, number> = {};
    filteredData.nodes.forEach(node => {
      if (node.type === 'paper') {
        citationMap[node.id] = ((node as any).properties?.citation_count) || 0;
      } else if (['author', 'institution', 'country', 'location'].includes(node.type)) {
        citationMap[node.id] = ((node as any).properties?.total_citations) || 0;
      }
    });

    let minW = Infinity, maxW = -Infinity;
    filteredData.edges.forEach(edge => {
      const w = typeof edge.weight === 'number' ? edge.weight : 1;
      if (w < minW) minW = w;
      if (w > maxW) maxW = w;
    });
    if (!isFinite(minW)) minW = 1;
    if (!isFinite(maxW)) maxW = 1;
    const denom = maxW - minW || 1;

    const minYear = Array.isArray(contentFilters.year_range) ? contentFilters.year_range[0] : 1990;
    const maxYear = Array.isArray(contentFilters.year_range) ? contentFilters.year_range[1] : new Date().getFullYear();

    const nodes = filteredData.nodes.map(node => {
      const size = calculateNodeSize(node, degreeMap, citationMap, contentFilters, nodeCount, nodeSizing);
      const labelColor = (node.type === 'paper' && activeTab === 'complete') ? 'rgba(15,23,42,0.7)' : '#0f172a';
      const formattedLabel = node.type === 'topic' ? formatTopicLabel(node.label || node.id) : (node.label || node.id);
      
      let backgroundColor: string = NODE_COLOR_PALETTE[node.type as keyof typeof NODE_COLOR_PALETTE] || NODE_COLOR_PALETTE.default;
      if (node.type === 'paper') {
        const props: any = (node as any).properties || {};
        const rawYear = props.year ?? props.publication_year ?? props.pub_year ?? props.published_year;
        const year = typeof rawYear === 'number' ? rawYear : parseInt((rawYear || '').toString(), 10);
        const y = isNaN(year) ? minYear : Math.max(minYear, Math.min(maxYear, year));
        const t = (y - minYear) / Math.max(1, (maxYear - minYear));
        const alpha = 0.1 + t * 0.9;
        backgroundColor = hexToRgba(backgroundColor, alpha);
      }

      return {
        id: node.id,
        label: trimLabel(formattedLabel, node.id, filters.showLabels),
        title: `${node.type || 'node'}: ${formattedLabel}`,
        size,
        color: {
          background: backgroundColor,
          border: '#ffffff',
          highlight: { background: '#ff7a7a', border: '#ffffff' }
        },
        font: { size: 12, color: labelColor, face: 'Inter, sans-serif' },
        borderWidth: 2,
        shadow: { enabled: true, color: 'rgba(2,6,23,0.08)', size: 6, x: 2, y: 2 },
        shape: 'dot'
      };
    });

    const edges = filteredData.edges.map(edge => {
      const w = typeof edge.weight === 'number' ? edge.weight : 1;
      const t = (w - minW) / denom;
      const width = 0.6 + t * 3.4;
      const opacity = Math.min(1, 0.4 + t * 0.6);
      
      const sourceNode = filteredData.nodes.find(n => n.id === edge.source);
      const targetNode = filteredData.nodes.find(n => n.id === edge.target);
      const isPaperToPaper = sourceNode?.type === 'paper' && targetNode?.type === 'paper';
      
      return {
        from: edge.source,
        to: edge.target,
        width,
        color: { color: `rgba(31,41,55,${opacity})`, highlight: '#3b82f6' },
        smooth: false,
        dashes: false,
        arrows: { 
          to: { 
            enabled: isPaperToPaper,
            scaleFactor: 1.2,
            type: 'arrow'
          } 
        },
        selectionWidth: 3
      };
    });

    return { nodes, edges };
  };

  const buildVisOptions = () => {
    if (!filteredData) return {};

    const nodeCount = filteredData.nodes.length;
    const config = getNetworkLayoutConfig(nodeCount);
    const isLarge = nodeCount > 600;
    const isMedium = nodeCount > 300 && nodeCount <= 600;
    const useHierarchical = activeTab === 'complete' && !filters.clusterLayout && !isLarge;

    return {
      layout: {
        improvedLayout: !isLarge,
        hierarchical: useHierarchical ? {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 220,
          nodeSpacing: 160
        } : false,
        randomSeed: 42
      },
      physics: {
        enabled: true,
        solver: config.solver as any,
        hierarchicalRepulsion: { 
          nodeDistance: 200, 
          centralGravity: 0.006, 
          springLength: 160, 
          damping: 0.1 
        },
        barnesHut: { 
          gravitationalConstant: -35000, 
          centralGravity: 0.08, 
          springLength: 160, 
          springConstant: 0.02, 
          damping: 0.3, 
          avoidOverlap: 0.6 
        },
        forceAtlas2Based: { 
          gravitationalConstant: -80, 
          centralGravity: 0.012, 
          springLength: 150, 
          springConstant: 0.055 
        },
        stabilization: { 
          iterations: config.iterations, 
          updateInterval: 25 
        }
      },
      nodes: {
        shape: 'dot',
        borderWidth: 2,
        shadow: true,
        scaling: { min: 8, max: 28, label: { enabled: true, min: 12, max: 18 } }
      },
      edges: { smooth: false },
      interaction: {
        hover: true,
        hoverConnectedEdges: !isLarge,
        selectConnectedEdges: true,
        zoomView: true,
        dragView: true,
        multiselect: activeTab !== 'complete',
        navigationButtons: false,
        keyboard: { enabled: true },
        tooltipDelay: 160,
        hideEdgesOnDrag: true,
        hideNodesOnDrag: isLarge
      },
      configure: { enabled: false }
    };
  };

  const setupEventHandlers = () => {
    if (!networkInstanceRef.current || !filteredData) return;

    networkInstanceRef.current.on('selectNode', (event) => {
      if (!event || !event.nodes || event.nodes.length === 0) return;
      const nodeId = event.nodes[0];
      const node = filteredData.nodes.find(n => n.id === nodeId);
      if (!node) return;

      const degree = filteredData.edges.filter(e => e.source === nodeId || e.target === nodeId).length;
      const selectedLabel = node.type === 'topic' ? formatTopicLabel(node.label || node.id) : (node.label || node.id);
      const selectedNodeData = {
        id: node.id,
        label: selectedLabel, 
        degree,
        type: node.type || 'unknown',
        properties: (node as any).properties || {}
      };

      onNodeSelect?.(selectedNodeData);
      onNodeFilter(nodeId);
    });

    networkInstanceRef.current.on('deselectNode', () => {
      onNodeSelect?.(null);
      onNodeDetailsUpdate?.(null);
    });

    networkInstanceRef.current.on('click', (event) => {
      if (!event || !event.nodes || event.nodes.length === 0) {
        onResetNodeFilter();
      }
    });
  };


  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Generating network visualization...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="font-semibold text-red-800 mb-2">Error loading network</p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={networkRef} 
      className="w-full h-full rounded-xl" 
    />
  );
}
