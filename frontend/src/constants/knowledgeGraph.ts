import { NetworkType } from '@/types/knowledgeGraph';

export const NETWORK_TYPES: NetworkType[] = [
  { 
    id: 'complete', 
    label: 'Complete Network', 
    description: 'Full network view relationships' 
  },
  { 
    id: 'author_collaboration', 
    label: 'Author Collaboration', 
    description: 'Authors and co-authorship connections' 
  },
  { 
    id: 'institution_collaboration', 
    label: 'Institution Network', 
    description: 'Institutional collaborations and affiliations' 
  },
  { 
    id: 'country_collaboration', 
    label: 'Country Network', 
    description: 'Countries and their research collaborations' 
  }
];

export const NODE_COLOR_PALETTE = {
  paper: '#2563eb',
  author: '#10b981',
  institution: '#f59e0b',
  location: '#8b5cf6',
  country: '#8b5cf6',
  topic: '#ef4444',
  year: '#6366f1',
  default: '#6b7280'
} as const;

export const DEFAULT_FILTER_STATE = {
  minDegree: 1,
  maxDegree: 10000,
  minWeight: 0.0001,
  maxWeight: 10000,
  showLabels: true,
  clusterLayout: true,
  nodeTypes: ['paper', 'author', 'institution', 'location', 'topic'],
};

export const DEFAULT_CONTENT_FILTERS = {
  location: [],
  author: [],
  country: [],
  topic: [],
  year_range: [1980, new Date().getFullYear()] as [number, number],
  max_nodes: 100,
  paper_rank_by: 'degree' as const,
};

export const NODE_TYPE_LABELS = {
  paper: 'Papers',
  author: 'Authors',
  institution: 'Institutions',
  location: 'Locations',
  topic: 'Topics'
} as const;

export const NETWORK_LAYOUT_CONFIG = {
  small: { maxNodes: 300, iterations: 200, solver: 'forceAtlas2Based' },
  medium: { maxNodes: 600, iterations: 150, solver: 'barnesHut' },
  large: { maxNodes: Infinity, iterations: 100, solver: 'barnesHut' }
} as const;

export const NODE_SIZE_RANGES = {
  paper: { min: 12, max: 40 },
  topic: { min: 14, max: 34 },
  author: { min: 13, max: 36 },
  institution: { min: 13, max: 36 },
  country: { min: 13, max: 36 },
  default: { min: 10, max: 30 }
} as const;

export const NODE_SIZING_OPTIONS = [
  { value: 'degree', label: 'Node Degree' },
  { value: 'citation', label: 'Citation Count' },
  { value: 'fixed', label: 'Fixed Size' }
] as const;

export const DEFAULT_NODE_SIZING = {
  method: 'degree' as const,
  minSize: 8,
  maxSize: 40,
  fixedSize: 20
} as const;
