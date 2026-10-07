"""
Data processing utilities for the ISLE API.
"""

import ast
import logging
from typing import Any, Dict, List, Optional, Union

import pandas as pd

from app.core.constants import MAX_DETAILS_ITEMS

logger = logging.getLogger(__name__)


def safe_literal_eval(value: Any) -> List[str]:
    """
    Safely evaluate a string as a Python literal.
    
    Args:
        value: The value to evaluate
        
    Returns:
        List of strings from the evaluated literal
        
    Raises:
        DataProcessingError: If evaluation fails
    """
    try:
        if isinstance(value, str):
            result = ast.literal_eval(value)
            if isinstance(result, list):
                return [str(item) for item in result if item is not None]
            else:
                return [str(result)] if result is not None else []
        elif pd.notna(value):
            return [str(value)]
        else:
            return []
    except (ValueError, SyntaxError) as e:
        logger.warning(f"Error evaluating literal: {e}")
        return []


def parse_list_column(df: pd.DataFrame, column_name: str) -> List[List[str]]:
    """
    Parse a column that contains string representations of lists.
    
    Args:
        df: DataFrame containing the column
        column_name: Name of the column to parse
        
    Returns:
        List of lists containing parsed values
    """
    parsed_values = []
    
    for idx, row in df.iterrows():
        try:
            value = row[column_name]
            parsed_values.append(safe_literal_eval(value))
        except Exception as e:
            logger.warning(f"Error parsing column {column_name} at row {idx}: {e}")
            parsed_values.append([])
    
    return parsed_values


def aggregate_citations_from_list_column(
    df: pd.DataFrame, 
    column_name: str
) -> Dict[str, int]:
    """
    Aggregate citation counts from a column containing lists of entities.
    
    Args:
        df: DataFrame containing the data
        column_name: Name of the column containing entity lists
        
    Returns:
        Dictionary mapping entity names to total citation counts
    """
    counts = {}
    
    for idx, row in df.iterrows():
        try:
            citations = int(row['citation_count']) if pd.notna(row.get('citation_count')) else 0
            entities = safe_literal_eval(row[column_name])
            
            for entity in entities:
                if entity:
                    counts[entity] = counts.get(entity, 0) + citations
                    
        except Exception as e:
            logger.warning(f"Error processing row {idx} for {column_name}: {e}")
            continue
    
    return counts


def truncate_text(text: str, max_length: int) -> str:
    """
    Truncate text to a maximum length with ellipsis.
    
    Args:
        text: Text to truncate
        max_length: Maximum length before truncation
        
    Returns:
        Truncated text with ellipsis if needed
    """
    if not text or len(text) <= max_length:
        return text
    return text[:max_length] + "..."


def safe_int_conversion(value: Any, default: int = 0) -> int:
    """
    Safely convert a value to integer.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Integer value or default
    """
    try:
        if pd.notna(value):
            return int(value)
        return default
    except (ValueError, TypeError):
        return default


def safe_float_conversion(value: Any, default: float = 0.0) -> float:
    """
    Safely convert a value to float.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        Float value or default
    """
    try:
        if pd.notna(value):
            return float(value)
        return default
    except (ValueError, TypeError):
        return default


def create_paper_summary(
    paper_id: Union[str, int], 
    title: str, 
    year: Optional[int], 
    citations: int,
    max_title_length: int = 100
) -> Dict[str, Union[str, int]]:
    """
    Create a standardized paper summary.
    
    Args:
        paper_id: Unique identifier for the paper
        title: Paper title
        year: Publication year
        citations: Citation count
        max_title_length: Maximum title length for display
        
    Returns:
        Dictionary containing paper summary information
    """
    return {
        "id": str(paper_id),
        "title": truncate_text(title, max_title_length),
        "year": year,
        "citations": citations
    }
