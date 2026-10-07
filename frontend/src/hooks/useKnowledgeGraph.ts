import { useState, useEffect, useCallback, useRef } from 'react';
import { api, NetworkQuery, GraphData } from '@/lib/api';
import { 
  FilterState, 
  ContentFilters, 
  FilterOption, 
  NetworkState,
  SelectedNode,
  DetailedNodeInfo,
  NodeSizingSettings
} from '@/types/knowledgeGraph';
import { 
  buildPaperFilters, 
  applyNetworkFilters, 
  filterToSelectedNode,
  extractNodeOptions,
  getActiveFiltersCount 
} from '@/utils/knowledgeGraph';
import { DEFAULT_FILTER_STATE, DEFAULT_CONTENT_FILTERS, DEFAULT_NODE_SIZING } from '@/constants/knowledgeGraph';

interface UseKnowledgeGraphProps {
  sessionId?: string;
  isVisible: boolean;
  onNodeSelect?: (node: SelectedNode | null) => void;
  onNodeDetailsUpdate?: (details: DetailedNodeInfo | null) => void;
}

export function useKnowledgeGraph({
  sessionId,
  isVisible,
  onNodeSelect,
  onNodeDetailsUpdate
}: UseKnowledgeGraphProps) {
  const [state, setState] = useState<NetworkState>({
    activeTab: 'complete',
    networkData: null,
    filteredData: null,
    loading: false,
    error: null,
    showFilters: false,
    selectedNodeId: null,
    originalFilteredData: null,
    activeLegendItems: ['paper', 'author', 'institution', 'location', 'topic']
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [contentFilters, setContentFilters] = useState<ContentFilters>(DEFAULT_CONTENT_FILTERS);
  const [nodeSizing, setNodeSizing] = useState<NodeSizingSettings>(DEFAULT_NODE_SIZING);
  const [filterOptions, setFilterOptions] = useState<{
    topicOptions: FilterOption[];
    countryOptions: FilterOption[];
    institutionOptions: FilterOption[];
    authorOptions: FilterOption[];
  }>({
    topicOptions: [],
    countryOptions: [],
    institutionOptions: [],
    authorOptions: []
  });

  const isRequestInProgress = useRef(false);

  const [query, setQuery] = useState<NetworkQuery>({
    network_type: 'complete',
    session_id: sessionId || 'default',
    filters: {}
  });

  useEffect(() => {
    if (state.networkData?.nodes) {
      const nodes = state.networkData.nodes;
      setFilterOptions({
        topicOptions: extractNodeOptions(nodes, 'topic'),
        countryOptions: extractNodeOptions(nodes, 'country'),
        institutionOptions: extractNodeOptions(nodes, 'institution'),
        authorOptions: extractNodeOptions(nodes, 'author')
      });
    }
  }, [state.networkData]);

  useEffect(() => {
    if (sessionId) {
      setQuery(prev => ({ ...prev, session_id: sessionId }));
    }
  }, [sessionId]);

  const fetchNetworkData = useCallback(async () => {
    if (!isVisible || !sessionId) {
      setState(prev => ({ ...prev, error: 'No active analysis session. Please run a search first.' }));
      return;
    }
    
    if (isRequestInProgress.current) {
      return;
    }
    
    isRequestInProgress.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const paperFilters = buildPaperFilters(contentFilters);
      const networkQuery = {
        ...query,
        session_id: sessionId,
        filters: paperFilters
      };
      
      const result = await api.getNetworkData(networkQuery);
      setState(prev => ({
        ...prev,
        networkData: result.network_data,
        filteredData: result.network_data,
        selectedNodeId: null,
        originalFilteredData: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch network data'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
      isRequestInProgress.current = false;
    }
  }, [isVisible, sessionId, query, contentFilters]);

  const applyFilters = useCallback(() => {
    if (!state.networkData) return;

    const filteredData = applyNetworkFilters(
      state.networkData,
      filters,
      contentFilters,
      state.activeLegendItems
    );

    setState(prev => ({
      ...prev,
      filteredData,
      originalFilteredData: filteredData
    }));
  }, [state.networkData, filters, contentFilters, state.activeLegendItems]);

  const filterToNode = useCallback((nodeId: string) => {
    if (!state.networkData) return;

    const filteredData = filterToSelectedNode(nodeId, state.networkData, contentFilters, state.activeLegendItems);
    setState(prev => ({
      ...prev,
      filteredData,
      selectedNodeId: nodeId
    }));
  }, [state.networkData, contentFilters, state.activeLegendItems]);

  const resetNodeFilter = useCallback(() => {
    if (state.originalFilteredData) {
      setState(prev => ({
        ...prev,
        filteredData: prev.originalFilteredData,
        selectedNodeId: null
      }));
    }
    
    onNodeSelect?.(null);
    onNodeDetailsUpdate?.(null);
  }, [state.originalFilteredData, onNodeSelect, onNodeDetailsUpdate]);

  const handleTabChange = useCallback((tab: typeof state.activeTab) => {
    setState(prev => ({ 
      ...prev, 
      activeTab: tab,
      networkData: null,
      filteredData: null,
      originalFilteredData: null,
      loading: false,
      error: null,
      selectedNodeId: null
    }));
    setQuery(prev => ({ ...prev, network_type: tab }));
    resetNodeFilter();
  }, [resetNodeFilter]);

  const handleLegendToggle = useCallback((nodeType: string) => {
    setState(prev => ({
      ...prev,
      activeLegendItems: prev.activeLegendItems.includes(nodeType)
        ? prev.activeLegendItems.filter(type => type !== nodeType)
        : [...prev.activeLegendItems, nodeType]
    }));
  }, []);

  const toggleFilters = useCallback(() => {
    setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    setContentFilters(DEFAULT_CONTENT_FILTERS);
    setState(prev => ({
      ...prev,
      activeLegendItems: ['paper', 'author', 'institution', 'location', 'topic']
    }));
  }, []);

  useEffect(() => {
    if (isVisible && sessionId && !state.networkData && !isRequestInProgress.current) {
      fetchNetworkData();
    }
  }, [isVisible, sessionId, state.networkData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const activeFiltersCount = getActiveFiltersCount(filters, contentFilters);

  return {
    ...state,
    filters,
    contentFilters,
    nodeSizing,
    filterOptions,
    activeFiltersCount,
    
    setFilters,
    setContentFilters,
    setNodeSizing,
    fetchNetworkData,
    filterToNode,
    resetNodeFilter,
    handleTabChange,
    handleLegendToggle,
    toggleFilters,
    resetAllFilters,
    
    hasNetworkData: !!state.networkData,
    hasFilteredData: !!state.filteredData
  };
}
