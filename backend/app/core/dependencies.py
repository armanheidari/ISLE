from functools import lru_cache

from app.services.analysis_service import AnalysisService


@lru_cache()
def analysis_service() -> AnalysisService:
    """
    Dependency to get the analysis service instance.
    Uses lru_cache to ensure singleton behavior.
    """
    return AnalysisService()