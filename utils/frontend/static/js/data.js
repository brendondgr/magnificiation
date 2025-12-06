

// --- REAL DATA ---

// Helper to generate status object (still useful for optimistic updates if needed)
const createStatus = (statusName, checked, dateReached) => ({
    status: statusName,
    checked: checked ? 1 : 0,
    date_reached: dateReached
});

let jobsData = [];

async function fetchJobs() {
    try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        jobsData = data;
        console.log("Loaded jobs:", jobsData.length);
    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        // Fallback to empty or show error logic
        jobsData = [];
    }
}

