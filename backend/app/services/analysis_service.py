import os
import sys
import uuid
import logging
from typing import Any, Dict, Optional

import pandas as pd

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from app.core.exceptions import (
    AnalysisError,
    NodeNotFoundError,
    SessionNotFoundError,
    InvalidNetworkTypeError,
)
from app.core.constants import NETWORK_TYPES
from app.services.elastic_services import HybridSearchEngine
from app.services.statistics_service import StatisticsService
from app.services.node_details_service import NodeDetailsService
from app.utils.network_processing import convert_network_to_graph_data
from app.models.schemas import AnalysisResult, NetworkData, NetworkQuery, PaperFilters, AnalysisSettings

from src.isle import ISLE
from src.config.default import BERT_CONFIG_DEFAULT, NMF_CONFIG_DEFAULT

logger = logging.getLogger(__name__)


class AnalysisSession:
    """Represents an analysis session with cached analyzer and data."""
    
    def __init__(
        self, 
        session_id: str, 
        isle: ISLE, 
        analyzer: Any, 
        df: pd.DataFrame, 
        query: Optional[str],
        settings: Optional[AnalysisSettings] = None
    ) -> None:
        """
        Initialize an analysis session.
        
        Args:
            session_id: Unique identifier for the session
            isle: ISLE instance for analysis
            analyzer: Graph analyzer instance
            df: DataFrame containing paper data
            query: Original search query
            settings: Analysis settings used for this session
        """
        self.query = query
        self.original_df = df
        self.isle = isle
        self.analyzer = analyzer
        self.settings = settings
        self.session_id = session_id
        self.created_filters: Dict[str, Any] = {}
        self.citation_counts: Optional[Dict[str, Dict[str, int]]] = None


class AnalysisService:
    """
    Service class for handling paper analysis operations.
    
    This service manages analysis sessions, coordinates between different
    analysis components, and provides a unified interface for paper analysis
    and network generation operations.
    """
    
    def __init__(self) -> None:
        """
        Initialize the analysis service.
        
        Sets up internal services and session storage.
        """
        self._sessions: Dict[str, AnalysisSession] = {}
        self._statistics_service = StatisticsService()
        self._node_details_service = NodeDetailsService()
        self._search_engine = HybridSearchEngine()
    
    def _create_session_id(self) -> str:
        """
        Generate a unique session ID.
        
        Returns:
            A unique UUID string for the session
        """
        return str(uuid.uuid4())
    
    def _init_session(self, query: Optional[str], df: pd.DataFrame, settings: Optional[AnalysisSettings] = None) -> AnalysisSession:
        """
        Create a new analysis session with ISLE analyzer.
        
        Args:
            query: Search query for the analysis
            df: DataFrame with paper data from elastic search
            settings: Optional analysis settings for dynamic configuration
            
        Returns:
            AnalysisSession object containing the initialized analyzer and data
            
        Raises:
            AnalysisError: If session initialization fails
        """
        try:
            query_display = query if query else "no query"
            logger.info(f"Creating new analysis session for query: '{query_display}' with {len(df)} papers")

            model_type = settings.model.lower() if settings else 'nmf'
                       
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            
            corpus = df['text'].tolist()
        
            if model_type == 'bert':
                config = BERT_CONFIG_DEFAULT
                topic_model_type = 'bert'

            else:
                config = NMF_CONFIG_DEFAULT
                topic_model_type = 'nmf'
                
            isle = ISLE(
                config=config, 
                topic_model_type=topic_model_type
            )
            
            isle.load_data(df)
            isle.build_topic_model(corpus)
            isle.build_knowledge_graph()
            isle.build_graph_analyzer()
            
            session_id = self._create_session_id()
            analyzer = isle.get_graph_analyzer()
            
            session = AnalysisSession(session_id, isle, analyzer, df, query, settings)
            
            logger.info("Precomputing citation counts...")
            session.citation_counts = self._statistics_service.precompute_citation_counts(df)
            logger.info(
                f"Precomputed citations for {len(session.citation_counts['authors'])} authors, "
                f"{len(session.citation_counts['institutions'])} institutions, "
                f"{len(session.citation_counts['countries'])} countries"
            )
            
            self._sessions[session_id] = session
            
            logger.info(f"Analysis session {session_id} created successfully")
            return session
            
        except Exception as e:
            logger.error(f"Error creating analysis session: {str(e)}")
            raise AnalysisError("session_initialization", str(e))
    
    def analyze_papers(
        self, 
        query: Optional[str], 
        filters: Optional[PaperFilters] = None, 
        settings: Optional[AnalysisSettings] = None
    ) -> AnalysisResult:
        """
        Phase 1: Search papers, build topic model and knowledge graph, return basic analysis.
        
        This method performs comprehensive analysis including topic modeling, knowledge graph 
        building, and basic visualizations (wordclouds, topic distribution, trends).
        Networks are NOT included in this response for performance. Use the separate
        network endpoints with the returned session_id.
        
        Args:
            query: Search query for papers
            filters: Optional filters to apply to the analysis
            settings: Optional analysis settings for dynamic configuration
            
        Returns:
            AnalysisResult containing basic statistics, top entities, topic information,
            and session ID for subsequent network analysis
            
        Raises:
            AnalysisError: If analysis fails
        """
        try:
            search_df = self._search_engine.search(
                query_text=query,
                filters=filters,
                size=settings.max_papers_limit,
                use_hybrid=True,
                semantic_size=settings.max_papers_limit,
                bm25_size=settings.max_papers_limit
            )
            
            if search_df.empty:
                logger.warning(f"No papers found for query: '{query}' with filters: {filters}")

            session = self._init_session(query, search_df, settings=settings)

            analyzer = session.analyzer

            if filters:
                filters.year_range = filters.year_range
                filters.location = None
                filters.author = None
                filters.country = None
                
                self._apply_filters(analyzer, filters)
                session.created_filters = filters.model_dump() if filters else {}

            return self._extract_statistics(session, query, filters)
            
        except AnalysisError:
            raise
        except Exception as e:
            logger.error(f"Error in search and analysis: {str(e)}")
            raise AnalysisError("paper_analysis", str(e))
    
    def build_network(self, request: NetworkQuery) -> NetworkData:
        """
        Phase 2: Get specific network analysis for an existing session.
        
        This method allows on-demand computation of networks with optional filters.
        Available network types:
        - 'complete': Citation network between papers
        - 'author_collaboration': Collaboration network between authors
        - 'institution_collaboration': Collaboration network between institutions
        - 'country_collaboration': Collaboration network between countries
        
        Args:
            request: NetworkQuery containing session_id, network_type, and optional filters
            
        Returns:
            NetworkData containing the generated network and metadata
            
        Raises:
            SessionNotFoundError: If session is not found or expired
            InvalidNetworkTypeError: If network type is not supported
            AnalysisError: If network generation fails
        """
        try:
            session = self._sessions.get(request.session_id)
            if not session:
                raise SessionNotFoundError(request.session_id)
            
            analyzer = session.analyzer

            applied_filters = {}
            analyzer.reset_filter()
            
            if request.filters:
                self._apply_filters(analyzer, request.filters)
                applied_filters = request.filters.model_dump()
            
            network = self._generate_network(analyzer, request.network_type)
            
            network_data = convert_network_to_graph_data(
                network, 
                request.network_type,
                session.settings.max_nodes_limit, 
                session.settings.max_edges_limit
            )
            
            logger.info(f"Generated {request.network_type} network for session {request.session_id}")
            
            return NetworkData(
                session_id=request.session_id,
                network_type=request.network_type,
                network_data=network_data,
                applied_filters=applied_filters
            )
            
        except (SessionNotFoundError, InvalidNetworkTypeError):
            raise
        except Exception as e:
            logger.error(f"Error in network analysis: {str(e)}")
            raise AnalysisError("network_analysis", str(e))

    def _generate_network(self, analyzer: Any, network_type: str) -> Any:
        """
        Generate network based on type.
        
        Args:
            analyzer: Graph analyzer instance
            network_type: Type of network to generate
            
        Returns:
            NetworkX graph object
            
        Raises:
            InvalidNetworkTypeError: If network type is not supported
        """
        if network_type == NETWORK_TYPES["COMPLETE"]:
            logger.info("Generating complete network...")
            network = analyzer.get_complete_network()
            logger.info(f"Citation network: {len(network.nodes)} nodes, {len(network.edges)} edges")
            
        elif network_type == NETWORK_TYPES["AUTHOR_COLLABORATION"]:
            logger.info("Generating author collaboration network...")
            network = analyzer.get_author_collaboration_network()
            logger.info(f"Author collaboration network: {len(network.nodes)} nodes, {len(network.edges)} edges")
            
        elif network_type == NETWORK_TYPES["INSTITUTION_COLLABORATION"]:
            logger.info("Generating institution collaboration network...")
            network = analyzer.get_institution_collaboration_network()
            logger.info(f"Institution collaboration network: {len(network.nodes)} nodes, {len(network.edges)} edges")
            
        elif network_type == NETWORK_TYPES["COUNTRY_COLLABORATION"]:
            logger.info("Generating country collaboration network...")
            network = analyzer.get_country_collaboration_network()
            logger.info(f"Country collaboration network: {len(network.nodes)} nodes, {len(network.edges)} edges")
            
        else:
            raise InvalidNetworkTypeError(network_type)
        
        return network

    def _apply_filters(self, analyzer: Any, filters: PaperFilters) -> None:
        """
        Apply filters to the analyzer.
        
        Args:
            analyzer: Graph analyzer instance
            filters: PaperFilters object containing filter criteria
        """
        filter_dict = {}
        
        if filters.location:
            filter_dict['location'] = filters.location
            
        if filters.author:
            filter_dict['author'] = filters.author
            
        if filters.country:
            filter_dict['country'] = filters.country
            
        if filters.year_range:
            filter_dict['year_range'] = filters.year_range
            
        if filter_dict:
            analyzer.filter_graph(**filter_dict)
    
    def _extract_statistics(
        self, 
        session: AnalysisSession, 
        query: Optional[str], 
        filters: Optional[PaperFilters]
    ) -> AnalysisResult:
        """
        Perform basic analysis without heavy network computations.
        
        Args:
            session: Analysis session containing analyzer and data
            query: Original search query
            filters: Optional filters applied to the analysis
            
        Returns:
            AnalysisResult containing basic statistics and analysis data
            
        Raises:
            AnalysisError: If statistics extraction fails
        """
        try:
            analyzer = session.analyzer
            df = session.original_df

            basic_stats = self._statistics_service.extract_basic_statistics(analyzer, df)
            most_cited = self._statistics_service.extract_most_cited_papers(analyzer)
        
            top_entities_by_papers = self._statistics_service.extract_top_entities_by_papers(analyzer)
            top_entities_by_citations = self._statistics_service.extract_top_entities_by_citations(analyzer)
            all_countries_data = self._statistics_service.extract_all_countries_for_map(analyzer)

            topic_distribution = self._statistics_service.extract_topic_distribution(analyzer)
            topic_wordclouds = self._statistics_service.extract_topic_wordclouds(analyzer)
            topics_over_time = self._statistics_service.extract_topic_trends(analyzer)

            active_filters = analyzer.get_active_filters()
            
            return AnalysisResult(
                basic_stats=basic_stats,
                most_cited_papers=most_cited,
                top_authors_by_papers=top_entities_by_papers["authors"],
                top_authors_by_citations=top_entities_by_citations["authors"],
                top_countries_by_papers=top_entities_by_papers["countries"],
                top_countries_by_citations=top_entities_by_citations["countries"],
                top_institutions_by_papers=top_entities_by_papers["institutions"],
                top_institutions_by_citations=top_entities_by_citations["institutions"],
                all_countries_by_papers=all_countries_data["countries_by_papers"],
                all_countries_by_citations=all_countries_data["countries_by_citations"],
                topic_distribution=topic_distribution,
                topic_wordclouds=topic_wordclouds,
                topics_over_time=topics_over_time,
                active_filters=active_filters,
                session_id=session.session_id
            )
            
        except Exception as e:
            logger.error(f"Error extracting statistics: {str(e)}")
            raise AnalysisError("statistics_extraction", str(e))
    
    
    
    def session_info(self, session_id: str) -> Dict[str, Any]:
        """
        Get information about an analysis session.
        
        Args:
            session_id: ID of the session to get information for
            
        Returns:
            Dictionary containing session information or not found status
        """
        session = self._sessions.get(session_id)
    
        if not session:
            return {"status": "not_found", "session_id": session_id}
        
        return {
            "status": "active",
            "session_id": session_id,
            "query": session.query,
            "dataset_size": len(session.original_df),
            "created_filters": session.created_filters
        }
    
    def remove_session(self, session_id: str) -> bool:
        """
        Clean up a session to free memory.
        
        Args:
            session_id: ID of the session to remove
            
        Returns:
            True if session was removed, False if not found
        """
        if session_id in self._sessions:
            del self._sessions[session_id]
            logger.info(f"Cleaned up session {session_id}")
            return True
    
        return False
    
    def get_node_details(self, session_id: str, node_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific node.
        
        Args:
            session_id: ID of the analysis session
            node_id: ID of the node to get details for
            
        Returns:
            Dictionary containing detailed node information or None if not found
            
        Raises:
            SessionNotFoundError: If session is not found or expired
            NodeNotFoundError: If node is not found in the session
            AnalysisError: If node details retrieval fails
        """
        try:
            session = self._sessions.get(session_id)
            if not session:
                raise SessionNotFoundError(session_id)
            
            analyzer = session.analyzer
            df = session.original_df
            graph = analyzer.G

            return self._node_details_service.get_node_details(
                session_id, node_id, graph, df, session.citation_counts
            )
            
        except (SessionNotFoundError, NodeNotFoundError):
            raise
        except Exception as e:
            logger.error(f"Error in get_node_details: {str(e)}")
            raise AnalysisError("node_details_retrieval", str(e))
    
    def health_check(self) -> Dict[str, Any]:
        """
        Get health status of the service.
        
        Returns:
            Dictionary containing service health status and session information
        """
        try:
            return {
                "status": "healthy",
                "active_sessions": len(self._sessions),
                "session_ids": list(self._sessions.keys())
            }
    
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }