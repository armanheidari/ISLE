export interface PaperFilters {
  location?: string[];
  author?: string[];
  country?: string[];
  year_range?: [number, number];
  max_nodes?: number;
}

export interface AnalysisQuery {
  query?: string;
  filters?: PaperFilters;
  limit?: number;
  settings?: {
    model: 'NMF' | 'BERT';
    max_papers_limit: number;
    max_nodes_limit: number;
    max_edges_limit: number;
  };
}

export interface DataStats {
  num_papers: number;
  num_authors: number;
  num_institutions: number;
  num_countries: number;
  num_topics: number;
  num_years: number;
}

export interface RankedEntity {
  name: string;
  count: number;
  id?: string;
  country?: string;
}

export interface PaperEntity {
  name: string;
  count: number;
  id?: string;
  authors?: string[];
  year?: number;
}

export interface WeightedTerm {
  word: string;
  weight: number;
}

export interface TopicTerms {
  topic_id: string;
  topic_label: string;
  words: WeightedTerm[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  size?: number;
  color?: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TopicTrend {
  topic_id: string;
  topic_label: string;
  yearly_counts: Record<number, number>;
}

export interface AnalysisResult {
  basic_stats: DataStats;
  most_cited_papers: PaperEntity[];
  top_authors_by_papers?: RankedEntity[];
  top_authors_by_citations?: RankedEntity[];
  top_countries_by_papers?: RankedEntity[];
  top_countries_by_citations?: RankedEntity[];
  top_institutions_by_papers?: RankedEntity[];
  top_institutions_by_citations?: RankedEntity[];
  all_countries_by_papers?: RankedEntity[];
  all_countries_by_citations?: RankedEntity[];
  topic_distribution: Record<string, number>;
  topic_wordclouds: TopicTerms[];
  topics_over_time: TopicTrend[];
  active_filters: Record<string, any>;
  session_id: string;
}

export interface NetworkQuery {
  session_id: string;
  network_type: string;
  filters?: PaperFilters;
}

export interface NetworkData {
  session_id: string;
  network_type: string;
  network_data: GraphData;
  applied_filters: Record<string, any>;
}

export interface NodeDetails {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
  connections: number;
  paper_details?: Record<string, any>;
  author_details?: Record<string, any>;
  institution_details?: Record<string, any>;
  country_details?: Record<string, any>;
  topic_details?: Record<string, any>;
}

export interface ApiError {
  error: string;
  detail?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: undefined as any,
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        const base = errorData.error || 'Request failed';
        const detail = errorData.detail ? ` - ${errorData.detail}` : '';
        throw new Error(`API Error: ${base}${detail}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - The analysis is taking longer than expected. Please try with a smaller dataset.');
      }
      throw error;
    }
  }

  async searchAndAnalyze(query: AnalysisQuery): Promise<AnalysisResult> {
    return this.request<AnalysisResult>('/analysis/search', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async getNetworkData(query: NetworkQuery): Promise<NetworkData> {
    return this.request<NetworkData>('/analysis/network', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  async getNodeDetails(sessionId: string, nodeId: string): Promise<NodeDetails> {
    return this.request<NodeDetails>(`/analysis/node/${sessionId}/${nodeId}`);
  }

  async getSessionData(sessionId: string): Promise<AnalysisResult> {
    return this.request<AnalysisResult>(`/analysis/session/${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/analysis/session/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/analysis/health');
  }
}

export const api = new ApiClient();

export default api;