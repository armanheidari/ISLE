import { NodeType, NodeTypeConfig } from '@/types/sidePanel';

export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  paper: {
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    label: 'Paper'
  },
  author: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Author'
  },
  institution: {
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'Institution'
  },
  country: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Country'
  },
  keyword: {
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    label: 'Keyword'
  },
  topic: {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    label: 'Topic'
  }
};

export const CHUNK_SIZE = 20;
export const MAX_PAPER_LIST_HEIGHT = '350px';

export const STATISTICS_COLORS = {
  papers: 'text-blue-600',
  citations: 'text-green-600',
  average: 'text-purple-600'
} as const;