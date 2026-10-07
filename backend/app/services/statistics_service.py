"""
Service for handling statistics and analysis operations.
"""

import logging
from typing import Dict, List, Any

import pandas as pd

from app.core.exceptions import DataProcessingError
from app.core.constants import MAX_DETAILS_ITEMS, MAX_WORDCLOUD_WORDS
from app.utils.data_processing import aggregate_citations_from_list_column
from app.models.schemas import DataStats, RankedEntity, PaperEntity, TopicTerms, TopicTrend, WeightedTerm

logger = logging.getLogger(__name__)


class StatisticsService:
    """Service for handling statistics and analysis operations."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def extract_basic_statistics(
        self, 
        analyzer: Any, 
        df: pd.DataFrame
    ) -> DataStats:
        """
        Extract basic statistics from the analyzer and dataset.
        
        Args:
            analyzer: Graph analyzer instance
            df: DataFrame containing paper data
            
        Returns:
            DataStats object containing basic statistics
        """
        try:
            basic_stats_raw = analyzer.get_basic_stats()
            return DataStats(**basic_stats_raw)
        except Exception as e:
            self.logger.error(f"Error extracting basic statistics: {e}")
            raise DataProcessingError("basic_statistics_extraction", str(e))
    
    def extract_most_cited_papers(self, analyzer: Any) -> List[PaperEntity]:
        """
        Extract most cited papers from the analyzer.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            List of PaperEntity objects
        """
        try:
            most_cited_raw = analyzer.get_most_cited_papers()
            most_cited = []
            
            for item in most_cited_raw:
                node_id, title, count, authors, year = item
                
                most_cited.append(
                    PaperEntity(
                        name=title,
                        count=count,
                        id=node_id,
                        authors=authors if authors else None,
                        year=year
                    )
                )
            
            return most_cited
            
        except Exception as e:
            self.logger.error(f"Error extracting most cited papers: {e}")
            raise DataProcessingError("most_cited_papers_extraction", str(e))
    
    def extract_top_entities_by_papers(self, analyzer: Any) -> Dict[str, List[RankedEntity]]:
        """
        Extract top entities by paper count.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            Dictionary containing top entities by category
        """
        try:
            return {
                "authors": [RankedEntity(name=name, count=count) for name, count in analyzer.get_top_authors()],
                "countries": [RankedEntity(name=name, count=count) for name, count in analyzer.get_top_countries()],
                "institutions": [RankedEntity(name=name, count=count) for name, count in analyzer.get_top_institutions()]
            }
        except Exception as e:
            self.logger.error(f"Error extracting top entities by papers: {e}")
            raise DataProcessingError("top_entities_by_papers_extraction", str(e))
    
    def extract_top_entities_by_citations(
        self, 
        analyzer: Any
    ) -> Dict[str, List[RankedEntity]]:
        """
        Extract top entities by citation count using the analyzer.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            Dictionary containing top entities by citation count
        """
        try:
            return {
                "authors": [RankedEntity(name=name, count=count) for name, count in analyzer.get_top_authors(top_n=MAX_DETAILS_ITEMS, by='citations')],
                "countries": [RankedEntity(name=name, count=count) for name, count in analyzer.get_top_countries(top_n=MAX_DETAILS_ITEMS, by='citations')],
                "institutions": [RankedEntity(name=name, count=count) for name, count in analyzer.get_top_institutions(top_n=MAX_DETAILS_ITEMS, by='citations')]
            }
        except Exception as e:
            self.logger.error(f"Error extracting top entities by citations: {e}")
            raise DataProcessingError("top_entities_by_citations_extraction", str(e))
    
    def extract_all_countries_for_map(
        self, 
        analyzer: Any
    ) -> Dict[str, List[RankedEntity]]:
        """
        Extract all countries for world map visualization.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            Dictionary containing all countries by papers and citations
        """
        try:
            all_countries_papers = analyzer.get_top_countries(top_n=10000, by='paper')
            all_countries_citations = analyzer.get_top_countries(top_n=10000, by='citations')
            
            return {
                "countries_by_papers": [RankedEntity(name=name, count=count) for name, count in all_countries_papers],
                "countries_by_citations": [RankedEntity(name=name, count=count) for name, count in all_countries_citations]
            }
        except Exception as e:
            self.logger.error(f"Error extracting all countries for map: {e}")
            raise DataProcessingError("all_countries_for_map_extraction", str(e))
    
    def extract_topic_distribution(self, analyzer: Any) -> Dict[str, int]:
        """
        Extract topic distribution from the analyzer.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            Dictionary mapping topic IDs to counts
        """
        try:
            return analyzer.get_topic_distribution()
        except Exception as e:
            self.logger.error(f"Error extracting topic distribution: {e}")
            raise DataProcessingError("topic_distribution_extraction", str(e))
    
    def extract_topic_wordclouds(self, analyzer: Any) -> List[TopicTerms]:
        """
        Extract topic wordcloud data from the analyzer.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            List of TopicTerms objects
        """
        try:
            wordclouds_raw = analyzer.get_topic_wordcloud_data(max_words=MAX_WORDCLOUD_WORDS)
            result = []
            
            for item in wordclouds_raw:
                topic_id = item['topic_id']
                
                if isinstance(topic_id, str) and topic_id.startswith('topic_'):
                    clean_topic_id = topic_id.replace('topic_', '')
                else:
                    clean_topic_id = str(topic_id)
                
                result.append(
                    TopicTerms(
                        topic_id=str(clean_topic_id),
                        topic_label=item['topic_label'],
                        words=[WeightedTerm(word=w['word'], weight=w['weight']) for w in item['words']]
                    )
                )
            
            return result
            
        except Exception as e:
            self.logger.warning(f"Error getting wordcloud data: {e}")
            return []
    
    def extract_topic_trends(self, analyzer: Any) -> List[TopicTrend]:
        """
        Extract topic trends over time from the analyzer.
        
        Args:
            analyzer: Graph analyzer instance
            
        Returns:
            List of TopicTrend objects
        """
        try:
            trends_raw = analyzer.get_topics_trend_over_time()
            trends = []
            
            for topic_id, yearly_counts in trends_raw.items():
                clean_topic_id = topic_id.replace('topic_', '')
                
                topic_node_data = analyzer.G.nodes.get(topic_id, {})
                keywords = topic_node_data.get('keywords', [])
                
                if keywords and len(keywords) > 0:
                    topic_words = keywords[:3]
                    topic_label = f"{', '.join(topic_words)}"
                else:
                    topic_label = f"Topic {clean_topic_id}"
                
                trends.append(
                    TopicTrend(
                        topic_id=str(clean_topic_id),
                        topic_label=topic_label,
                        yearly_counts=yearly_counts
                    )
                )
            
            return trends
            
        except Exception as e:
            self.logger.warning(f"Error getting topic trends: {e}")
            return []
    
    def precompute_citation_counts(self, df: pd.DataFrame) -> Dict[str, Dict[str, int]]:
        """
        Precompute citation counts for all authors, institutions, and countries.
        
        Args:
            df: DataFrame containing paper data
            
        Returns:
            Dictionary containing citation counts by entity type
        """
        try:
            return {
                'authors': aggregate_citations_from_list_column(df, 'authors'),
                'institutions': aggregate_citations_from_list_column(df, 'institution'),
                'countries': aggregate_citations_from_list_column(df, 'country')
            }
        except Exception as e:
            self.logger.error(f"Error precomputing citation counts: {e}")
            raise DataProcessingError("citation_counts_precomputation", str(e))
    
