"""
Helper Utilities for Scraping Operations.

This module provides common utility functions:
- String normalization
- Location standardization
- Company name cleaning
"""

import re
from typing import Optional


def normalize_location(location: str) -> str:
    """
    Standardize location strings.
    
    - Handles "New York, NY" vs "New York City" variations
    - Identifies remote work indicators
    - Cleans up formatting
    
    Args:
        location: Raw location string
    
    Returns:
        Normalized location string
    """
    if not location:
        return ""
    
    location = str(location).strip()
    
    # Check for remote indicators
    remote_patterns = ['remote', 'work from home', 'wfh', 'anywhere', 'distributed']
    location_lower = location.lower()
    
    for pattern in remote_patterns:
        if pattern in location_lower:
            # Extract any city info if present (e.g., "Remote - San Francisco")
            parts = re.split(r'[-–—]', location)
            if len(parts) > 1:
                city_part = parts[-1].strip()
                if city_part and not any(p in city_part.lower() for p in remote_patterns):
                    return f"Remote ({city_part})"
            return "Remote"
    
    # Standardize state abbreviations formatting
    # e.g., "New York,NY" -> "New York, NY"
    location = re.sub(r',\s*([A-Z]{2})$', r', \1', location)
    
    # Remove extra whitespace
    location = ' '.join(location.split())
    
    return location


def normalize_company_name(company: str) -> str:
    """
    Clean and standardize company names.
    
    - Removes legal entity suffixes (Inc., LLC, etc.)
    - Standardizes capitalization
    - Cleans up formatting
    
    Args:
        company: Raw company name
    
    Returns:
        Normalized company name
    """
    if not company:
        return ""
    
    company = str(company).strip()
    
    # Remove common legal suffixes
    suffixes = [
        r',?\s*Inc\.?$',
        r',?\s*LLC\.?$',
        r',?\s*Ltd\.?$',
        r',?\s*Corp\.?$',
        r',?\s*Corporation$',
        r',?\s*Co\.?$',
        r',?\s*Company$',
        r',?\s*L\.?L\.?C\.?$',
        r',?\s*Incorporated$',
        r',?\s*Limited$',
    ]
    
    for suffix in suffixes:
        company = re.sub(suffix, '', company, flags=re.IGNORECASE)
    
    # Clean up extra whitespace
    company = ' '.join(company.split())
    
    return company


def extract_salary_info(text: str) -> Optional[str]:
    """
    Extract and parse salary information from various text formats.
    
    Handles patterns like:
    - "$100,000 - $150,000"
    - "$50k - $75k"
    - "100k-150k annually"
    - "$25/hour"
    
    Args:
        text: Text potentially containing salary information
    
    Returns:
        Standardized salary string, or None if not found
    """
    if not text:
        return None
    
    text = str(text)
    
    # Common salary patterns
    patterns = [
        # Dollar ranges: $100,000 - $150,000
        r'\$[\d,]+(?:\.\d{2})?\s*[-–—to]\s*\$[\d,]+(?:\.\d{2})?',
        # K notation: $100k - $150k
        r'\$\d+k?\s*[-–—to]\s*\$?\d+k',
        # Hourly: $25/hour
        r'\$\d+(?:\.\d{2})?/(?:hour|hr)',
        # Just a number range: 100,000 - 150,000
        r'\d{1,3}(?:,\d{3})+\s*[-–—to]\s*\d{1,3}(?:,\d{3})+',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    
    return None


def calculate_task_id(job_title: str, job_board: str) -> str:
    """
    Generate unique identifier for a scraping task.
    
    Args:
        job_title: Job title being scraped
        job_board: Job board being scraped
    
    Returns:
        Unique task identifier string
    """
    sanitized_title = job_title.lower().replace(" ", "_").replace("/", "_")
    sanitized_board = job_board.lower().replace(" ", "_")
    return f"task_{sanitized_title}_{sanitized_board}"


def truncate_description(description: str, max_length: int = 5000) -> str:
    """
    Truncate a job description to a maximum length.
    
    Attempts to truncate at a sentence boundary when possible.
    
    Args:
        description: Full job description
        max_length: Maximum length in characters
    
    Returns:
        Truncated description
    """
    if not description or len(description) <= max_length:
        return description or ""
    
    # Try to find a sentence boundary
    truncated = description[:max_length]
    
    # Look for last sentence ending
    last_period = truncated.rfind('.')
    last_newline = truncated.rfind('\n')
    
    cut_point = max(last_period, last_newline)
    
    if cut_point > max_length * 0.8:  # Only use if not too short
        return truncated[:cut_point + 1].strip()
    
    return truncated.strip() + "..."


def is_valid_url(url: str) -> bool:
    """
    Check if a string is a valid URL.
    
    Args:
        url: String to check
    
    Returns:
        bool: True if valid URL
    """
    if not url:
        return False
    
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return bool(url_pattern.match(url))
