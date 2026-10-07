import { BookOpen, Users, Globe, Award } from 'lucide-react';
import { StatCard } from '@/types/analytics';

export const CHART_COLORS = [
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

export const TAB_CONFIG = {
  overview: { label: 'Overview', id: 'overview' },
  trends: { label: 'Trends', id: 'trends' },
  wordclouds: { label: 'Topics', id: 'wordclouds' },
  rankings: { label: 'Rankings', id: 'rankings' },
  map: { label: 'Map', id: 'map' }
} as const;

export const RANK_BY_OPTIONS = {
  papers: { label: 'Papers', id: 'papers' },
  citations: { label: 'Citations', id: 'citations' }
} as const;

export const DEFAULT_VISIBLE_TOPICS_COUNT = 3;

export const CHART_CONFIG = {
  pieChart: {
    innerRadius: 100,
    outerRadius: 150,
    strokeWidth: 2
  },
  lineChart: {
    strokeWidth: 2,
    dotRadius: 3,
    activeDotRadius: 5
  }
} as const;

export const createStatCards = (basicStats: any): StatCard[] => [
  {
    title: 'Papers Found',
    value: basicStats.num_papers.toLocaleString(),
    icon: BookOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Authors',
    value: basicStats.num_authors.toLocaleString(),
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    title: 'Countries',
    value: basicStats.num_countries.toLocaleString(),
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    title: 'Institutions',
    value: basicStats.num_institutions.toLocaleString(),
    icon: Award,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  }
];
