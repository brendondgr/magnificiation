import os
import pandas as pd
from jobspy import scrape_jobs
from concurrent.futures import ThreadPoolExecutor, as_completed
from multiprocessing import cpu_count
from typing import List, Dict, Optional
from dataclasses import dataclass, field


@dataclass
class JobScrapeTask:
    """
    Represents a job scraping task for a single job title across all sites.
    Each instance scrapes all specified sites for its job_title.
    """
    job_title: str
    sites: List[str] = field(default_factory=lambda: ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google"])
    results_wanted: int = 20
    hours_old: int = 24
    country_indeed: str = 'USA'
    
    # Results storage
    jobs_data: List[Dict] = field(default_factory=list, init=False)
    site_counts: Dict[str, int] = field(default_factory=dict, init=False)
    
    def run(self) -> 'JobScrapeTask':
        """
        Execute the scraping for this job title across all sites.
        Returns self for easy result collection.
        """
        for site in self.sites:
            try:
                jobs_df = scrape_jobs(
                    site_name=[site],
                    search_term=self.job_title,
                    results_wanted=self.results_wanted,
                    hours_old=self.hours_old,
                    country_indeed=self.country_indeed
                )
                
                if not jobs_df.empty:
                    # Add job_title to the DataFrame for later analysis
                    jobs_df['search_term'] = self.job_title
                    
                    # Store results
                    self.jobs_data.extend(jobs_df.to_dict('records'))
                    self.site_counts[site] = len(jobs_df)
                else:
                    self.site_counts[site] = 0
                    
            except Exception as e:
                self.site_counts[site] = 0
        
        return self
    
    @property
    def total_jobs(self) -> int:
        """Return total number of jobs found for this task."""
        return len(self.jobs_data)
    
    @property
    def sanitized_title(self) -> str:
        """Return a filename-safe version of the job title."""
        return self.job_title.replace(" ", "_").replace("/", "_")


class JobSpyScraper:
    """
    Main scraper class that manages multiple JobScrapeTask instances
    and runs them concurrently using a thread pool.
    """
    
    def __init__(
        self,
        job_titles: List[str],
        sites: Optional[List[str]] = None,
        data_dir: str = 'data',
        results_wanted: int = 20,
        hours_old: int = 24,
        country_indeed: str = 'USA'
    ):
        self.job_titles = job_titles
        self.sites = sites or ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google"]
        self.data_dir = data_dir
        self.results_wanted = results_wanted
        self.hours_old = hours_old
        self.country_indeed = country_indeed
        
        # Create data directory
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Create task instances
        self.tasks: List[JobScrapeTask] = [
            JobScrapeTask(
                job_title=title,
                sites=self.sites,
                results_wanted=self.results_wanted,
                hours_old=self.hours_old,
                country_indeed=self.country_indeed
            )
            for title in self.job_titles
        ]
        
        # Results
        self.all_jobs: List[Dict] = []
        self.completed_tasks: List[JobScrapeTask] = []
    
    @property
    def num_threads(self) -> int:
        """Calculate number of threads as CPU count minus 2, minimum 1."""
        return max(1, cpu_count() - 2)
    
    def run(self) -> pd.DataFrame:
        """
        Execute all scraping tasks concurrently using a thread pool.
        Returns a combined DataFrame of all scraped jobs.
        """
        print(f"Starting JobSpy scraper with {self.num_threads} threads...")
        print(f"Job titles: {', '.join(self.job_titles)}")
        print(f"Sites: {', '.join(self.sites)}")
        
        # Use ThreadPoolExecutor to run tasks concurrently
        with ThreadPoolExecutor(max_workers=self.num_threads) as executor:
            # Submit all tasks
            future_to_task = {
                executor.submit(task.run): task 
                for task in self.tasks
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_task):
                task = future_to_task[future]
                try:
                    completed_task = future.result()
                    self.completed_tasks.append(completed_task)
                    self.all_jobs.extend(completed_task.jobs_data)
                    print(f"\n✓ Completed: '{completed_task.job_title}' - {completed_task.total_jobs} jobs found")
                except Exception as e:
                    print(f"\n✗ Task failed for '{task.job_title}': {e}")
        
        # Compile results
        return self._compile_results()
    
    def _compile_results(self) -> pd.DataFrame:
        """Compile all results and save to CSV."""
        print("\n" + "=" * 60)
        print("Overall Job Summary")
        print("=" * 60)
        
        if not self.all_jobs:
            print("No jobs were scraped.")
            return pd.DataFrame()
        
        df = pd.DataFrame(self.all_jobs)
        
        print(f"Total jobs scraped: {len(df)}")
        
        print("\nJobs per site:")
        print(df['site'].value_counts().to_string())
        
        print("\nJobs per search term:")
        print(df['search_term'].value_counts().to_string())
        
        print("\nJobs per site and search term:")
        print(df.groupby(['site', 'search_term']).size().unstack(fill_value=0).to_string())
        
        # Save combined results to jobs.csv
        jobs_file_path = os.path.join(self.data_dir, "jobs.csv")
        df.to_csv(jobs_file_path, index=False)
        print(f"\nAll scraped jobs saved to {jobs_file_path}")
        
        # Also save per-task results
        self._save_task_results()
        
        return df
    
    def _save_task_results(self):
        """Save individual task results to separate CSV files."""
        for task in self.completed_tasks:
            if task.jobs_data:
                task_df = pd.DataFrame(task.jobs_data)
                file_path = os.path.join(self.data_dir, f"{task.sanitized_title}_jobs.csv")
                task_df.to_csv(file_path, index=False)
                print(f"Saved {len(task_df)} jobs for '{task.job_title}' to {file_path}")


# Main execution
if __name__ == "__main__":
    # Define job titles to search
    job_titles = [
        "software engineer",
        "data scientist",
    ]
    
    # Create and run scraper
    scraper = JobSpyScraper(
        job_titles=job_titles,
        data_dir='data',
        results_wanted=20,
        hours_old=24
    )
    
    # Run the scraper (this uses thread pool internally)
    results_df = scraper.run()