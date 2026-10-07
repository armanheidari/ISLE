'use client';

import { useState } from 'react';
import { Search, BarChart3, Network, Menu, X } from 'lucide-react';
import SearchSection from '@/components/SearchSection';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import KnowledgeGraphSection from '@/components/KnowledgeGraphSection';
import SidePanel from '@/components/SidePanel';
import GlobalSettings from '@/components/GlobalSettings';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { AnalysisResult, NodeDetails, api } from '@/lib/api';

interface SelectedNode {
  id: string;
  label: string;
  degree: number;
  type: string;
  properties: Record<string, any>;
}

interface DetailedNodeInfo extends NodeDetails {
  loading?: boolean;
  error?: string;
  paper_details?: any;
  author_details?: any;
  institution_details?: any;
  country_details?: any;
  topic_details?: any;
}

function HomePageContent() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [detailedNodeInfo, setDetailedNodeInfo] = useState<DetailedNodeInfo | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [lastBuiltQuery, setLastBuiltQuery] = useState<any | null>(null);
  const { settings, updateSettings, saveSettings, resetSettings } = useSettings();

  const fetchNodeDetails = async (nodeId: string, sessionId: string) => {
    setDetailedNodeInfo({ 
      id: nodeId,
      label: '',
      type: '',
      properties: {},
      connections: 0,
      loading: true, 
      error: undefined 
    });
    
    try {
      const details = await api.getNodeDetails(sessionId, nodeId);
      setDetailedNodeInfo({ ...details, loading: false });
    } catch (err) {
      setDetailedNodeInfo({ 
        id: nodeId,
        label: '',
        type: '',
        properties: {},
        connections: 0,
        loading: false, 
        error: err instanceof Error ? err.message : 'Failed to fetch node details' 
      });
    }
  };

  const handleAnalysisComplete = (data: AnalysisResult) => {
    setAnalysisData(data);
    setIsLoading(false);
  };

  const handleBuiltQuery = (q: any) => {
    setLastBuiltQuery(q);
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setAnalysisData(null);
    setSelectedNode(null);
    setDetailedNodeInfo(null);
    setShowSidePanel(false);
  };

  const handleNodeSelection = (node: SelectedNode | null) => {
    setSelectedNode(node);
    if (node && analysisData?.session_id) {
      setShowSidePanel(true);
      fetchNodeDetails(node.id, analysisData.session_id);
    } else {
      setShowSidePanel(false);
      setDetailedNodeInfo(null);
    }
  };

  const handleNodeDetailsUpdate = (details: DetailedNodeInfo | null) => {
    setDetailedNodeInfo(details);
  };

  const handleCloseSidePanel = () => {
    setShowSidePanel(false);
    setSelectedNode(null);
    setDetailedNodeInfo(null);
  };

  return (
    <div className="relative min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="ISLE Logo" 
                className="h-10 w-auto"
              />
            </div>
            <div className="text-sm text-gray-600">
              Intelligent Scientific Literature Explorer
            </div>
          </div>
        </div>
      </header>

      <main className={`transition-all duration-300 ${
        showSidePanel ? 'lg:mr-96' : ''
      } px-4 pt-24 pb-8`}>
        <div className="text-center mb-12 max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">ISLE</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Intelligent Scientific Literature Explorer using Machine Learning.<br />
            An integrated system combining large-scale data acquisition, hybrid retrieval, semantic topic modeling, and heterogeneous knowledge graphs.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <SearchSection 
            onAnalysisComplete={handleAnalysisComplete}
            onSearchStart={handleSearchStart}
            isLoading={isLoading}
            onBuiltQuery={handleBuiltQuery}
            settings={settings}
          />
        </div>

        {analysisData && (
          <div className="space-y-8 mt-12 max-w-none">
            <div className="max-w-7xl mx-auto">
              <AnalyticsDashboard data={analysisData} onNodeSelect={handleNodeSelection} />
            </div>
            <div className="max-w-7xl mx-auto">
              <KnowledgeGraphSection 
                isVisible={true} 
                sessionId={analysisData.session_id}
                onNodeSelect={handleNodeSelection}
                onNodeDetailsUpdate={handleNodeDetailsUpdate}
              />
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4 max-w-md text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-lg text-gray-600 mb-2">Analyzing papers...</p>
                <p className="text-sm text-gray-500">
                  Processing large datasets may take 1-2 minutes. Please wait while we analyze your search results.
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SidePanel
        isOpen={showSidePanel}
        selectedNode={selectedNode}
        detailedNodeInfo={detailedNodeInfo}
        onClose={handleCloseSidePanel}
        onNodeSelect={handleNodeSelection}
      />

      <GlobalSettings
        settings={settings}
        onSettingsChange={updateSettings}
        onSave={saveSettings}
        onReset={resetSettings}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <SettingsProvider>
      <HomePageContent />
    </SettingsProvider>
  );
}