// --- MOCK DATA (Schema based on database.md) ---

const STATUS_DEFINITIONS = [
    "Applied", "Interview 1", "Interview 2", "Interview 3",
    "Post-Interview Rejection", "Offer", "Accepted", "Rejected", "Ignored/Ghosted"
];

// Helper to generate status object
const createStatus = (statusName, checked, dateReached) => ({
    status: statusName,
    checked: checked ? 1 : 0,
    date_reached: dateReached
});

// Mock Jobs
let jobsData = [
    {
        id: 1,
        title: "Senior Python Developer",
        company: "TechFlow Systems",
        location: "Remote (US)",
        compensation: "$140k - $170k",
        description: "We are looking for an experienced Python developer...",
        created_at: "2023-10-24",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map((s, i) => createStatus(s, i < 3, i < 3 ? "2023-10-25" : null)) // Checked up to Interview 2
    },
    {
        id: 2,
        title: "Data Engineer",
        company: "DataMinds Corp",
        location: "New York, NY",
        compensation: "$130,000",
        description: "Join our data infrastructure team...",
        created_at: "2023-10-26",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map(s => createStatus(s, false, null)) // New Job
    },
    {
        id: 3,
        title: "Frontend Architect",
        company: "Creative Studios",
        location: "San Francisco, CA",
        compensation: "$180k - $220k",
        description: "Looking for a React/Tailwind expert...",
        created_at: "2023-10-20",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map((s, i) => createStatus(s, i < 6, i < 6 ? "2023-11-01" : null)) // Has Offer
    },
    {
        id: 4,
        title: "Junior Backend Dev",
        company: "StartUp Inc.",
        location: "Austin, TX",
        compensation: "$80k - $100k",
        description: "Entry level position...",
        created_at: "2023-11-02",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map(s => createStatus(s, false, null)) // New Job
    },
    {
        id: 5,
        title: "DevOps Engineer",
        company: "CloudScale",
        location: "Remote",
        compensation: "$150k",
        description: "Kubernetes expert needed...",
        created_at: "2023-10-15",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map((s, i) => createStatus(s, s === "Rejected" || s === "Applied", s === "Rejected" ? "2023-10-18" : null)) // Rejected
    }
];
