"""
Helper Functions and Utilities for Database Operations.

This module provides:
- Validation functions for status values and job data
- Date formatting utilities
- Status management helpers
"""

from datetime import datetime
from typing import Dict, Any, List, Optional

from .config import APPLICATION_STATUSES, STATUS_INDEX


# ==================== Validation Functions ====================

def validate_status(status: str) -> bool:
    """
    Verify status value is one of the 9 allowed values.
    
    Args:
        status: Status string to validate
    
    Returns:
        bool: True if valid
    
    Raises:
        ValueError: If status is not valid
    """
    if status not in APPLICATION_STATUSES:
        valid_statuses = ", ".join(APPLICATION_STATUSES)
        raise ValueError(
            f"Invalid status '{status}'. Must be one of: {valid_statuses}"
        )
    return True


def validate_job_data(job_data: Dict[str, Any]) -> bool:
    """
    Validate required fields before insertion.
    
    Args:
        job_data: Dictionary containing job fields
    
    Returns:
        bool: True if valid
    
    Raises:
        ValueError: If required fields are missing
    """
    required_fields = ['title', 'company', 'location']
    
    for field in required_fields:
        if field not in job_data or not job_data[field]:
            raise ValueError(f"Required field '{field}' is missing or empty")
    
    return True


def validate_date_format(date_str: str) -> bool:
    """
    Ensure dates follow YYYY-MM-DD format.
    
    Args:
        date_str: Date string to validate
    
    Returns:
        bool: True if valid
    
    Raises:
        ValueError: If date format is invalid
    """
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        raise ValueError(
            f"Invalid date format '{date_str}'. Expected YYYY-MM-DD format."
        )


# ==================== Formatting Functions ====================

def format_date(dt: Optional[datetime] = None) -> str:
    """
    Handle date formatting and conversion to YYYY-MM-DD string.
    
    Args:
        dt: Datetime object to format. If None, uses current date.
    
    Returns:
        str: Formatted date string in YYYY-MM-DD format
    """
    if dt is None:
        dt = datetime.utcnow()
    return dt.strftime('%Y-%m-%d')


def format_job_for_display(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format job data for frontend presentation.
    
    Args:
        job_data: Raw job dictionary from database
    
    Returns:
        Dict: Formatted job data suitable for display
    """
    formatted = job_data.copy()
    
    # Format dates for display
    if formatted.get('created_at'):
        try:
            dt = datetime.fromisoformat(formatted['created_at'])
            formatted['created_at_display'] = dt.strftime('%B %d, %Y')
        except (ValueError, TypeError):
            formatted['created_at_display'] = formatted['created_at']
    
    if formatted.get('updated_at'):
        try:
            dt = datetime.fromisoformat(formatted['updated_at'])
            formatted['updated_at_display'] = dt.strftime('%B %d, %Y')
        except (ValueError, TypeError):
            formatted['updated_at_display'] = formatted['updated_at']
    
    # Truncate long descriptions
    if formatted.get('description') and len(formatted['description']) > 500:
        formatted['description_preview'] = formatted['description'][:500] + '...'
    else:
        formatted['description_preview'] = formatted.get('description', '')
    
    return formatted


# ==================== Status Management ====================

def get_status_list() -> List[str]:
    """
    Return list of valid status values.
    
    Returns:
        List[str]: All valid application status values in order
    """
    return APPLICATION_STATUSES.copy()


def get_status_index(status: str) -> int:
    """
    Get the index of a status in the progression.
    
    Args:
        status: Status name
    
    Returns:
        int: Index position (0-8)
    
    Raises:
        ValueError: If status is not valid
    """
    validate_status(status)
    return STATUS_INDEX[status]


def get_next_status_index(current_status: str) -> Optional[int]:
    """
    Determine next logical status in sequence.
    
    Args:
        current_status: Current status name
    
    Returns:
        int: Index of next status, or None if at final status
    """
    current_index = get_status_index(current_status)
    next_index = current_index + 1
    
    if next_index >= len(APPLICATION_STATUSES):
        return None
    
    return next_index


def get_next_status(current_status: str) -> Optional[str]:
    """
    Get the next status name in the progression.
    
    Args:
        current_status: Current status name
    
    Returns:
        str: Next status name, or None if at final status
    """
    next_index = get_next_status_index(current_status)
    if next_index is None:
        return None
    
    return APPLICATION_STATUSES[next_index]


def is_status_progression_valid(from_status: str, to_status: str) -> bool:
    """
    Validate logical application flow.
    
    Checks if moving from one status to another makes logical sense.
    Currently allows any forward progression.
    
    Args:
        from_status: Current status
        to_status: Target status
    
    Returns:
        bool: True if progression is valid
    """
    from_index = get_status_index(from_status)
    to_index = get_status_index(to_status)
    
    # Allow forward progression or re-reaching same status
    return to_index >= from_index


def get_status_by_index(index: int) -> Optional[str]:
    """
    Get status name by its index.
    
    Args:
        index: Status index (0-8)
    
    Returns:
        str: Status name, or None if index out of range
    """
    if 0 <= index < len(APPLICATION_STATUSES):
        return APPLICATION_STATUSES[index]
    return None
