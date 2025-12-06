"""
Job Filter for Magnification Job Search Application.

This module applies user-defined filters to mark irrelevant jobs:
- Load filter criteria from jobs_config.json
- Filter by job title matching
- Filter by description keyword matching
- Update database to set ignore=1 for filtered jobs
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

from .scraper_config import SUPPORTED_SITES

logger = logging.getLogger(__name__)

# Config file path (scrapers -> backend -> utils -> project root)
CONFIG_DIR = Path(__file__).resolve().parents[3] / "config"
JOBS_CONFIG_PATH = CONFIG_DIR / "jobs_config.json"


def load_filter_config() -> Dict[str, Any]:
    """
    Load filter configuration from jobs_config.json.
    
    Returns:
        Dict containing job_titles and description_keywords lists
    """
    if not JOBS_CONFIG_PATH.exists():
        logger.warning(f"Filter config not found: {JOBS_CONFIG_PATH}")
        return {'job_titles': [], 'description_keywords': []}
    
    try:
        with open(JOBS_CONFIG_PATH, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        return {
            'job_titles': config.get('job_titles', []),
            'description_keywords': config.get('description_keywords', [])
        }
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing filter config: {e}")
        return {'job_titles': [], 'description_keywords': []}


def apply_title_filter(job: Dict[str, Any], allowed_titles: List[str]) -> bool:
    """
    Check if job title matches any in the allowed list.
    
    Args:
        job: Job dictionary
        allowed_titles: List of allowed job title patterns (case-insensitive)
    
    Returns:
        bool: True if job should be KEPT (matches filter)
    """
    if not allowed_titles:
        # No title filter configured, keep all jobs
        return True
    
    job_title = str(job.get('title', '')).lower()
    
    # Check if job title contains any of the allowed patterns
    for allowed in allowed_titles:
        if allowed.lower() in job_title:
            return True
    
    return False


def apply_keyword_filter(job: Dict[str, Any], keywords: List[str]) -> bool:
    """
    Check if job description contains any required keywords.
    
    Args:
        job: Job dictionary
        keywords: List of required keywords (case-insensitive)
    
    Returns:
        bool: True if job should be KEPT (contains at least one keyword)
    """
    if not keywords:
        # No keyword filter configured, keep all jobs
        return True
    
    description = str(job.get('description', '')).lower()
    
    # Check if description contains any of the required keywords
    for keyword in keywords:
        if keyword.lower() in description:
            return True
    
    return False


def apply_filters(job: Dict[str, Any], filter_config: Optional[Dict[str, Any]] = None) -> bool:
    """
    Apply all filters to determine if a job should be kept or ignored.
    
    Args:
        job: Job dictionary
        filter_config: Optional filter configuration. If None, loads from config file.
    
    Returns:
        bool: True if job should be KEPT, False if should be ignored
    """
    if filter_config is None:
        filter_config = load_filter_config()
    
    allowed_titles = filter_config.get('job_titles', [])
    keywords = filter_config.get('description_keywords', [])
    
    # If no filters are configured, keep all jobs
    if not allowed_titles and not keywords:
        return True
    
    # Apply title filter (if configured)
    if allowed_titles and not apply_title_filter(job, allowed_titles):
        return False
    
    # Apply keyword filter (if configured)
    if keywords and not apply_keyword_filter(job, keywords):
        return False
    
    return True


def filter_jobs(jobs: List[Dict[str, Any]], filter_config: Optional[Dict[str, Any]] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    Filter a list of jobs into kept and ignored categories.
    
    Args:
        jobs: List of job dictionaries
        filter_config: Optional filter configuration
    
    Returns:
        Dict with 'kept' and 'ignored' lists of jobs
    """
    if filter_config is None:
        filter_config = load_filter_config()
    
    kept = []
    ignored = []
    
    for job in jobs:
        if apply_filters(job, filter_config):
            kept.append(job)
        else:
            ignored.append(job)
    
    logger.info(f"Filtering complete: {len(kept)} kept, {len(ignored)} ignored")
    return {'kept': kept, 'ignored': ignored}


def filter_and_mark_jobs(job_ids: List[int]) -> Dict[str, Any]:
    """
    Apply filters to existing jobs in database and mark ignored ones.
    
    This function retrieves jobs from the database, applies filters,
    and updates the ignore flag for jobs that don't match.
    
    Args:
        job_ids: List of job IDs to filter
    
    Returns:
        Dict containing statistics about the filtering operation
    """
    # Import here to avoid circular imports
    from ..database.operations import get_jobs_by_ids, set_job_ignore
    
    filter_config = load_filter_config()
    
    # Get jobs from database
    jobs = get_jobs_by_ids(job_ids)
    
    kept_count = 0
    ignored_count = 0
    
    for job in jobs:
        if apply_filters(job, filter_config):
            kept_count += 1
        else:
            # Mark as ignored in database
            set_job_ignore(job['id'], 1)
            ignored_count += 1
    
    logger.info(f"Filter and mark complete: {kept_count} kept, {ignored_count} ignored")
    
    return {
        'total_processed': len(jobs),
        'kept': kept_count,
        'ignored': ignored_count,
        'filter_config': filter_config
    }


def get_filter_summary(filter_config: Optional[Dict[str, Any]] = None) -> str:
    """
    Get a human-readable summary of the current filter configuration.
    
    Args:
        filter_config: Optional filter configuration
    
    Returns:
        String describing the active filters
    """
    if filter_config is None:
        filter_config = load_filter_config()
    
    titles = filter_config.get('job_titles', [])
    keywords = filter_config.get('description_keywords', [])
    
    parts = []
    
    if titles:
        parts.append(f"Title patterns: {', '.join(titles)}")
    else:
        parts.append("No title filter")
    
    if keywords:
        parts.append(f"Keywords: {', '.join(keywords)}")
    else:
        parts.append("No keyword filter")
    
    return " | ".join(parts)
