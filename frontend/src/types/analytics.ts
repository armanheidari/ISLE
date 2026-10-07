import { AnalysisResult } from '@/lib/api';

export interface SelectedNode {
  id: string;
  label: string;
  degree: number;
  type: string;
  properties: Record<string, any>;
}

export interface AnalyticsDashboardProps {
  data: AnalysisResult;
  onNodeSelect: (node: SelectedNode | null) => void;
}

export interface TopicDistributionData {
  name: string;
  shortName: string;
  value: number;
  percentage: number;
  fill: string;
  topicId: string;
}

export interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

export interface TabButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export type TabType = 'overview' | 'trends' | 'wordclouds' | 'rankings' | 'map';
export type RankByType = 'papers' | 'citations';
export type { AnalysisResult } from '@/lib/api';

