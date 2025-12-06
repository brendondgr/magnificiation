"""
Scrapers package for Magnification Job Search Application.

This package provides job scraping functionality including:
- scraper_config: Configuration constants
- task_generator: Generate scraping tasks from config
- jobspy_wrapper: Wrapper for jobspy library
- concurrent_scraper: ThreadPool-based concurrent execution
- data_processor: Deduplication and data cleaning
- job_filter: Apply user-defined filters
- scraping_service: Main orchestration service
- scraper_utils: Helper utilities
"""

from .scraper_config import (
    SUPPORTED_SITES,
    DEFAULT_RESULTS_WANTED,
    DEFAULT_HOURS_OLD,
    DEFAULT_COUNTRY,
)

from .task_generator import (
    ScrapingTask,
    generate_scraping_tasks,
    load_jobs_config,
)

from .jobspy_wrapper import (
    JobScrapeTask,
    scrape_single_site,
    normalize_job_data,
)

from .concurrent_scraper import (
    JobSpyScraper,
    execute_scraping_tasks,
)

from .data_processor import (
    deduplicate_jobs,
    clean_job_data,
    validate_job,
    transform_to_db_format,
    process_scraped_jobs,
    get_job_statistics,
)

from .job_filter import (
    load_filter_config,
    apply_filters,
    filter_jobs,
    filter_and_mark_jobs,
)

from .scraping_service import (
    execute_full_scraping_workflow,
    scrape_jobs_quick,
    get_workflow_status,
)

from .scraper_utils import (
    normalize_location,
    normalize_company_name,
    extract_salary_info,
    calculate_task_id,
)

__all__ = [
    # Config
    'SUPPORTED_SITES',
    'DEFAULT_RESULTS_WANTED',
    'DEFAULT_HOURS_OLD',
    'DEFAULT_COUNTRY',
    # Task Generator
    'ScrapingTask',
    'generate_scraping_tasks',
    'load_jobs_config',
    # JobSpy Wrapper
    'JobScrapeTask',
    'scrape_single_site',
    'normalize_job_data',
    # Concurrent Scraper
    'JobSpyScraper',
    'execute_scraping_tasks',
    # Data Processor
    'deduplicate_jobs',
    'clean_job_data',
    'validate_job',
    'transform_to_db_format',
    'process_scraped_jobs',
    'get_job_statistics',
    # Job Filter
    'load_filter_config',
    'apply_filters',
    'filter_jobs',
    'filter_and_mark_jobs',
    # Scraping Service
    'execute_full_scraping_workflow',
    'scrape_jobs_quick',
    'get_workflow_status',
    # Utils
    'normalize_location',
    'normalize_company_name',
    'extract_salary_info',
    'calculate_task_id',
]
