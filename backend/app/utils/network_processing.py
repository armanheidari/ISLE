"""
Network processing utilities for the ISLE API.
"""

import logging
from typing import Any, Dict, Optional, Set, Tuple

import networkx as nx

from app.core.constants import NODE_COLORS
from app.core.exceptions import DataProcessingError
from app.models.schemas import GraphData, GraphNode, GraphEdge

logger = logging.getLogger(__name__)


def stratified_sample_network(
    network: nx.Graph, 
    max_nodes: int
) -> nx.Graph:
    """
    Perform stratified sampling on a network to limit node count.
    
    Args:
        network: NetworkX graph to sample
        max_nodes: Maximum number of nodes to keep
        
    Returns:
        Sampled network with reduced node count
    """
    if len(network.nodes) <= max_nodes:
        return network
    
    try:
        type_to_nodes = {}
        for node_id in network.nodes():
            node_data = network.nodes.get(node_id, {})
            node_type = node_data.get('type', 'unknown') if isinstance(node_data, dict) else 'unknown'
            type_to_nodes.setdefault(node_type, []).append(node_id)
        
        types = list(type_to_nodes.keys())
        per_type = max(1, max_nodes // len(types))
        sampled_nodes = []
        
        for node_type in types:
            nodes = type_to_nodes[node_type]
            nodes_sorted = sorted(nodes, key=lambda n: network.degree(n), reverse=True)
            sampled_nodes.extend(nodes_sorted[:per_type])
        
        if len(sampled_nodes) < max_nodes:
            remaining = set(network.nodes()) - set(sampled_nodes)
            remaining_sorted = sorted(remaining, key=lambda n: network.degree(n), reverse=True)
            sampled_nodes.extend(remaining_sorted[:max_nodes - len(sampled_nodes)])
        
        sampled_network = network.subgraph(sampled_nodes).copy()
        logger.info(f"Stratified sampled network to {len(sampled_network.nodes)} nodes")
        
        return sampled_network
        
    except Exception as e:
        logger.warning(f"Error in stratified sampling: {e}")
        raise DataProcessingError("network_sampling", str(e))


def sample_edges_by_weight(
    network: nx.Graph, 
    max_edges: int
) -> nx.Graph:
    """
    Sample edges by weight to limit edge count.
    
    Args:
        network: NetworkX graph to sample
        max_edges: Maximum number of edges to keep
        
    Returns:
        Network with reduced edge count
    """
    if len(network.edges) <= max_edges:
        return network
    
    try:
        edges_with_weight = []
        for source, target, edge_data in network.edges(data=True):
            weight = 1.0
            if edge_data and isinstance(edge_data, dict) and 'weight' in edge_data:
                try:
                    weight = float(edge_data['weight'])
                except (ValueError, TypeError):
                    weight = 1.0
            edges_with_weight.append((source, target, edge_data, weight))
        
        edges_with_weight.sort(key=lambda x: x[3], reverse=True)
        top_edges = edges_with_weight[:max_edges]
        
        sampled_graph = nx.Graph()
        sampled_graph.add_nodes_from(network.nodes(data=True))
        
        for source, target, edge_data, _ in top_edges:
            sampled_graph.add_edge(source, target, **(edge_data if edge_data else {}))
        
        logger.info(f"Sampled edges to {len(sampled_graph.edges)}")
        return sampled_graph
        
    except Exception as e:
        logger.warning(f"Error sampling edges: {e}")
        raise DataProcessingError("edge_sampling", str(e))


def get_node_color(node_type: str) -> str:
    """
    Get color for a node based on its type.
    
    Args:
        node_type: Type of the node
        
    Returns:
        Hex color code for the node
    """
    return NODE_COLORS.get(node_type, NODE_COLORS['unknown'])


def process_network_node(
    node_id: Any, 
    network: nx.Graph, 
    processed_nodes: Set[str]
) -> Optional[GraphNode]:
    """
    Process a single network node into GraphNode format.
    
    Args:
        node_id: ID of the node to process
        network: NetworkX graph containing the node
        processed_nodes: Set of already processed node IDs
        
    Returns:
        GraphNode object or None if processing fails
    """
    try:
        str_node_id = str(node_id) if not isinstance(node_id, str) else node_id
        
        if str_node_id in processed_nodes:
            return None
        
        processed_nodes.add(str_node_id)
        
        node_data = network.nodes.get(node_id, {})
        if not isinstance(node_data, dict):
            node_data = {}
        
        label = str_node_id
        if 'name' in node_data:
            label = str(node_data['name'])
        elif 'title' in node_data and node_data.get('type') == 'paper':
            label = str(node_data['title'])
        elif 'label' in node_data:
            label = str(node_data['label'])
        
        node_type = node_data.get('type', 'unknown') if isinstance(node_data, dict) else 'unknown'
        
        return GraphNode(
            id=str_node_id,
            label=label,
            type=str(node_type),
            size=network.degree(node_id) + 5,
            color=get_node_color(str(node_type)),
            properties=node_data if isinstance(node_data, dict) else {}
        )
        
    except Exception as e:
        logger.warning(f"Error processing node {node_id}: {e}")
        return None


def process_network_edge(
    source: Any, 
    target: Any, 
    edge_data: Dict[str, Any], 
    network_type: str,
    processed_edges: Set[Tuple[str, str]],
    processed_nodes: Set[str]
) -> Optional[GraphEdge]:
    """
    Process a single network edge into GraphEdge format.
    
    Args:
        source: Source node ID
        target: Target node ID
        edge_data: Edge data dictionary
        network_type: Type of network
        processed_edges: Set of already processed edge keys
        processed_nodes: Set of processed node IDs
        
    Returns:
        GraphEdge object or None if processing fails
    """
    try:
        str_source = str(source) if not isinstance(source, str) else source
        str_target = str(target) if not isinstance(target, str) else target
        
        edge_key = (str_source, str_target)
        if edge_key in processed_edges:
            return None
        
        processed_edges.add(edge_key)
        
        if str_source not in processed_nodes or str_target not in processed_nodes:
            return None
        
        if edge_data is None:
            edge_data = {}
        elif not isinstance(edge_data, dict):
            edge_data = {}
        
        weight = 1.0
        if 'weight' in edge_data:
            try:
                weight = float(edge_data['weight'])
            except (ValueError, TypeError):
                weight = 1.0
        
        return GraphEdge(
            source=str_source,
            target=str_target,
            weight=weight,
            type=network_type
        )
        
    except Exception as e:
        logger.warning(f"Error processing edge {source}->{target}: {e}")
        return None


def convert_network_to_graph_data(
    network: nx.Graph, 
    network_type: str,
    max_nodes: int,
    max_edges: int
) -> GraphData:
    """
    Convert NetworkX graph to GraphData format.
    
    Args:
        network: NetworkX graph to convert
        network_type: Type of network for edge labeling
        
    Returns:
        GraphData object containing nodes and edges
    """
    try:
        logger.info(f"Converting {network_type} network with {len(network.nodes)} nodes and {len(network.edges)} edges")
        
        if len(network.nodes) == 0:
            logger.warning(f"Network {network_type} is empty")
            return GraphData(nodes=[], edges=[])
        
        if len(network.nodes) > max_nodes:
            network = stratified_sample_network(network, max_nodes)
        
        if len(network.edges) > max_edges:
            network = sample_edges_by_weight(network, max_edges)
        
        nodes = []
        processed_nodes = set()
        
        for node_id in network.nodes():
            node = process_network_node(node_id, network, processed_nodes)
            if node:
                nodes.append(node)
        
        edges = []
        processed_edges = set()
        
        for source, target, edge_data in network.edges(data=True):
            edge = process_network_edge(
                source, target, edge_data, network_type, 
                processed_edges, processed_nodes
            )
            if edge:
                edges.append(edge)
        
        logger.info(f"Converted network: {len(nodes)} nodes, {len(edges)} edges")
        return GraphData(nodes=nodes, edges=edges)
        
    except Exception as e:
        logger.error(f"Error converting network data: {e}")
        raise DataProcessingError("network_conversion", str(e))
