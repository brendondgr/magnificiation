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
    // Card Container with fixed height - Increased contrast
    const card = document.createElement('div');
    card.className = "bg-white rounded-xl border border-slate-300 shadow-md hover:shadow-xl hover:border-slate-400 transition-all flex flex-col h-[450px] group relative overflow-hidden";

    // Prevent card click when clicking interactive elements
    card.onclick = (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        openJobDetails(job);
    };

    card.innerHTML = `
        <!-- Header Section with distinct background -->
        <div class="px-5 py-4 bg-slate-50 border-b border-slate-200">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-slate-900 leading-tight pr-2 group-hover:text-primary-700 transition-colors line-clamp-2">${job.title}</h3>
                <span class="flex-none text-[10px] font-bold tracking-wide text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">${job.created_at}</span>
            </div>
            
            <div class="font-bold text-slate-700 text-sm mb-1">${job.company}</div>
            
            <!-- Quick Info Tags -->
            <div class="flex flex-wrap gap-2 pt-1 text-xs">
                <span class="flex items-center px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                    <i class="fa-solid fa-location-dot mr-1.5 text-slate-400"></i>${job.location}
                </span>
                <span class="flex items-center px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                     <i class="fa-solid fa-sack-dollar mr-1.5 text-slate-400"></i>${job.compensation || "Not listed"}
                </span>
            </div>
        </div>
        
        <!-- Scrolling Description Area -->
        <div class="flex-1 p-5 overflow-y-auto bg-white text-sm text-slate-600 leading-relaxed whitespace-pre-line custom-scrollbar relative">
            ${job.description}
        </div>

        <!-- Action Buttons Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-3">
            <button onclick="ignoreJob(${job.id})" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-red-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all" title="Ignore">
                <i class="fa-regular fa-eye-slash"></i> <span class="hidden sm:inline">Ignore</span>
            </button>
            
            <a href="${job.link || '#'}" target="_blank" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:text-primary-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all" title="External Link">
                <i class="fa-solid fa-external-link-alt"></i> <span class="hidden sm:inline">Link</span>
            </a>

            <button onclick="applyJob(${job.id})" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg border border-transparent transition-all">
                Applied <i class="fa-solid fa-check"></i>
            </button>
        </div>
    `;
    newJobContainer.appendChild(card);
}

function renderKanbanCard(job, container) {
    const card = document.createElement('div');
    card.className = "draggable-card bg-white p-4 rounded-lg border border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400 mb-3 transition-all active:cursor-grabbing group";
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
            <h4 class="font-bold text-slate-900 text-sm leading-tight group-hover:text-primary-700 transition-colors">${job.title}</h4>
        </div>
        <p class="text-xs text-slate-600 font-bold mb-3">${job.company}</p>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span class="text-[10px] font-bold tracking-wide text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">${status}</span>
            <i class="fa-solid fa-grip-lines text-slate-300 group-hover:text-slate-500 cursor-grab"></i>
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
