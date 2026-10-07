"""
Service for handling node details operations.
"""

import logging
from typing import Any, Dict, List, Optional

import pandas as pd
import networkx as nx

from app.utils.data_processing import (
    truncate_text,
    safe_literal_eval, 
    safe_int_conversion, 
    create_paper_summary,
    safe_float_conversion,
)
from app.core.exceptions import NodeNotFoundError, DataProcessingError
from app.core.constants import MAX_DETAILS_ITEMS, MAX_TITLE_PREVIEW_LENGTH

logger = logging.getLogger(__name__)


class NodeDetailsService:
    """Service for handling detailed node information retrieval."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def get_node_details(
        self, 
        session_id: str, 
        node_id: str, 
        graph: nx.Graph, 
        df: pd.DataFrame,
        citation_counts: Dict[str, Dict[str, int]]
    ) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific node.
        
        Args:
            session_id: ID of the analysis session
            node_id: ID of the node to get details for
            graph: NetworkX graph containing the node
            df: DataFrame containing paper data
            citation_counts: Precomputed citation counts
            
        Returns:
            Dictionary containing node details or None if not found
            
        Raises:
            NodeNotFoundError: If node is not found
        """
        try:
            resolved_node_id = self._resolve_node_id(node_id, graph)
            
            if resolved_node_id not in graph.nodes:
                raise NodeNotFoundError(session_id, node_id)
            
            node_data = graph.nodes[resolved_node_id]
            node_type = self._determine_node_type(node_id, node_data)
            
            self.logger.info(f"Processing node {resolved_node_id} of type {node_type}")
            
            connections = graph.degree(resolved_node_id)
            
            details = {
                "id": str(resolved_node_id),
                "label": self._get_node_label(node_data, resolved_node_id),
                "type": node_type,
                "properties": dict(node_data),
                "connections": connections,
                "paper_details": None,
                "author_details": None,
                "institution_details": None,
                "country_details": None,
                "topic_details": None
            }
            
            if node_type == 'paper':
                details["paper_details"] = self._get_paper_details(
                    str(resolved_node_id), df, graph
                )
            elif node_type == 'author':
                author_name = self._extract_entity_name(node_id, node_data, 'author')
                details["author_details"] = self._get_author_details(
                    author_name, df, graph, citation_counts
                )
            elif node_type == 'institution':
                institution_name = self._extract_entity_name(node_id, node_data, 'institution')
                details["institution_details"] = self._get_institution_details(
                    institution_name, df, graph, citation_counts
                )
            elif node_type == 'country':
                country_name = self._extract_entity_name(node_id, node_data, 'country')
                details["country_details"] = self._get_country_details(
                    country_name, df, graph, citation_counts
                )
            elif node_type == 'topic':
                details["topic_details"] = self._get_topic_details(
                    node_id, df, graph, node_data
                )
            
            return details
            
        except NodeNotFoundError:
            raise
        except Exception as e:
            self.logger.error(f"Error in get_node_details: {str(e)}")
            raise DataProcessingError("node_details_retrieval", str(e))
    
    def _resolve_node_id(self, node_id: str, graph: nx.Graph) -> str:
        """Resolve node ID by trying various formats."""
        if node_id in graph.nodes:
            return node_id
        
        candidates = []
        try:
            if node_id.startswith('paper_'):
                clean = node_id.replace('paper_', '')
                candidates.extend([clean, int(clean) if clean.isdigit() else None])
            elif node_id.isdigit():
                candidates.extend([f"paper_{node_id}", int(node_id)])
            else:
                candidates.extend([node_id])
        except Exception:
            pass
        
        candidates = [c for c in candidates if c is not None]
        
        for candidate in candidates:
            if candidate in graph.nodes:
                self.logger.info(f"Resolved node {node_id} to {candidate}")
                return candidate
        
        for node in graph.nodes:
            data = graph.nodes[node]
            if not isinstance(data, dict):
                continue
                
            for id_field in ['id', 'paper_id', 'original_id', 'index']:
                original_id = data.get(id_field)
                if original_id is not None:
                    original_id_str = str(original_id)
                    if (
                        original_id_str == node_id or 
                        original_id_str == str(node_id).replace('paper_', '') or
                        f"paper_{original_id_str}" == node_id
                    ):
                        return node
        
        return node_id
    
    def _determine_node_type(self, node_id: str, node_data: Dict[str, Any]) -> str:
        """Determine the type of a node."""
        node_type = node_data.get('type', 'unknown')
        
        if node_type == 'unknown':
            if node_id.startswith('paper_'):
                return 'paper'
            elif node_id.startswith('author_'):
                return 'author'
            elif node_id.startswith('institution_'):
                return 'institution'
            elif node_id.startswith('country_'):
                return 'country'
            elif node_id.isdigit():
                return 'paper'
        
        return node_type
    
    def _get_node_label(self, node_data: Dict[str, Any], node_id: str) -> str:
        """Get the display label for a node."""
        if 'name' in node_data:
            return str(node_data['name'])
        elif 'title' in node_data and node_data.get('type') == 'paper':
            return str(node_data['title'])
        elif 'label' in node_data:
            return str(node_data['label'])
        else:
            return str(node_id)
    
    def _extract_entity_name(self, node_id: str, node_data: Dict[str, Any], entity_type: str) -> str:
        """Extract entity name from node data or ID."""
        if 'name' in node_data:
            return node_data['name']
        
        if node_id.startswith(f'{entity_type}_'):
            return node_id.replace(f'{entity_type}_', '').replace('_', ' ')
        
        return node_id
    
    def _get_paper_details(self, paper_id: str, df: pd.DataFrame, graph: nx.Graph) -> Dict[str, Any]:
        """Get detailed information about a paper."""
        try:
            paper_row = self._find_paper_row(paper_id, df)
            
            if paper_row is None:
                return {"error": f"Paper {paper_id} not found in dataset"}
            
            authors = safe_literal_eval(paper_row['authors'])
            institutions = safe_literal_eval(paper_row['institution'])
            countries = safe_literal_eval(paper_row['country'])
            
            title = str(paper_row['title']) if pd.notna(paper_row['title']) else "Untitled"
            full_text = str(paper_row['text']) if pd.notna(paper_row['text']) else "Unavailable"
            
            return {
                "title": title,
                "abstaction": truncate_text(full_text, 500),
                "publication_date": str(paper_row['publication_date']) if pd.notna(paper_row['publication_date']) else None,
                "publication_year": safe_int_conversion(paper_row['publication_year']),
                "authors": authors if isinstance(authors, list) else [],
                "institutions": institutions if isinstance(institutions, list) else [],
                "countries": countries if isinstance(countries, list) else [],
                "citation_count": safe_int_conversion(paper_row['citation_count']),
                "topic": safe_int_conversion(paper_row.get('topic')) if 'topic' in paper_row else None,
                "connections_in_graph": graph.degree(paper_id)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting paper details: {e}")
            return {"error": f"Failed to get paper details: {str(e)}"}
    
    def _find_paper_row(self, paper_id: str, df: pd.DataFrame) -> Optional[pd.Series]:
        """Find the DataFrame row for a paper."""
        if 'id' in df.columns:
            clean_id = paper_id.replace('paper_', '')
            try:
                paper_idx = int(clean_id)
                paper_rows = df[df['id'] == paper_idx]
                if len(paper_rows) > 0:
                    return paper_rows.iloc[0]
            except (ValueError, TypeError):
                pass
        return None
    
    def _get_author_details(
        self, 
        author_name: str, 
        df: pd.DataFrame, 
        graph: nx.Graph, 
        citation_counts: Dict[str, Dict[str, int]]
    ) -> Dict[str, Any]:
        """Get detailed information about an author."""
        countries = set()
        institutions = set()
        author_papers = []
        graph_node = graph.nodes.get(author_name, {})
        total_citations = graph_node.get('total_citations', None)
        
        for idx, row in df.iterrows():
            try:
                paper_authors = safe_literal_eval(row['authors'])
                
                if isinstance(paper_authors, list) and author_name in paper_authors:
                    paper_id_value = row['id'] if 'id' in row and pd.notna(row['id']) else idx
                    author_papers.append(create_paper_summary(
                        paper_id_value,
                        row['title'],
                        safe_int_conversion(row['publication_year']),
                        safe_int_conversion(row['citation_count'])
                    ))
                    
                    institutions.update(safe_literal_eval(row['institution']))
                    countries.update(safe_literal_eval(row['country']))
                    
            except Exception as e:
                self.logger.warning(f"Error processing author row: {e}")
                continue
        
        if total_citations is None:
            total_citations = sum(paper.get("citations", 0) for paper in author_papers)
        
        sorted_papers = sorted(author_papers, key=lambda x: x.get("citations", 0), reverse=True)
        sorted_institutions = self._sort_entities_by_citations(
            list(institutions), citation_counts['institutions']
        )
        sorted_countries = self._sort_entities_by_citations(
            list(countries), citation_counts['countries']
        )
        
        return {
            "name": author_name,
            "paper_count": len(author_papers),
            "total_citations": total_citations,
            "average_citations": total_citations / len(author_papers) if author_papers else 0,
            "papers": sorted_papers[:MAX_DETAILS_ITEMS],
            "institutions": sorted_institutions[:MAX_DETAILS_ITEMS],
            "countries": sorted_countries[:MAX_DETAILS_ITEMS],
            "connections_in_graph": graph.degree(author_name) if author_name in graph.nodes else 0,
            "collaboration_count": len(list(graph.neighbors(author_name))) if author_name in graph.nodes else 0
        }
    
    def _get_institution_details(
        self, 
        institution_name: str, 
        df: pd.DataFrame, 
        graph: nx.Graph, 
        citation_counts: Dict[str, Dict[str, int]]
    ) -> Dict[str, Any]:
        """Get detailed information about an institution."""
        authors = set()
        countries = set()
        institution_papers = []
        graph_node = graph.nodes.get(institution_name, {})
        total_citations = graph_node.get('total_citations', None)
        
        for idx, row in df.iterrows():
            try:
                paper_institutions = safe_literal_eval(row['institution'])
                
                if isinstance(paper_institutions, list) and institution_name in paper_institutions:
                    paper_id_value = row['id'] if 'id' in row and pd.notna(row['id']) else idx
                    institution_papers.append(create_paper_summary(
                        paper_id_value,
                        row['title'],
                        safe_int_conversion(row['publication_year']),
                        safe_int_conversion(row['citation_count'])
                    ))
                    
                    authors.update(safe_literal_eval(row['authors']))
                    countries.update(safe_literal_eval(row['country']))
                    
            except Exception as e:
                self.logger.warning(f"Error processing institution row: {e}")
                continue
        
        if total_citations is None:
            total_citations = sum(paper.get("citations", 0) for paper in institution_papers)
        
        sorted_papers = sorted(institution_papers, key=lambda x: x.get("citations", 0), reverse=True)
        sorted_authors = self._sort_entities_by_citations(
            list(authors), citation_counts['authors']
        )
        sorted_countries = self._sort_entities_by_citations(
            list(countries), citation_counts['countries']
        )
        
        return {
            "name": institution_name,
            "paper_count": len(institution_papers),
            "total_citations": total_citations,
            "average_citations": total_citations / len(institution_papers) if institution_papers else 0,
            "papers": sorted_papers[:MAX_DETAILS_ITEMS],
            "authors": sorted_authors[:MAX_DETAILS_ITEMS],
            "countries": sorted_countries[:MAX_DETAILS_ITEMS],
            "connections_in_graph": graph.degree(institution_name) if institution_name in graph.nodes else 0,
            "collaboration_count": len(list(graph.neighbors(institution_name))) if institution_name in graph.nodes else 0
        }
    
    def _get_country_details(
        self, 
        country_name: str, 
        df: pd.DataFrame, 
        graph: nx.Graph, 
        citation_counts: Dict[str, Dict[str, int]]
    ) -> Dict[str, Any]:
        """Get detailed information about a country."""
        institutions = set()
        authors = set()
        country_papers = []
        graph_node = graph.nodes.get(country_name, {})
        total_citations = graph_node.get('total_citations', None)
        
        for idx, row in df.iterrows():
            try:
                paper_countries = safe_literal_eval(row['country'])
                
                if isinstance(paper_countries, list) and country_name in paper_countries:
                    paper_id_value = row['id'] if 'id' in row and pd.notna(row['id']) else idx
                    country_papers.append(create_paper_summary(
                        paper_id_value,
                        row['title'],
                        safe_int_conversion(row['publication_year']),
                        safe_int_conversion(row['citation_count'])
                    ))
                    
                    authors.update(safe_literal_eval(row['authors']))
                    institutions.update(safe_literal_eval(row['institution']))
                    
            except Exception as e:
                self.logger.warning(f"Error processing country row: {e}")
                continue
        
        if total_citations is None:
            total_citations = sum(paper.get("citations", 0) for paper in country_papers)
        
        sorted_papers = sorted(country_papers, key=lambda x: x.get("citations", 0), reverse=True)
        sorted_authors = self._sort_entities_by_citations(
            list(authors), citation_counts['authors']
        )
        sorted_institutions = self._sort_entities_by_citations(
            list(institutions), citation_counts['institutions']
        )
        
        return {
            "name": country_name,
            "paper_count": len(country_papers),
            "total_citations": total_citations,
            "average_citations": total_citations / len(country_papers) if country_papers else 0,
            "papers": sorted_papers[:MAX_DETAILS_ITEMS],
            "authors": sorted_authors[:MAX_DETAILS_ITEMS],
            "institutions": sorted_institutions[:MAX_DETAILS_ITEMS],
            "connections_in_graph": graph.degree(country_name) if country_name in graph.nodes else 0,
            "collaboration_count": len(list(graph.neighbors(country_name))) if country_name in graph.nodes else 0
        }
    
    def _get_topic_details(
        self, 
        topic_node_id: str, 
        df: pd.DataFrame, 
        graph: nx.Graph, 
        node_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get detailed information about a topic."""
        topic_number = self._extract_topic_number(topic_node_id, node_data)
        name = node_data.get('name') if isinstance(node_data, dict) else None
        keywords = node_data.get('keywords') if isinstance(node_data, dict) else []
        count = node_data.get('count') if isinstance(node_data, dict) else None
        
        topic_papers = []
        authors = set()
        institutions = set()
        countries = set()
        
        graph_node = graph.nodes.get(topic_node_id, {})
        total_citations = graph_node.get('total_citations', None)
        
        for idx, row in df.iterrows():
            try:
                row_topic = row.get('topic', None)
                if not self._matches_topic(row_topic, topic_number):
                    continue
                
                probability = self._extract_topic_probability(row, topic_number)
                paper_title = row.get('title', '') or ''
                paper_id_value = row['id'] if 'id' in row and pd.notna(row['id']) else idx
                
                topic_papers.append({
                    "id": str(int(paper_id_value)) if pd.notna(paper_id_value) else str(idx),
                    "title": truncate_text(paper_title, MAX_TITLE_PREVIEW_LENGTH),
                    "year": safe_int_conversion(row['publication_year']),
                    "citations": safe_int_conversion(row['citation_count']),
                    "probability": probability,
                })
                
                authors.update(safe_literal_eval(row.get('authors')))
                institutions.update(safe_literal_eval(row.get('institution')))
                countries.update(safe_literal_eval(row.get('country')))
                
            except Exception as e:
                self.logger.warning(f"Error processing topic row: {e}")
                continue
        
        if total_citations is None:
            total_citations = sum(paper.get('citations', 0) for paper in topic_papers)
        
        try:
            top_papers = sorted(
                topic_papers, 
                key=lambda x: (x.get('citations', 0), x.get('probability') or 0), 
                reverse=True
            )[:10]
        except Exception:
            top_papers = topic_papers[:10]
        
        return {
            "topic_id": topic_node_id,
            "topic_number": int(topic_number) if topic_number is not None else None,
            "name": name or (f"Topic {topic_number}" if topic_number is not None else None),
            "keywords": keywords or [],
            "count": int(count) if count is not None else len(topic_papers),
            "paper_count": len(topic_papers),
            "top_papers": top_papers,
            "connected_authors": list(authors)[:MAX_DETAILS_ITEMS],
            "connected_institutions": list(institutions)[:MAX_DETAILS_ITEMS],
            "connected_countries": list(countries)[:MAX_DETAILS_ITEMS],
            "connections_in_graph": graph.degree(topic_node_id) if topic_node_id in graph.nodes else 0,
            "collaboration_count": len(list(graph.neighbors(topic_node_id))) if topic_node_id in graph.nodes else 0
        }
    
    def _extract_topic_number(self, topic_node_id: str, node_data: Dict[str, Any]) -> Optional[int]:
        """Extract topic number from node ID or data."""
        try:
            if isinstance(node_data, dict):
                topic_number = node_data.get('topic_number', None)
                if topic_number is not None:
                    return topic_number
            
            if isinstance(topic_node_id, str) and topic_node_id.startswith('topic_'):
                return int(topic_node_id.split('_', 1)[1])
        except Exception:
            pass
        return None
    
    def _matches_topic(self, row_topic: Any, topic_number: Optional[int]) -> bool:
        """Check if a row's topic matches the target topic number."""
        if row_topic is None or topic_number is None:
            return False
        
        try:
            if isinstance(row_topic, (list, tuple)):
                return topic_number in row_topic
            else:
                return int(row_topic) == int(topic_number)
        except Exception:
            return False
    
    def _extract_topic_probability(self, row: pd.Series, topic_number: Optional[int]) -> Optional[float]:
        """Extract topic probability from row data."""
        if topic_number is None:
            return None
        
        for col in ['probability', 'topic_probability', 'topic_prob', f'topic_{topic_number}_prob']:
            if col in row.index:
                return safe_float_conversion(row.get(col))
        return None
    
    def _sort_entities_by_citations(
        self, 
        entities: List[str], 
        citation_counts: Dict[str, int]
    ) -> List[str]:
        """Sort entities by their citation counts."""
        return sorted(entities, key=lambda x: citation_counts.get(x, 0), reverse=True)
