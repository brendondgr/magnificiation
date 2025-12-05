// --- RENDER FUNCTIONS ---

let newJobContainer;

// Kanban Columns (will be initialized after DOM loads)
let colApplied, colInterview, colOffer, colArchived;

function initializeElements() {
    newJobContainer = document.getElementById('newJobsGrid');
    colApplied = document.getElementById('col-applied');
    colInterview = document.getElementById('col-interview');
    colOffer = document.getElementById('col-offer');
    colArchived = document.getElementById('col-archived');
}

function renderAll() {
    // Clear all containers
    newJobContainer.innerHTML = "";
    colApplied.innerHTML = "";
    colInterview.innerHTML = "";
    colOffer.innerHTML = "";
    colArchived.innerHTML = "";

    let counts = { new: 0, applied: 0, interview: 0, offer: 0, archived: 0 };

    jobsData.forEach(job => {
        if (job.ignore === 1) return;

        if (isJobNew(job)) {
            counts.new++;
            renderNewJobCard(job);
        } else {
            const status = getCurrentStatus(job);
            let targetCol = colApplied; // Default

            // Determine Column
            if (status.includes("Interview")) {
                targetCol = colInterview;
                counts.interview++;
            } else if (status === "Offer" || status === "Accepted") {
                targetCol = colOffer;
                counts.offer++;
            } else if (status === "Rejected" || status === "Ghosted") {
                targetCol = colArchived;
                counts.archived++;
            } else {
                // Applied
                counts.applied++;
            }

            renderKanbanCard(job, targetCol);
        }
    });

    // Update Counts
    document.getElementById('newJobCount').innerText = counts.new;
    document.getElementById('count-applied').innerText = counts.applied;
    document.getElementById('count-interview').innerText = counts.interview;
    document.getElementById('count-offer').innerText = counts.offer;
    document.getElementById('count-archived').innerText = counts.archived;
}

function renderNewJobCard(job) {
    const card = document.createElement('div');
    card.className = "bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full group";
    card.onclick = (e) => {
        if (e.target.closest('button')) return;
        openJobDetails(job);
    };

    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <i class="fa-regular fa-building"></i>
            </div>
            <span class="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">${job.created_at}</span>
        </div>
        
        <h3 class="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary-600 transition-colors">${job.title}</h3>
        <p class="text-slate-500 font-medium text-sm mb-4">${job.company}</p>
        
        <div class="space-y-2 mb-6 flex-1">
            <div class="flex items-center text-xs text-slate-500">
                <i class="fa-solid fa-location-dot w-5 text-center mr-1 text-slate-300"></i>
                ${job.location}
            </div>
            <div class="flex items-center text-xs text-slate-500">
                <i class="fa-solid fa-sack-dollar w-5 text-center mr-1 text-slate-300"></i>
                ${job.compensation || "Not listed"}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <button onclick="ignoreJob(${job.id})" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                <i class="fa-regular fa-eye-slash"></i> Ignore
            </button>
            <button onclick="applyJob(${job.id})" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-100 transition-all">
                Apply <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `;
    newJobContainer.appendChild(card);
}

function renderKanbanCard(job, container) {
    const card = document.createElement('div');
    card.className = "draggable-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-3 hover:shadow-md transition-all active:cursor-grabbing";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-id", job.id);

    // Drag Events
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData("text/plain", job.id);
        e.target.classList.add('dragging');
    });

    card.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });

    // Click Event (Details)
    card.onclick = (e) => {
        openJobDetails(job);
    };

    const status = getCurrentStatus(job);

    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-slate-900 text-sm leading-tight">${job.title}</h4>
        </div>
        <p class="text-xs text-slate-500 font-medium mb-3">${job.company}</p>
        <div class="flex items-center justify-between mt-2">
            <span class="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">${status}</span>
            <i class="fa-solid fa-grip-lines text-slate-200 cursor-grab"></i>
        </div>
    `;
    container.appendChild(card);
}

function renderTimeline(statuses, jobId) {
    const detailTimeline = document.getElementById('detailTimeline');
    detailTimeline.innerHTML = "";

    statuses.forEach((statusItem, index) => {
        const isActive = statusItem.checked === 1;
        const isRejected = isActive && (statusItem.status.includes('Rejected') || statusItem.status.includes('Ghosted'));

        let dotColor = isActive ? "bg-primary-500 border-primary-500 shadow-sm" : "bg-white border-slate-300";
        let textColor = isActive ? "text-slate-900 font-semibold" : "text-slate-400";

        if (isRejected) {
            dotColor = "bg-red-500 border-red-500";
            textColor = "text-red-600 font-bold";
        }

        const item = document.createElement('div');
        item.className = "relative flex gap-4 pb-8 last:pb-0 group";

        item.innerHTML = `
            <div class="relative z-10 flex-none w-6 h-6 rounded-full border-2 ${dotColor} flex items-center justify-center transition-colors mt-0.5">
                ${isActive ? '<i class="fa-solid fa-check text-white text-[10px]"></i>' : ''}
            </div>
            <div class="flex-1 -mt-1">
                <div class="flex justify-between items-start mb-1 cursor-pointer" onclick="toggleStatus(${jobId}, ${index})">
                    <span class="${textColor} text-sm transition-colors group-hover:text-primary-600">${statusItem.status}</span>
                    <span class="text-xs text-slate-400 font-mono">${statusItem.date_reached || '-'}</span>
                </div>
            </div>
        `;
        detailTimeline.appendChild(item);
    });
}
