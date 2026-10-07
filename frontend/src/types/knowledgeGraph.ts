import { GraphData, NetworkQuery, PaperFilters } from '@/lib/api';

export interface KnowledgeGraphSectionProps {
  isVisible: boolean;
  sessionId?: string;
  onNodeSelect?: (node: SelectedNode | null) => void;
  onNodeDetailsUpdate?: (details: DetailedNodeInfo | null) => void;
}

export interface FilterState {
  minDegree: number;
  maxDegree: number;
  minWeight: number;
  maxWeight: number;
  showLabels: boolean;
  clusterLayout: boolean;
  nodeTypes: string[];
}

export interface NodeSizingSettings {
  method: 'degree' | 'citation' | 'fixed';
  minSize: number;
  maxSize: number;
  fixedSize: number;
}

export interface ContentFilters {
  location: string[];
  author: string[];
  country: string[];
  topic: number[];
  year_range: [number, number];
  max_nodes: number;
  paper_rank_by?: 'citation' | 'degree';
}

export interface SelectedNode {
  id: string;
  label: string;
  degree: number;
  type: string;
  properties: Record<string, any>;
}

export interface DetailedNodeInfo {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  connections: number;
  loading?: boolean;
  error?: string;
  paper_details?: any;
  author_details?: any;
  institution_details?: any;
  country_details?: any;
  topic_details?: any;
}

export interface NetworkType {
  id: 'complete' | 'author_collaboration' | 'institution_collaboration' | 'country_collaboration';
  label: string;
  description: string;
}

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface NetworkState {
  activeTab: 'complete' | 'author_collaboration' | 'institution_collaboration' | 'country_collaboration';
  networkData: GraphData | null;
  filteredData: GraphData | null;
  loading: boolean;
  error: string | null;
  showFilters: boolean;
  selectedNodeId: string | null;
  originalFilteredData: GraphData | null;
  activeLegendItems: string[];
}

export interface FilterOptions {
  topicOptions: FilterOption[];
  countryOptions: FilterOption[];
  institutionOptions: FilterOption[];
  authorOptions: FilterOption[];
}

export interface NetworkVisualizationProps {
  filteredData: GraphData | null;
  networkData: GraphData | null;
  filters: FilterState;
  contentFilters: ContentFilters;
  nodeSizing: NodeSizingSettings;
  activeTab: string;
  loading: boolean;
  error: string | null;
  onNodeSelect: (node: SelectedNode | null) => void;
  onNodeDetailsUpdate: (details: DetailedNodeInfo | null) => void;
  onNodeFilter: (nodeId: string) => void;
  onResetNodeFilter: () => void;
  onNetworkReady?: (networkInstance: any) => void;
}

export interface NetworkToolbarProps {
  onFitNetwork: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNetwork: () => void;
  onResetNodeFilter: () => void;
  onExport: () => void;
  selectedNodeId: string | null;
  nodeSizing: NodeSizingSettings;
  onNodeSizingChange: (settings: NodeSizingSettings) => void;
  maxNodes: number;
  onMaxNodesChange: (maxNodes: number) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export interface NetworkLegendProps {
  activeLegendItems: string[];
  onToggle: (nodeType: string) => void;
  activeTab: string;
}

export interface NetworkStatsProps {
  filteredData: GraphData | null;
  networkData: GraphData | null;
  activeTab: string;
}

export interface FilterPanelProps {
  filters: FilterState;
  contentFilters: ContentFilters;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: FilterState) => void;
  onContentFiltersChange: (filters: ContentFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
}

export interface NetworkControlsProps {
  loading: boolean;
  onGenerateNetwork: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  activeFiltersCount: number;
  networkData: GraphData | null;
  filteredData: GraphData | null;
}
