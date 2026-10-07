import logging

from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import (
    NetworkData, 
    NodeDetails,
    NetworkQuery, 
    AnalysisQuery, 
    AnalysisResult
)
from app.core.exceptions import (
    AnalysisError,
    NodeNotFoundError,
    SessionNotFoundError,
    InvalidNetworkTypeError
)
from app.core.constants import ERROR_MESSAGES
from app.core.dependencies import analysis_service
from app.services.analysis_service import AnalysisService


router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])
logger = logging.getLogger(__name__)


@router.post("/search", response_model=AnalysisResult)
async def analyze_papers(
    request: AnalysisQuery,
    analysis_service: AnalysisService = Depends(analysis_service)
):
    """
    Phase 1: Search for papers and perform basic analysis.
    
    This endpoint accepts a search query and optional filters, then performs
    comprehensive analysis including topic modeling, knowledge graph building,
    and basic visualizations (wordclouds, topic distribution, trends).
    
    Networks are NOT included in this response for performance. Use the separate
    network endpoints with the returned session_id.
    
    Returns:
    - Basic statistics and top entities
    - Topic wordclouds and distribution
    - Topics over time
    - Session ID for subsequent network analysis
    """
    try:
        query_display = request.query if request.query else "no query"
        logger.info(f"Received search request: query='{query_display}', filters='{request.filters}', settings='{request.settings}'")
        
        result = analysis_service.analyze_papers(
            query=request.query,
            filters=request.filters,
            settings=request.settings
        )
        
        logger.info(f"Basic analysis completed successfully. Found {result.basic_stats.num_papers} papers. Session: {result.session_id}")
        return result
        
    except AnalysisError as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    except Exception as e:
        logger.error(f"Unexpected error in search and analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=ERROR_MESSAGES["ANALYSIS_FAILED"])


@router.post("/network", response_model=NetworkData)
async def build_network(
    request: NetworkQuery,
    analysis_service: AnalysisService = Depends(analysis_service)
):
    """
    Phase 2: Get specific network analysis for an existing session.
    
    This endpoint allows you to generate network visualizations on-demand
    with optional filters. Available network types:
    - 'complete': Citation network between papers
    - 'author_collaboration': Collaboration network between authors
    - 'institution_collaboration': Collaboration network between institutions
    - 'country_collaboration': Collaboration network between countries
    
    You must first call /search to get a session_id, then use that session_id
    to request specific networks.
    """
    try:
        logger.info(f"Received network analysis request: session={request.session_id}, type={request.network_type}")
        
        result = analysis_service.build_network(request)
        
        logger.info(f"Network analysis completed: {result.network_type} with {len(result.network_data.nodes)} nodes")
        return result
        
    except (SessionNotFoundError, InvalidNetworkTypeError) as e:
        logger.error(f"Validation error in network analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    except AnalysisError as e:
        logger.error(f"Analysis error in network analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Network analysis failed: {str(e)}")
    
    except Exception as e:
        logger.error(f"Unexpected error in network analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=ERROR_MESSAGES["NETWORK_ANALYSIS_FAILED"])


@router.get("/session/{session_id}")
async def session_info(
    session_id: str,
    analysis_service: AnalysisService = Depends(analysis_service)
):
    """
    Get information about an analysis session.
    """
    try:
        info = analysis_service.session_info(session_id)
        
        if info["status"] == "not_found":
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return info
        
    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error getting session info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def remove_session(
    session_id: str,
    analysis_service: AnalysisService = Depends(analysis_service)
):
    """
    Clean up a session to free memory.
    """
    try:
        success = analysis_service.remove_session(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return {"message": f"Session {session_id} cleaned up successfully"}
        
    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error cleaning up session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/node/{session_id}/{node_id}", response_model=NodeDetails)
async def get_node_details(
    session_id: str,
    node_id: str,
    analysis_service: AnalysisService = Depends(analysis_service)
):
    """
    Get detailed information about a specific node in the knowledge graph.
    
    This endpoint provides comprehensive details about papers, authors, or institutions
    including all available metadata, relationships, and derived statistics.
    """
    try:
        logger.info(f"Received node details request: session={session_id}, node={node_id}")
        
        result = analysis_service.get_node_details(session_id, node_id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found in session {session_id}")
        
        logger.info(f"Node details retrieved successfully for {node_id}")
        return result
        
    except (SessionNotFoundError, NodeNotFoundError) as e:
        logger.error(f"Node not found error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))

    except AnalysisError as e:
        logger.error(f"Analysis error in node details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get node details: {str(e)}")

    except Exception as e:
        logger.error(f"Unexpected error getting node details: {str(e)}")
        raise HTTPException(status_code=500, detail=ERROR_MESSAGES["NODE_DETAILS_FAILED"])


@router.get("/health")
async def health_check(
    analysis_service: AnalysisService = Depends(analysis_service)
):
    """
    Health check endpoint to verify the analysis service is working.
    """
    try:
        health_status = analysis_service.health_check()
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}