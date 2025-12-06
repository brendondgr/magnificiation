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
        link: "https://example.com/job/1",
        compensation: "$140k - $170k",
        description: "We are looking for an experienced Python developer to join our backend team. You will be working with Django, FastAPI, and PostgreSQL. \n\nResponsibilities:\n- Design and implement scalable APIs.\n- Optimize database queries.\n- Collaborate with frontend engineers.\n- Write unit and integration tests.\n\nRequirements:\n- 5+ years of Python experience.\n- Strong understanding of REST APIs.\n- Experience with cloud platforms (AWS/GCP).",
        created_at: "2023-10-24",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map((s, i) => createStatus(s, i < 3, i < 3 ? "2023-10-25" : null)) // Checked up to Interview 2
    },
    {
        id: 2,
        title: "Data Engineer",
        company: "DataMinds Corp",
        location: "New York, NY",
        link: "https://example.com/job/2",
        compensation: "$130,000",
        description: "Join our data infrastructure team to build robust pipelines. You will use Apache Airflow, Spark, and Snowflake.\n\nKey Tasks:\n- Build ETL pipelines.\n- Ensure data quality and integrity.\n- Maintain data warehouse schemas.\n\nThis is a hybrid role requiring 2 days in office per week.",
        created_at: "2023-10-26",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map(s => createStatus(s, false, null)) // New Job
    },
    {
        id: 3,
        title: "Frontend Architect",
        company: "Creative Studios",
        location: "San Francisco, CA",
        link: "https://example.com/job/3",
        compensation: "$180k - $220k",
        description: "Looking for a React/Tailwind expert to lead our frontend migration. \n\nOur stack is currently moving from legacy jQuery to Next.js. We need someone who can define the architecture and mentor junior developers.\n\nMust have: Deep knowledge of browser rendering, CSS architecture, and state management.",
        created_at: "2023-10-20",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map((s, i) => createStatus(s, i < 6, i < 6 ? "2023-11-01" : null)) // Has Offer
    },
    {
        id: 4,
        title: "Junior Backend Dev",
        company: "StartUp Inc.",
        location: "Austin, TX",
        link: "https://example.com/job/4",
        compensation: "$80k - $100k",
        description: "Entry level position for a fast-growing startup. Great opportunity to learn Go and Microservices architecture.\n\nWe offer: \n- Mentorship program\n- Flexible hours\n- Competitive equity package.",
        created_at: "2023-11-02",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map(s => createStatus(s, false, null)) // New Job
    },
    {
        id: 5,
        title: "DevOps Engineer",
        company: "CloudScale",
        location: "Remote",
        link: "https://example.com/job/5",
        compensation: "$150k",
        description: "Kubernetes expert needed to manage our multi-region clusters. \n\nResponsibilities:\n- Terraform infrastructure as code.\n- CI/CD pipeline automation (GitHub Actions).\n- Monitoring and alerting (Prometheus/Grafana).",
        created_at: "2023-10-15",
        ignore: 0,
        statuses: STATUS_DEFINITIONS.map((s, i) => createStatus(s, s === "Rejected" || s === "Applied", s === "Rejected" ? "2023-10-18" : null)) // Rejected
    }
];
