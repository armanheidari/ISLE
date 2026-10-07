from typing import List

from app.core.constants import (
    API_TITLE, 
    API_VERSION,
    DEFAULT_TOP_N,
    API_DESCRIPTION, 
    MAX_WORDCLOUD_WORDS,
    DEFAULT_ALLOWED_ORIGINS,
    DEFAULT_ALLOWED_METHODS,
    SESSION_CLEANUP_TIMEOUT,
    DEFAULT_ALLOWED_HEADERS
)
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    api_title: str = API_TITLE
    api_description: str = API_DESCRIPTION
    api_version: str = API_VERSION

    allowed_origins: List[str] = DEFAULT_ALLOWED_ORIGINS
    allowed_methods: List[str] = DEFAULT_ALLOWED_METHODS
    allowed_headers: List[str] = DEFAULT_ALLOWED_HEADERS

    default_dataset_path: str = "data/corpus/topic_dataset.csv"

    default_top_n: int = DEFAULT_TOP_N
    max_wordcloud_words: int = MAX_WORDCLOUD_WORDS

    enable_caching: bool = True
    cache_ttl: int = SESSION_CLEANUP_TIMEOUT
    
    class Config:
        env_file = ".env"


settings = Settings()