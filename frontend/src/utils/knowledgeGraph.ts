import { GraphData, GraphNode, GraphEdge } from '@/lib/api';
import { FilterState, ContentFilters, FilterOption } from '@/types/knowledgeGraph';
import { NODE_COLOR_PALETTE, NODE_SIZE_RANGES, NETWORK_LAYOUT_CONFIG } from '@/constants/knowledgeGraph';

/**
 * Format topic labels from raw labels or ids like 'topic1_word1_word2' or '1_word1_word2'
 */
export function formatTopicLabel(raw?: string): string {
  if (!raw) return '';
  let s = raw.toString();
  s = s.replace(/^topic[_-]?\d+[_\s-]*/i, '');
  s = s.replace(/^[0-9]+[_\s-]*/, '');
  const parts = s.split(/[_\s-]+/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1));
  return parts.join(', ');
}

/**
 * Extract and format options from network data nodes
 */
export function extractNodeOptions(nodes: GraphNode[], nodeType: string): FilterOption[] {
  const filteredNodes = nodes.filter(node => node.type === nodeType);
  
  return filteredNodes.map(node => {
    let rawLabel = node.label || node.id;
    rawLabel = rawLabel.replace(/^[0-9]+_/, '');
    
    let label: string;
    if (nodeType === 'topic') {
      label = formatTopicLabel(rawLabel);
    } else {
      label = rawLabel
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return {
      value: nodeType === 'topic' 
        ? parseInt((node.id || '').toString().replace(/topic[_-]?/, '')) || 0
        : node.label || node.id,
      label
    };
  });
}

/**
 * Build paper filters from content filters
 */
export function buildPaperFilters(contentFilters: ContentFilters) {
  const paperFilters: Record<string, any> = {};
  
  if (contentFilters.location.length > 0) {
    paperFilters.location = contentFilters.location;
  }
  if (contentFilters.author.length > 0) {
    paperFilters.author = contentFilters.author;
  }
  if (contentFilters.country.length > 0) {
    paperFilters.country = contentFilters.country;
  }
  if (contentFilters.topic.length > 0) {
    paperFilters.topic = contentFilters.topic;
  }
  if (contentFilters.year_range[0] !== 1980 || contentFilters.year_range[1] !== new Date().getFullYear()) {
    paperFilters.year_range = contentFilters.year_range;
  }
  
  return paperFilters;
}

/**
 * Get active filters count
 */
export function getActiveFiltersCount(filters: FilterState, contentFilters: ContentFilters): number {
  let count = 0;
  
  if (contentFilters.author.length > 0) count++;
  if (contentFilters.location.length > 0) count++;
  if (contentFilters.country.length > 0) count++;
  if (contentFilters.topic.length > 0) count++;
  if (contentFilters.year_range[0] !== 1980 || contentFilters.year_range[1] !== new Date().getFullYear()) count++;
  
  if (filters.minDegree !== 1 || filters.maxDegree !== 10000) count++;
  if (filters.minWeight !== 0.0001 || filters.maxWeight !== 10000) count++;
  
  return count;
}

/**
 * Apply network filters to data
 */
export function applyNetworkFilters(
  networkData: GraphData,
  filters: FilterState,
  contentFilters: ContentFilters,
  activeLegendItems: string[]
): GraphData {
  let filteredNodes = networkData.nodes.filter(node => {
    const degree = networkData.edges.filter(edge =>
      edge.source === node.id || edge.target === node.id
    ).length;

    if (degree < filters.minDegree || degree > filters.maxDegree) {
      return false;
    }

    if (activeLegendItems.length > 0) {
      const mappedNodeTypes = activeLegendItems.map(type => type === 'location' ? 'country' : type);
      if (!mappedNodeTypes.includes(node.type)) {
        return false;
      }
    }
    return true;
  });

  filteredNodes = applyNodeTruncation(filteredNodes, networkData, contentFilters);

  const nodeIds = new Set(filteredNodes.map(node => node.id));
  const filteredEdges = networkData.edges.filter(edge => {
    const weight = edge.weight || 1;
    return nodeIds.has(edge.source) &&
           nodeIds.has(edge.target) &&
           weight >= filters.minWeight &&
           weight <= filters.maxWeight;
  });

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Apply node truncation based on max_nodes setting
 */
function applyNodeTruncation(
  nodes: GraphNode[],
  networkData: GraphData,
  contentFilters: ContentFilters
): GraphNode[] {
  const maxNodes = contentFilters.max_nodes || 0;
  if (maxNodes <= 0 || nodes.length <= maxNodes) {
    return nodes;
  }

  const degreeMap: Record<string, number> = {};
  const citationMap: Record<string, number> = {};
  
  networkData.edges.forEach(edge => {
    degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1;
    degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1;
  });
  
  networkData.nodes.forEach(node => {
    if (node.type === 'paper') {
      citationMap[node.id] = ((node as any).properties?.citation_count) || 0;
    } else if (['author', 'institution', 'country', 'location'].includes(node.type)) {
      citationMap[node.id] = ((node as any).properties?.total_citations) || 0;
    }
  });

  const scored = nodes.map(node => {
    if (node.type === 'topic') {
      return { node, score: degreeMap[node.id] || 0 };
    } else if (["paper", "institution", "country", "author"].includes(node.type)) {
      if (contentFilters.paper_rank_by === 'citation') {
        return { node, score: citationMap[node.id] || 0 };
      } else {
        return { node, score: degreeMap[node.id] || 0 };
      }
    } else {
      return { node, score: degreeMap[node.id] || 0 };
    }
  });

  scored.sort((a, b) => b.score - a.score);
  const topNodes = new Set(scored.slice(0, maxNodes).map(s => s.node.id));
  return nodes.filter(n => topNodes.has(n.id));
}

/**
 * Filter network to show only selected node and its connections
 */
export function filterToSelectedNode(
  nodeId: string,
  networkData: GraphData,
  contentFilters: ContentFilters,
  activeLegendItems: string[] = []
): GraphData {
  const firstHopEdges = networkData.edges.filter(edge => 
    edge.source === nodeId || edge.target === nodeId
  );
  
  const firstHopNodeIds = new Set<string>();
  firstHopNodeIds.add(nodeId);
  firstHopEdges.forEach(edge => {
    firstHopNodeIds.add(edge.source);
    firstHopNodeIds.add(edge.target);
  });

  const firstHopPapers = Array.from(firstHopNodeIds).filter(nodeId => {
    const node = networkData.nodes.find(n => n.id === nodeId);
    return node?.type === 'paper';
  });

  const secondHopEdges = networkData.edges.filter(edge => 
    firstHopPapers.includes(edge.source) || firstHopPapers.includes(edge.target)
  );

  const allConnectedNodeIds = new Set<string>();
  allConnectedNodeIds.add(nodeId);
  secondHopEdges.forEach(edge => {
    allConnectedNodeIds.add(edge.source);
    allConnectedNodeIds.add(edge.target);
  });

  let filteredNodes = networkData.nodes.filter(node => 
    allConnectedNodeIds.has(node.id)
  );

  if (activeLegendItems.length > 0) {
    const mappedNodeTypes = activeLegendItems.map(type => type === 'location' ? 'country' : type);
    filteredNodes = filteredNodes.filter(node => 
      mappedNodeTypes.includes(node.type)
    );
  }

  filteredNodes = applyNodeTruncation(filteredNodes, networkData, contentFilters);

  const nodeIds = new Set(filteredNodes.map(node => node.id));
  const filteredEdges = secondHopEdges.filter(edge => 
    nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
}

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Trim label for display
 */
export function trimLabel(label?: string, id?: string, showLabels: boolean = true): string {
  if (!showLabels) return '';
  const txt = label && label !== id ? label : id || '';
  return txt.length > 30 ? `${txt.substring(0, 30)}...` : txt;
}

/**
 * Get network layout configuration based on node count
 */
export function getNetworkLayoutConfig(nodeCount: number) {
  if (nodeCount > NETWORK_LAYOUT_CONFIG.large.maxNodes) {
    return NETWORK_LAYOUT_CONFIG.large;
  } else if (nodeCount > NETWORK_LAYOUT_CONFIG.medium.maxNodes) {
    return NETWORK_LAYOUT_CONFIG.medium;
  }
  return NETWORK_LAYOUT_CONFIG.small;
}

/**
 * Calculate node size based on type and metrics
 */
export function calculateNodeSize(
  node: GraphNode,
  degreeMap: Record<string, number>,
  citationMap: Record<string, number>,
  contentFilters: ContentFilters,
  nodeCount: number,
  nodeSizing?: { method: 'degree' | 'citation' | 'fixed'; minSize: number; maxSize: number; fixedSize: number }
): number {
  if (nodeSizing) {
    if (nodeSizing.method === 'fixed') {
      return nodeSizing.fixedSize;
    }

    let score = 0;
    if (nodeSizing.method === 'degree') {
      score = degreeMap[node.id] || 0;
    } else if (nodeSizing.method === 'citation') {
      if (node.type === 'paper') {
        const citations = ((node as any).properties?.citation_count) || 0;
        score = Math.log1p(citations);
      } else {
        score = Math.log1p(citationMap[node.id] || 0);
      }
    }

    const maxScore = Math.max(...Object.values(degreeMap), ...Object.values(citationMap).map(v => Math.log1p(v)));
    const normalizedScore = maxScore > 0 ? Math.min(1, Math.max(0, score / maxScore)) : 0;
    
    return nodeSizing.minSize + normalizedScore * (nodeSizing.maxSize - nodeSizing.minSize);
  }

  const nodeType = node.type === 'location' ? 'country' : node.type || 'default';
  const range = NODE_SIZE_RANGES[nodeType as keyof typeof NODE_SIZE_RANGES] || NODE_SIZE_RANGES.default;
  
  const shrink = nodeCount > 800 ? 6 : (nodeCount > 400 ? 3 : 0);
  const minOut = Math.max(8, range.min - Math.floor(shrink / 2));
  const maxOut = Math.max(minOut + 6, range.max - shrink);

  let score = 0;
  if (nodeType === 'topic') {
    score = degreeMap[node.id] || 0;
  } else if (nodeType === 'paper') {
    const citations = ((node as any).properties?.citation_count) || 0;
    score = Math.log1p(citations);
  } else {
    if (contentFilters.paper_rank_by === 'citation') {
      score = Math.log1p(citationMap[node.id] || 0);
    } else {
      score = degreeMap[node.id] || 0;
    }
  }

  const normalizedScore = Math.min(1, Math.max(0, score / 10));
  return minOut + normalizedScore * (maxOut - minOut);
}
