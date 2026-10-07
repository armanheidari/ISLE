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
  paper_details?: PaperDetails;
  author_details?: AuthorDetails;
  institution_details?: InstitutionDetails;
  country_details?: CountryDetails;
  topic_details?: TopicDetails;
}

export interface PaperDetails {
  title: string;
  abstaction?: string;
  citation_count: number;
  authors?: string[];
  institutions?: string[];
  countries?: string[];
  publication_year?: number;
}

export interface AuthorDetails {
  paper_count: number;
  total_citations: number;
  average_citations: number;
  countries?: string[];
  institutions?: string[];
  papers?: Paper[];
}

export interface InstitutionDetails {
  paper_count: number;
  total_citations: number;
  average_citations: number;
  countries?: string[];
  authors?: string[];
  papers?: Paper[];
}

export interface CountryDetails {
  paper_count: number;
  total_citations: number;
  average_citations: number;
  institutions?: string[];
  authors?: string[];
  papers?: Paper[];
}

export interface TopicDetails {
  name?: string;
  topic_id: string;
  keywords?: string[];
  paper_count: number;
  connections_in_graph: number;
  top_papers?: Paper[];
  connected_authors?: string[];
  connected_institutions?: string[];
  connected_countries?: string[];
}

export interface Paper {
  id?: string;
  title: string;
  year?: number;
  citations: number;
}

export interface SidePanelProps {
  isOpen: boolean;
  selectedNode: SelectedNode | null;
  detailedNodeInfo: DetailedNodeInfo | null;
  onClose: () => void;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export type NodeType = 'paper' | 'author' | 'institution' | 'country' | 'keyword' | 'topic';

export interface NodeTypeConfig {
  color: string;
  bgColor: string;
  label: string;
}
