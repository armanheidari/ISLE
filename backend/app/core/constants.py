"""
Constants and configuration values for the ISLE API.
"""

from typing import Dict

# API Configuration
API_TITLE = "ISLE API"
API_DESCRIPTION = "API for Intelligent Scientific Literature Explorer (ISLE)"
API_VERSION = "1.0.0"

# Default Limits
DEFAULT_TOP_N = 10
MAX_WORDCLOUD_WORDS = 50
MAX_DETAILS_ITEMS = 30

# Network Types
NETWORK_TYPES = {
    "COMPLETE": "complete",
    "AUTHOR_COLLABORATION": "author_collaboration", 
    "INSTITUTION_COLLABORATION": "institution_collaboration",
    "COUNTRY_COLLABORATION": "country_collaboration"
}

# Node Types
NODE_TYPES = {
    "PAPER": "paper",
    "AUTHOR": "author",
    "INSTITUTION": "institution",
    "COUNTRY": "country",
    "TOPIC": "topic",
    "YEAR": "year",
    "UNKNOWN": "unknown"
}

# Node Colors
NODE_COLORS: Dict[str, str] = {
    "paper": "#3498db",
    "author": "#e74c3c", 
    "institution": "#2ecc71",
    "country": "#f39c12",
    "topic": "#9b59b6",
    "year": "#1abc9c",
    "unknown": "#95a5a6"
}

# Data Processing
DEFAULT_SAMPLE_SIZE = 1000
RANDOM_STATE = 42
MAX_TEXT_PREVIEW_LENGTH = 500
MAX_TITLE_PREVIEW_LENGTH = 100

# Session Management
SESSION_CLEANUP_TIMEOUT = 3600  # 1 hour in seconds

# Error Messages
ERROR_MESSAGES = {
    "SESSION_NOT_FOUND": "Session not found or expired",
    "NODE_NOT_FOUND": "Node not found in session",
    "INVALID_NETWORK_TYPE": "Unknown network type",
    "ANALYSIS_FAILED": "Analysis failed",
    "NETWORK_ANALYSIS_FAILED": "Network analysis failed",
    "NODE_DETAILS_FAILED": "Failed to get node details"
}

# Allowed Origins
DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:8080",
    "http://localhost:5173"
]

# Allowed Methods
DEFAULT_ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]

# Allowed Headers
DEFAULT_ALLOWED_HEADERS = ["*"]
