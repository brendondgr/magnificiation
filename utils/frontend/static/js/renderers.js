// --- RENDER FUNCTIONS ---

// --- HELPER FUNCTIONS ---

// Format date from datetime string to YYYY-MM-DD
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Validate and format compensation
function formatCompensation(comp) {
    if (!comp || comp === 'nan' || comp.toLowerCase().includes('nan') || comp === 'NaN') {
        return 'Not Listed';
    }
    return comp;
}

// Process description HTML
function formatDescription(desc) {
    // Return null for empty, null, or undefined descriptions
    if (!desc) return null;

    // Trim and check if it's actually empty
    const trimmed = desc.trim();
    if (trimmed === '' || trimmed.length === 0) return null;

    let formatted = trimmed;

    // Remove escaped backslashes (e.g., \- becomes -)
    formatted = formatted.replace(/\\(.)/g, '$1');

    // Convert markdown-style bold to HTML
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Clean up excessive blank lines (3+ newlines become 2)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // Convert markdown headings to HTML (must be done before list processing)
    // Process from most specific (####) to least specific (#) to avoid conflicts
    formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4 class="font-bold text-base text-slate-800 dark:text-white mt-4 mb-2">$1</h4>');
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 class="font-bold text-lg text-slate-800 dark:text-white mt-4 mb-2">$1</h3>');
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 class="font-bold text-xl text-slate-800 dark:text-white mt-4 mb-2">$1</h2>');
    formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1 class="font-bold text-2xl text-slate-800 dark:text-white mt-4 mb-2">$1</h1>');

    // Convert bullet lists to HTML
    // Match lines starting with * or - (with optional whitespace)
    const lines = formatted.split('\n');
    let inList = false;
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isBullet = /^\s*[\*\-]\s+(.+)/.test(line);

        if (isBullet) {
            const content = line.replace(/^\s*[\*\-]\s+/, '');
            if (!inList) {
                processedLines.push('<ul class="list-disc list-inside space-y-1 my-2">');
                inList = true;
            }
            processedLines.push(`<li class="ml-2">${content}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }

    // Close list if still open
    if (inList) {
        processedLines.push('</ul>');
    }

    formatted = processedLines.join('\n');

    // Convert remaining newlines to <br> tags (but not inside lists or headings)
    formatted = formatted.replace(/\n(?![<\/]?ul|[<\/]?li|[<\/]?h[1-6])/g, '<br>');

    // Clean up any double <br> tags that might have been created
    formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');

    return formatted;
}

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
    // Format data using helper functions
    const formattedDate = formatDate(job.created_at);
    const formattedCompensation = formatCompensation(job.compensation);
    const formattedDescription = formatDescription(job.description);

    // Card Container - Improved grayscale contrast
    const card = document.createElement('div');
    // Add fixed height for cards with descriptions, auto height for those without
    const cardHeight = formattedDescription ? "h-[450px]" : "";
    card.className = `bg-white dark:bg-neon-gray-light rounded-xl border border-slate-300 dark:border-neon-border-light shadow-md hover:shadow-xl hover:border-slate-400 dark:hover:border-neon-blue dark:hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all flex flex-col ${cardHeight} group relative overflow-hidden duration-300`;

    // Prevent card click when clicking interactive elements
    card.onclick = (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        openJobDetails(job);
    };

    // Build the description section only if there's content
    const descriptionSection = formattedDescription ? `
        <!-- Scrolling Description Area -->
        <div class="flex-1 p-5 overflow-y-auto bg-white dark:bg-neon-gray-light text-sm text-slate-600 dark:text-gray-300 leading-relaxed custom-scrollbar relative">
            ${formattedDescription}
        </div>
    ` : '';

    card.innerHTML = `
        <!-- Header Section -->
        <div class="px-5 py-4 bg-slate-50 dark:bg-neon-gray/80 border-b border-slate-200 dark:border-neon-border">
            <!-- Full Width Title -->
            <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-primary-700 dark:group-hover:text-neon-blue transition-colors">${job.title}</h3>
            
            <!-- Company and Date Row -->
            <div class="flex justify-between items-center mb-2">
                <div class="font-bold text-slate-700 dark:text-gray-300 text-sm">${job.company}</div>
                <span class="text-[10px] font-bold tracking-wide text-slate-500 dark:text-gray-400 bg-white dark:bg-neon-border/30 px-2 py-1 rounded border border-slate-200 dark:border-neon-border-light shadow-sm">${formattedDate}</span>
            </div>
            
            <!-- Quick Info Tags -->
            <div class="flex flex-wrap gap-2 text-xs">
                <span class="flex items-center px-1.5 py-0.5 rounded-md bg-white dark:bg-neon-border/30 border border-slate-200 dark:border-neon-border-light text-slate-600 dark:text-gray-300 font-medium">
                    <i class="fa-solid fa-location-dot mr-1.5 text-slate-400 dark:text-gray-500"></i>${job.location}
                </span>
                <span class="flex items-center px-1.5 py-0.5 rounded-md bg-white dark:bg-neon-border/30 border border-slate-200 dark:border-neon-border-light text-slate-600 dark:text-gray-300 font-medium">
                     <i class="fa-solid fa-sack-dollar mr-1.5 text-slate-400 dark:text-gray-500"></i>${formattedCompensation}
                </span>
            </div>
        </div>
        
        ${descriptionSection}

        <!-- Action Buttons Footer -->
        <div class="p-4 bg-slate-50 dark:bg-neon-gray/80 border-t border-slate-200 dark:border-neon-border grid grid-cols-3 gap-3">
            <button onclick="ignoreJob(${job.id})" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-white dark:hover:bg-neon-gray hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-neon-border-light transition-all" title="Ignore">
                <i class="fa-regular fa-eye-slash"></i> <span class="hidden sm:inline">Ignore</span>
            </button>
            
            <a href="${job.link || '#'}" target="_blank" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-primary-700 dark:hover:text-neon-blue hover:bg-white dark:hover:bg-neon-gray hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-neon-border-light transition-all" title="External Link">
                <i class="fa-solid fa-external-link-alt"></i> <span class="hidden sm:inline">Link</span>
            </a>

            <button onclick="applyJob(${job.id})" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-primary-600 dark:bg-neon-blue text-white dark:text-black hover:bg-primary-700 dark:hover:bg-cyan-400 shadow-md hover:shadow-lg dark:hover:shadow-[0_0_10px_rgba(0,243,255,0.4)] border border-transparent transition-all">
                Applied <i class="fa-solid fa-check"></i>
            </button>
        </div>
    `;
    newJobContainer.appendChild(card);
}

function renderKanbanCard(job, container) {
    const card = document.createElement('div');
    card.className = "draggable-card bg-white dark:bg-neon-gray-light p-4 rounded-lg border border-slate-300 dark:border-neon-border-light shadow-md hover:shadow-lg dark:hover:shadow-[0_0_10px_rgba(191,0,255,0.2)] hover:border-slate-400 dark:hover:border-neon-purple mb-3 transition-all active:cursor-grabbing group duration-200";
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
            <h4 class="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-primary-700 dark:group-hover:text-neon-purple transition-colors">${job.title}</h4>
        </div>
        <p class="text-xs text-slate-600 dark:text-gray-300 font-bold mb-3">${job.company}</p>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-neon-border">
            <span class="text-[10px] font-bold tracking-wide text-slate-500 dark:text-gray-300 bg-slate-50 dark:bg-neon-gray/50 px-2 py-1 rounded border border-slate-200 dark:border-neon-border">${status}</span>
            <i class="fa-solid fa-grip-lines text-slate-300 dark:text-gray-500 group-hover:text-slate-500 dark:group-hover:text-gray-400 cursor-grab"></i>
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

        let dotColor = isActive ? "bg-primary-500 dark:bg-neon-blue border-primary-500 dark:border-neon-blue shadow-sm dark:shadow-[0_0_8px_rgba(0,243,255,0.6)]" : "bg-white dark:bg-neon-gray border-slate-300 dark:border-neon-border-light";
        let textColor = isActive ? "text-slate-900 dark:text-white font-semibold" : "text-slate-400 dark:text-gray-500";

        if (isRejected) {
            dotColor = "bg-red-500 dark:bg-neon-pink border-red-500 dark:border-neon-pink dark:shadow-[0_0_8px_rgba(255,0,85,0.6)]";
            textColor = "text-red-600 dark:text-neon-pink font-bold";
        }

        const item = document.createElement('div');
        item.className = "relative flex gap-4 pb-8 last:pb-0 group";

        item.innerHTML = `
            <div class="relative z-10 flex-none w-6 h-6 rounded-full border-2 ${dotColor} flex items-center justify-center transition-colors mt-0.5">
                ${isActive ? '<i class="fa-solid fa-check text-white dark:text-black text-[10px]"></i>' : ''}
            </div>
            <div class="flex-1 -mt-1">
                <div class="flex justify-between items-start mb-1 cursor-pointer" onclick="toggleStatus(${jobId}, ${index})">
                    <span class="${textColor} text-sm transition-colors group-hover:text-primary-600 dark:group-hover:text-neon-blue">${statusItem.status}</span>
                    <span class="text-xs text-slate-400 dark:text-gray-500 font-mono">${statusItem.date_reached || '-'}</span>
                </div>
            </div>
        `;
        detailTimeline.appendChild(item);
    });
}
