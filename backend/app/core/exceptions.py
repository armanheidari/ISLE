"""
Custom exceptions for the ISLE API.
"""

from typing import Optional


class ISLEException(Exception):
    """Base exception for ISLE API."""
    
    def __init__(self, message: str, details: Optional[str] = None):
        self.message = message
        self.details = details
        super().__init__(self.message)


class SessionNotFoundError(ISLEException):
    """Raised when a session is not found."""
    
    def __init__(self, session_id: str):
        super().__init__(
            message=f"Session {session_id} not found or expired",
            details=f"Session ID: {session_id}"
        )
        self.session_id = session_id


class NodeNotFoundError(ISLEException):
    """Raised when a node is not found in a session."""
    
    def __init__(self, session_id: str, node_id: str):
        super().__init__(
            message=f"Node {node_id} not found in session {session_id}",
            details=f"Session ID: {session_id}, Node ID: {node_id}"
        )
        self.session_id = session_id
        self.node_id = node_id


class InvalidNetworkTypeError(ISLEException):
    """Raised when an invalid network type is provided."""
    
    def __init__(self, network_type: str):
        super().__init__(
            message=f"Unknown network type: {network_type}",
            details=f"Provided network type: {network_type}"
        )
        self.network_type = network_type


class AnalysisError(ISLEException):
    """Raised when analysis operations fail."""
    
    def __init__(self, operation: str, details: Optional[str] = None):
        super().__init__(
            message=f"Analysis failed during {operation}",
            details=details
        )
        self.operation = operation


class DataProcessingError(ISLEException):
    """Raised when data processing operations fail."""
    
    def __init__(self, operation: str, details: Optional[str] = None):
        super().__init__(
            message=f"Data processing failed during {operation}",
            details=details
        )
        self.operation = operation
