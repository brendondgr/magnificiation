// --- HELPER FUNCTIONS ---

function isJobNew(job) {
    // A job is new if "Applied" is unchecked
    return job.statuses.find(s => s.status === "Applied").checked === 0;
}

function getCurrentStatus(job) {
    const checked = job.statuses.filter(s => s.checked === 1);
    if (checked.length === 0) return "New";

    // Priority checks for end states
    if (checked.find(s => s.status === "Accepted")) return "Accepted";
    if (checked.find(s => s.status === "Offer")) return "Offer";
    if (checked.find(s => s.status === "Rejected")) return "Rejected";
    if (checked.find(s => s.status === "Ignored/Ghosted")) return "Ghosted";
    if (checked.find(s => s.status === "Post-Interview Rejection")) return "Rejected";

    // Otherwise return the last active stage
    return checked[checked.length - 1].status;
}
