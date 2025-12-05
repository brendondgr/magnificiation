# Frontend Structure - Magnification

## Overview
The frontend has been modularized to improve maintainability and code organization. All components are now separated into dedicated CSS, JavaScript, and HTML template files.

---

## Directory Structure

```
utils/frontend/
├── static/
│   ├── css/
│   │   ├── main.css              # Base styles, scrollbar, animations
│   │   └── components.css        # Timeline, kanban, drag-drop styles
│   │
│   ├── js/
│   │   ├── data.js               # Mock data and constants
│   │   ├── helpers.js            # Utility/helper functions
│   │   ├── renderers.js          # Rendering functions for UI
│   │   ├── handlers.js           # Event handlers and interactions
│   │   └── app.js                # Main initialization
│   │
│   └── images/                   # Image assets
│
└── templates/
    ├── index.html                # Main entry point (loads all parts)
    │
    ├── parts/                    # Reusable UI components
    │   ├── header.html           # Top navigation bar
    │   ├── mobile-nav.html       # Bottom mobile navigation
    │   ├── sidebar.html          # Desktop filters sidebar
    │   └── job-detail-panel.html # Job detail slide-over panel
    │
    └── primary/                  # Main view sections
        ├── new-jobs.html         # New jobs grid view
        └── tracker.html          # Kanban tracker view
```

---

## File Responsibilities

### CSS Files

#### `static/css/main.css`
- Base body styles
- Custom scrollbar styling
- Fade-in animation definitions
- Global typography

#### `static/css/components.css`
- Timeline connector styles
- Kanban column styles
- Drag-and-drop interaction styles
- Component-specific visual effects

---

### JavaScript Files

#### `static/js/data.js`
- `STATUS_DEFINITIONS` - Array of all possible job statuses
- `createStatus()` - Helper to create status objects
- `jobsData` - Mock job listings array

#### `static/js/helpers.js`
- `isJobNew()` - Checks if a job is new/unapplied
- `getCurrentStatus()` - Gets the current status of a job

#### `static/js/renderers.js`
- `initializeColumns()` - Initializes kanban column references
- `renderAll()` - Main render function for all views
- `renderNewJobCard()` - Renders individual job cards
- `renderKanbanCard()` - Renders kanban board cards
- `renderTimeline()` - Renders job status timeline

#### `static/js/handlers.js`
- `allowDrop()` - Drag-and-drop handler
- `drop()` - Drop event handler with status updates
- `applyJob()` - Marks a job as applied
- `ignoreJob()` - Ignores/hides a job
- `switchTab()` - Switches between views
- `openJobDetails()` - Opens job detail panel
- `closePanel()` - Closes job detail panel
- `toggleStatus()` - Toggles job status in timeline

#### `static/js/app.js`
- Main entry point
- DOM ready initialization
- Calls `initializeColumns()` and `renderAll()`

---

### HTML Templates

#### `templates/index.html`
- Main HTML document
- Includes all CSS and JS files
- Loads HTML partials dynamically via fetch API
- Contains Tailwind config

#### `templates/parts/` - Reusable Components

**header.html**
- Top navigation bar
- Logo and app title
- Desktop tab buttons (New Jobs / Tracker)
- "Find Jobs" action button

**mobile-nav.html**
- Fixed bottom navigation for mobile
- Icon-based tab switching
- Responsive visibility (hidden on desktop)

**sidebar.html**
- Desktop-only filters sidebar
- Search input field
- Future: Additional filter options

**job-detail-panel.html**
- Slide-over panel from right
- Job details header with title/company
- Quick stats (compensation, location)
- Interactive status timeline
- Job description
- Action buttons (Close, Open Link)
- Backdrop overlay

#### `templates/primary/` - Main Views

**new-jobs.html**
- Grid layout for new job cards
- Header with job count
- Container for dynamically rendered cards

**tracker.html**
- Kanban board layout
- 4 columns: Applied, Interviewing, Offers, Archived
- Drag-and-drop zones
- Status counts per column

---

## Loading Sequence

1. **HTML Load**: Browser loads `index.html`
2. **CSS Load**: `main.css` and `components.css` are loaded
3. **Tailwind Config**: Inline script configures Tailwind theme
4. **External Libraries**: FontAwesome and Google Fonts load
5. **JS Load** (in order):
   - `data.js` - Mock data available
   - `helpers.js` - Helper functions available
   - `renderers.js` - Render functions available
   - `handlers.js` - Event handlers available
   - `app.js` - Initializes app
6. **Partial Load**: Fetch API loads all HTML partials into containers
7. **DOMContentLoaded**: `app.js` initializes columns and renders

---

## Benefits of This Structure

✅ **Modularity**: Each file has a single, clear responsibility  
✅ **Maintainability**: Easy to locate and update specific features  
✅ **Reusability**: Components can be reused across pages  
✅ **Scalability**: Easy to add new views, components, or features  
✅ **Collaboration**: Multiple developers can work on different files  
✅ **Debugging**: Isolated components are easier to troubleshoot  
✅ **Performance**: Can cache static assets separately  

---

## Adding New Features

### To add a new view:
1. Create HTML in `templates/primary/your-view.html`
2. Add container in `index.html`
3. Load it via `loadPartial()` in the script section

### To add a new component:
1. Create HTML in `templates/parts/your-component.html`
2. Add container in `index.html` or relevant view
3. Load it via `loadPartial()`

### To add new styles:
1. For global styles → `static/css/main.css`
2. For component styles → `static/css/components.css`
3. Or create a new CSS file and link it in `index.html`

### To add new JavaScript:
1. For data/constants → `static/js/data.js`
2. For utilities → `static/js/helpers.js`
3. For rendering → `static/js/renderers.js`
4. For interactions → `static/js/handlers.js`
5. Or create a new JS file and include it before `app.js`

---

## Notes

- Ensure proper load order for JavaScript files (dependencies first)
- HTML partials load asynchronously but wait for all before rendering
- Tailwind config remains inline for CDN compatibility
- Consider using a template engine (Jinja2) for server-side includes in production
