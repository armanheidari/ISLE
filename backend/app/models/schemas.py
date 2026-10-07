from typing import List, Optional, Dict, Any, Tuple

from pydantic import BaseModel, Field


class PaperFilters(BaseModel):
    """Request model for filtering papers"""
    location: Optional[List[str]] = Field(None, description="Filter by institution names")
    author: Optional[List[str]] = Field(None, description="Filter by author names")
    country: Optional[List[str]] = Field(None, description="Filter by country names")
    year_range: Optional[Tuple[int, int]] = Field(None, description="Filter by year range (start_year, end_year)")
    max_nodes: Optional[int] = Field(100, description="Maximum number of nodes to display in network", ge=10, le=1000)


class AnalysisSettings(BaseModel):
    """Settings for analysis configuration"""
    model: str = Field("NMF", description="Topic model to use: NMF or BERT")
    max_papers_limit: int = Field(1000, description="Maximum number of papers to analyze", ge=100, le=50000)
    max_nodes_limit: int = Field(10000, description="Maximum number of nodes in network", ge=100, le=50000)
    max_edges_limit: int = Field(30000, description="Maximum number of edges in network", ge=100, le=100000)


class AnalysisQuery(BaseModel):
    """Request model for paper search and analysis"""
    query: Optional[str] = Field(None, description="Search query for papers")
    filters: Optional[PaperFilters] = Field(None, description="Optional filters to apply")
    settings: Optional[AnalysisSettings] = Field(None, description="Analysis configuration settings")


class DataStats(BaseModel):
    """Basic statistics about the analyzed papers"""
    num_papers: int
    num_authors: int
    num_institutions: int
    num_countries: int
    num_topics: int
    num_years: int


class RankedEntity(BaseModel):
    """Represents a top entity (author, country, institution, etc.) with count"""
    name: str
    count: int
    id: Optional[str] = None


class PaperEntity(BaseModel):
    """Represents a paper with detailed information"""
    name: str
    count: int
    id: Optional[str] = None
    authors: Optional[List[str]] = None
    year: Optional[int] = None


class WeightedTerm(BaseModel):
    """Word with weight for word cloud visualization"""
    word: str
    weight: float


class TopicTerms(BaseModel):
    """Topic word cloud data"""
    topic_id: str
    topic_label: str
    words: List[WeightedTerm]


class GraphNode(BaseModel):
    """Network node representation"""
    id: str
    label: str
    type: str
    size: Optional[int] = None
    color: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None


class GraphEdge(BaseModel):
    """Network edge representation"""
    source: str
    target: str
    weight: Optional[float] = None
    type: Optional[str] = None


class GraphData(BaseModel):
    """Network visualization data"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class TopicTrend(BaseModel):
    """Topic trend over time data"""
    topic_id: str
    topic_label: str
    yearly_counts: Dict[int, int]


class AnalysisResult(BaseModel):
    """Analysis result without heavy network computations"""
    basic_stats: DataStats
    most_cited_papers: List[PaperEntity]
    top_authors_by_papers: Optional[List[RankedEntity]] = None
    top_authors_by_citations: Optional[List[RankedEntity]] = None
    top_countries_by_papers: Optional[List[RankedEntity]] = None
    top_countries_by_citations: Optional[List[RankedEntity]] = None
    top_institutions_by_papers: Optional[List[RankedEntity]] = None
    top_institutions_by_citations: Optional[List[RankedEntity]] = None
    all_countries_by_papers: Optional[List[RankedEntity]] = None
    all_countries_by_citations: Optional[List[RankedEntity]] = None
    topic_distribution: Dict[str, int]
    topic_wordclouds: List[TopicTerms]
    topics_over_time: List[TopicTrend]
    active_filters: Dict[str, Any]
    session_id: str


class NetworkQuery(BaseModel):
    """Request for network analysis on existing session"""
    session_id: str = Field(..., description="Session ID from the basic analysis")
    network_type: str = Field(..., description="Type of network: 'complete', 'author_collaboration', or 'institution_collaboration'")
    filters: Optional[PaperFilters] = Field(None, description="Optional filters to apply to the network")


class LegacyAnalysisResult(BaseModel):
    """Complete analysis result containing all visualization data (legacy - now used for network results)"""
    basic_stats: DataStats
    most_cited_papers: List[RankedEntity]
    top_authors: List[RankedEntity]
    top_countries: List[RankedEntity]
    top_institutions: List[RankedEntity]
    topic_distribution: Dict[str, int]
    topic_wordclouds: List[TopicTerms]
    topics_over_time: List[TopicTrend]
    citation_network: GraphData
    author_collaboration_network: GraphData
    institution_collaboration_network: GraphData
    active_filters: Dict[str, Any]


class NetworkData(BaseModel):
    """Network analysis result"""
    session_id: str
    network_type: str
    network_data: GraphData
    applied_filters: Dict[str, Any]


class ApiError(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None


class NodeDetails(BaseModel):
    """Detailed information about a specific node"""
    id: str
    label: str
    type: str
    properties: Dict[str, Any]
    connections: int
    paper_details: Optional[Dict[str, Any]] = None
    author_details: Optional[Dict[str, Any]] = None
    country_details: Optional[Dict[str, Any]] = None
    institution_details: Optional[Dict[str, Any]] = None
    topic_details: Optional[Dict[str, Any]] = None


class ApiHealth(BaseModel):
    """Health check response"""
    status: str
    message: str