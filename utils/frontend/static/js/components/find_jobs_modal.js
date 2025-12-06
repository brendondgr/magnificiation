const FindJobsModal = {
    _modalElement: null,
    _pollInterval: null,
    _config: {
        search_terms: [],
        job_titles: [],
        description_keywords: [],
        sites: [],
        hours_old: 24,
        results_wanted: 20
    },

    hoursOptions: [
        { value: 24, label: "24 hours (1 day)" },
        { value: 48, label: "48 hours (2 days)" },
        { value: 72, label: "72 hours (3 days)" },
        { value: 168, label: "168 hours (7 days)" },
        { value: 336, label: "336 hours (14 days)" },
        { value: 720, label: "720 hours (30 days)" }
    ],

    init() {
        this.render();
        this.attachEventListeners();
    },

    render() {
        if (this._modalElement) return;

        const html = `
            <div id="findJobsModal" class="modal-overlay">
                <div class="modal-content transition-all duration-300">
                    <!-- Config View -->
                    <div id="modalConfigView">
                        <!-- Header -->
                        <div class="modal-header">
                            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Find Jobs Configuration</h2>
                            <button class="modal-close text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <i class="fa-solid fa-times text-xl"></i>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="modal-body custom-scrollbar">
                            <!-- Search Terms -->
                            <div class="form-group">
                                <label class="form-label">Search Terms <span class="text-xs text-slate-500 font-normal">(What to search for)</span></label>
                                <div class="tag-input-container" id="searchTermsInput">
                                    <input type="text" class="tag-input-field" placeholder="Add search term and press Enter...">
                                </div>
                            </div>

                            <!-- Hours Old -->
                            <div class="form-group">
                                <label class="form-label">Job Posting Age</label>
                                <div class="flex items-center gap-4 mb-2">
                                    <input type="range" id="hoursOldSlider" min="0" max="5" step="1" class="flex-1">
                                    <span id="hoursOldDisplay" class="text-sm font-bold text-primary-600 dark:text-neon-blue w-32 text-right">24 hours</span>
                                </div>
                            </div>

                            <!-- Sites -->
                            <div class="form-group">
                                <label class="form-label">Sites to Scrape</label>
                                <div class="checkbox-grid" id="sitesContainer">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>
                            
                            <!-- Filters Divider -->
                            <div class="border-t border-slate-200 dark:border-neon-border my-6"></div>
                            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Filters</h3>

                            <!-- Job Title Keywords -->
                            <div class="form-group">
                                <label class="form-label">Title Keywords <span class="text-xs text-slate-500 font-normal">(Keep only jobs with these words in title)</span></label>
                                <div class="tag-input-container" id="jobTitlesInput">
                                    <input type="text" class="tag-input-field" placeholder="Add keyword...">
                                </div>
                            </div>

                            <!-- Description Keywords -->
                            <div class="form-group">
                                <label class="form-label">Description Keywords <span class="text-xs text-slate-500 font-normal">(Keep only jobs with these words in description)</span></label>
                                <div class="tag-input-container" id="descKeywordsInput">
                                    <input type="text" class="tag-input-field" placeholder="Add keyword...">
                                </div>
                            </div>
                            
                             <!-- Results Wanted -->
                            <div class="form-group">
                                <label class="form-label">Max Results Per Search</label>
                                <input type="number" id="resultsWantedInput" class="w-24 px-3 py-2 border border-slate-300 dark:border-neon-border rounded-lg bg-white dark:bg-neon-gray text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value="20" min="5" max="50">
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="modal-footer">
                            <button class="modal-close px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-neon-border/50 transition-colors">
                                Cancel
                            </button>
                            <button id="startScrapeBtn" class="px-6 py-2 rounded-lg text-sm font-bold bg-primary-600 dark:bg-neon-blue text-white dark:text-black hover:bg-primary-700 dark:hover:bg-cyan-400 shadow-md transition-all flex items-center gap-2">
                                 Start Scraping <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Progress View (Hidden initially) -->
                    <div id="modalProgressView" class="hidden h-full flex flex-col">
                        <div class="modal-header">
                            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Scraping in Progress</h2>
                        </div>
                        <div class="modal-body flex-1 flex flex-col justify-center items-center gap-6">
                            
                            <!-- Progress Ring/Icon -->
                            <div class="relative w-24 h-24">
                                <div class="absolute inset-0 border-4 border-slate-200 dark:border-neon-gray-light rounded-full"></div>
                                <div class="absolute inset-0 border-4 border-primary-500 dark:border-neon-blue rounded-full border-t-transparent animate-spin"></div>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span id="progressPercent" class="text-xl font-bold text-slate-700 dark:text-white">0%</span>
                                </div>
                            </div>

                            <!-- Status Text -->
                            <div class="text-center">
                                <h3 id="progressStage" class="text-lg font-bold text-slate-900 dark:text-white mb-2">Initializing...</h3>
                                <p id="progressMessage" class="text-sm text-slate-500 dark:text-gray-400 max-w-sm mx-auto">Please wait while we search for jobs...</p>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-2 gap-4 w-full max-w-sm">
                                <div class="bg-slate-50 dark:bg-neon-gray/50 p-4 rounded-lg text-center border border-slate-200 dark:border-neon-border">
                                    <div id="jobsFoundCount" class="text-2xl font-bold text-primary-600 dark:text-neon-blue">0</div>
                                    <div class="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Jobs Found</div>
                                </div>
                                <div class="bg-slate-50 dark:bg-neon-gray/50 p-4 rounded-lg text-center border border-slate-200 dark:border-neon-border">
                                    <div id="jobsSavedCount" class="text-2xl font-bold text-green-600 dark:text-neon-green">0</div>
                                    <div class="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">New Jobs</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Completed Actions -->
                        <div id="progressActions" class="modal-footer hidden">
                            <button id="progressCloseBtn" class="w-full px-6 py-2 rounded-lg text-sm font-bold bg-primary-600 dark:bg-neon-blue text-white dark:text-black hover:bg-primary-700 dark:hover:bg-cyan-400 transition-all">
                                View Jobs
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        this._modalElement = container.firstElementChild;
        document.body.appendChild(this._modalElement);

        // Render Sites options
        this.renderSitesOptions();
    },

    renderSitesOptions() {
        const sites = ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google"];
        const container = document.getElementById('sitesContainer');
        container.innerHTML = sites.map(site => `
            <label class="checkbox-item cursor-pointer">
                <input type="checkbox" name="site" value="${site}" class="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                <span class="capitalize">${site.replace('_', ' ')}</span>
            </label>
        `).join('');
    },

    attachEventListeners() {
        // Close buttons
        const closeBtns = this._modalElement.querySelectorAll('.modal-close');
        closeBtns.forEach(btn => btn.onclick = () => this.close());

        // Click outside (only if not scraping)
        this._modalElement.onclick = (e) => {
            if (e.target === this._modalElement && !this._pollInterval) this.close();
        };

        // Slider change
        const slider = document.getElementById('hoursOldSlider');
        slider.oninput = (e) => {
            const index = e.target.value;
            const option = this.hoursOptions[index];
            document.getElementById('hoursOldDisplay').innerText = option.label;
            document.getElementById('hoursOldDisplay').dataset.value = option.value;
        };

        // Tag Inputs
        this.setupTagInput('searchTermsInput', 'search_terms');
        this.setupTagInput('jobTitlesInput', 'job_titles');
        this.setupTagInput('descKeywordsInput', 'description_keywords');

        // Start Scrape
        document.getElementById('startScrapeBtn').onclick = () => this.saveAndStart();

        // Final Close
        document.getElementById('progressCloseBtn').onclick = () => {
            this.close();
            window.location.reload(); // Refresh to see new jobs
        };
    },

    setupTagInput(containerId, configKey) {
        const container = document.getElementById(containerId);
        const input = container.querySelector('input');

        const createTag = (text) => {
            if (!text || this._config[configKey].includes(text)) return;
            this._config[configKey].push(text);
            renderTags();
        };

        const removeTag = (text) => {
            this._config[configKey] = this._config[configKey].filter(t => t !== text);
            renderTags();
        };

        const renderTags = () => {
            const tags = container.querySelectorAll('.tag-pill');
            tags.forEach(t => t.remove());

            this._config[configKey].forEach(text => {
                const tag = document.createElement('div');
                tag.className = 'tag-pill';
                tag.innerHTML = `${text} <span class="tag-remove">&times;</span>`;
                tag.querySelector('.tag-remove').onclick = () => removeTag(text);
                container.insertBefore(tag, input);
            });
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                createTag(input.value.trim());
                input.value = '';
            } else if (e.key === 'Backspace' && input.value === '' && this._config[configKey].length > 0) {
                const lastTag = this._config[configKey][this._config[configKey].length - 1];
                removeTag(lastTag);
            }
        };
        renderTags();
    },

    async open() {
        await this.loadConfig();
        this.populateForm();
        this.switchView('config');
        this._modalElement.classList.add('active');
    },

    close() {
        if (this._pollInterval) {
            // Warn if scraping?
            if (!confirm("Scraping in progress. Are you sure you want to stop monitoring? The scrape will continue in the background.")) {
                return;
            }
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }
        this._modalElement.classList.remove('active');
    },

    switchView(view) {
        if (view === 'config') {
            document.getElementById('modalConfigView').classList.remove('hidden');
            document.getElementById('modalProgressView').classList.add('hidden');
        } else {
            document.getElementById('modalConfigView').classList.add('hidden');
            document.getElementById('modalProgressView').classList.remove('hidden');
            // Reset Progress UI
            document.getElementById('progressPercent').innerText = "0%";
            document.getElementById('progressStage').innerText = "Initializing...";
            document.getElementById('jobsFoundCount').innerText = "0";
            document.getElementById('jobsSavedCount').innerText = "0";
            document.getElementById('progressActions').classList.add('hidden');
        }
    },

    async loadConfig() {
        try {
            const response = await fetch('/api/config/load');
            const data = await response.json();
            this._config = { ...this._config, ...data };
        } catch (error) {
            console.error("Error loading config:", error);
        }
    },

    populateForm() {
        this.triggerTagRender('searchTermsInput', 'search_terms');
        this.triggerTagRender('jobTitlesInput', 'job_titles');
        this.triggerTagRender('descKeywordsInput', 'description_keywords');

        const slider = document.getElementById('hoursOldSlider');
        const hours = this._config.hours_old || 24;
        let closestIndex = 0;
        this.hoursOptions.forEach((opt, idx) => {
            if (opt.value <= hours) closestIndex = idx;
        });
        slider.value = closestIndex;
        document.getElementById('hoursOldDisplay').innerText = this.hoursOptions[closestIndex].label;

        document.getElementById('resultsWantedInput').value = this._config.results_wanted || 20;

        const sitesCheckboxes = document.querySelectorAll('input[name="site"]');
        sitesCheckboxes.forEach(cb => {
            cb.checked = this._config.sites.includes(cb.value);
        });
    },

    triggerTagRender(containerId, configKey) {
        // Helper to force render. 
        const container = document.getElementById(containerId);
        const input = container.querySelector('input');

        const removeTag = (text) => {
            this._config[configKey] = this._config[configKey].filter(t => t !== text);
            this.triggerTagRender(containerId, configKey);
        };

        const tags = container.querySelectorAll('.tag-pill');
        tags.forEach(t => t.remove());

        this._config[configKey].forEach(text => {
            const tag = document.createElement('div');
            tag.className = 'tag-pill';
            tag.innerHTML = `${text} <span class="tag-remove">&times;</span>`;
            tag.querySelector('.tag-remove').onclick = () => removeTag(text);
            container.insertBefore(tag, input);
        });
    },

    async saveAndStart() {
        const sites = Array.from(document.querySelectorAll('input[name="site"]:checked')).map(cb => cb.value);
        if (sites.length === 0) return alert("Please select at least one site.");
        if (this._config.search_terms.length === 0) return alert("Please add at least one search term.");

        const sliderIndex = document.getElementById('hoursOldSlider').value;
        const hoursOld = this.hoursOptions[sliderIndex].value;
        const resultsWanted = parseInt(document.getElementById('resultsWantedInput').value);

        const configToSave = {
            ...this._config,
            sites: sites,
            hours_old: hoursOld,
            results_wanted: resultsWanted
        };

        try {
            const saveRes = await fetch('/api/config/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configToSave)
            });
            const saveResult = await saveRes.json();

            if (!saveResult.success) {
                alert("Failed to save config: " + saveResult.message);
                return;
            }

            this.switchView('progress');

            // Start Scraping
            const scrapeRes = await fetch('/api/scrape/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ use_config: true })
            });
            const scrapeData = await scrapeRes.json();

            if (scrapeData.success) {
                this.startPolling(scrapeData.job_id);
            } else {
                alert("Failed to start scraping: " + scrapeData.message);
                this.switchView('config');
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred.");
            this.switchView('config');
        }
    },

    startPolling(jobId) {
        this._pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scrape/status/${jobId}`);
                const data = await res.json();

                this.updateProgressUI(data);

                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(this._pollInterval);
                    this._pollInterval = null;
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, 1000); // 1 second interval
    },

    updateProgressUI(data) {
        const stage = data.progress.stage;
        const percent = data.progress.percent || 0;
        const details = data.progress.details || {};

        document.getElementById('progressPercent').innerText = `${Math.round(percent)}%`;
        document.getElementById('progressStage').innerText = this.formatStage(stage);

        if (details.message) {
            document.getElementById('progressMessage').innerText = details.message;
        }

        if (data.status === 'completed') {
            const results = data.results;
            const processed = results.steps?.processing?.processed_count || 0;
            const saved = results.steps?.storage?.stored_count || 0;

            document.getElementById('jobsFoundCount').innerText = processed;
            document.getElementById('jobsSavedCount').innerText = saved;

            document.getElementById('progressActions').classList.remove('hidden');
            document.getElementById('progressStage').innerText = "Scraping Completed";
            document.getElementById('progressMessage').innerText = `Found ${processed} unique jobs. Added ${saved} new jobs.`;
        } else if (data.status === 'failed') {
            document.getElementById('progressStage').innerText = "Scraping Failed";
            document.getElementById('progressStage').classList.add('text-red-500');
            document.getElementById('progressActions').classList.remove('hidden'); // Allow close
            document.getElementById('progressCloseBtn').innerText = "Close";
            document.getElementById('progressCloseBtn').onclick = () => this.close();
        }
    },

    formatStage(stage) {
        if (!stage) return "Processing...";
        return stage.charAt(0).toUpperCase() + stage.slice(1);
    }
};

// Initiate
document.addEventListener('DOMContentLoaded', () => {
    FindJobsModal.init();
    window.FindJobsModal = FindJobsModal;
});
