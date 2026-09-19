// Project Roster
const primaryProjects = [
    { name: "Projects Hub", icon: "fa-solid fa-globe", url: "https://ou1ts.github.io/portal" },
    { name: "Resource Archive", icon: "fa-solid fa-boxes-packing", url: "https://b1tacad.netlify.app/" },
    { name: "Courses Mastery", icon: "fa-regular fa-compass", url: "https://ou1ts.github.io/course/" },
    { name: "Question Bank", icon: "fa-solid fa-file-circle-question", url: "https://ou1ts.github.io/qbank/" },
    { name: "Academic Scheduler", icon: "fa-solid fa-calendar-days", url: "https://b1tsched.netlify.app/" },
    { name: "Dev lab", icon: "fa-solid fa-code", url: "https://ou1ts.github.io/dev/" },
    { name: "English Speaking", icon: "fa-regular fa-comments", url: "https://ou1ts.github.io/english/" },
    { name: "Event Raids", icon: "fa-solid fa-location-dot", url: "https://ou1ts.github.io/events/" },
    { name: "Job Hunters", icon: "fa-solid fa-briefcase", url: "https://ou1ts.github.io/job/" },
    { name: "Blood Donation", icon: "fa-solid fa-droplet", url: "https://bd-ou1ts.netlify.app/" },
    { name: "Gym Bros", icon: "fa-solid fa-dumbbell", url: "#" },
    { name: "Bus Tracker", icon: "fa-solid fa-van-shuttle", url: "#" },
    { name: "Wiki", icon: "fa-solid fa-book", url: "wiki.html" }

    // ,{ name: "", icon: "", url: "" }
];

// Create animated stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    const starCount = 80;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

// Create floating elements
function createFloatingElements() {
    const container = document.querySelector('.floating-elements');
    if (!container) return;
    const elementCount = 6;

    for (let i = 0; i < elementCount; i++) {
        const circle = document.createElement('div');
        circle.className = 'floating-circle';
        const size = Math.random() * 80 + 40;
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = Math.random() * 100 + '%';
        circle.style.top = Math.random() * 100 + '%';
        circle.style.animationDelay = Math.random() * 6 + 's';
        circle.style.animationDuration = (Math.random() * 6 + 6) + 's';
        container.appendChild(circle);
    }
}

// Render dynamic project cells in a 4-row grid copy setup
function renderProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    // 1. Prepare projects list with blank padding
    let items = [...primaryProjects];
    const minCells = 16; // 4x4 desktop grid view requirement

    // Pad to multiple of 4 (for 4 rows)
    while (items.length % 4 !== 0) {
        items.push({ isBlank: true });
    }

    // Pad to ensure it covers at least the minimum cells
    while (items.length < minCells) {
        items.push({ isBlank: true });
        items.push({ isBlank: true });
        items.push({ isBlank: true });
        items.push({ isBlank: true });
    }

    // 2. Clone the column set twice for infinite scrolling: [Copy 1][Copy 2][Copy 3]
    const tripleItems = [...items, ...items, ...items];

    // 3. Render HTML
    grid.innerHTML = '';
    tripleItems.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'project-cell';

        if (item.isBlank) {
            cell.innerHTML = `
                <div class="project-squircle-link blank">
                    <span class="cell-icon"></span>
                    <span class="cell-title"></span>
                </div>
            `;
        } else {
            cell.innerHTML = `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="project-squircle-link">
                    <span class="cell-icon"><i class="${item.icon}"></i></span>
                    <span class="cell-title">${item.name}</span>
                </a>
            `;
        }
        grid.appendChild(cell);
    });
}

// Infinite Scroller Functionality with Inertial Momentum (Glide Animation)
function initInfiniteScroller() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // Inertia variables
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let animationFrameId = null;
    const friction = 0.95; // Glide decay factor

    function startInertia() {
        if (Math.abs(velocity) < 0.1) {
            cancelAnimationFrame(animationFrameId);
            return;
        }
        grid.scrollLeft -= velocity;
        velocity *= friction;
        animationFrameId = requestAnimationFrame(startInertia);
    }

    // Scroll seamless jump logic
    grid.addEventListener('scroll', () => {
        const copyWidth = grid.scrollWidth / 3;
        const currentScroll = grid.scrollLeft;

        // Reset scroll position seamlessly if it crosses copy boundaries
        if (currentScroll <= 0.2 * copyWidth) {
            grid.scrollLeft += copyWidth;
        } else if (currentScroll >= 1.8 * copyWidth) {
            grid.scrollLeft -= copyWidth;
        }
    });

    // Mouse drag-to-scroll mechanics
    grid.addEventListener('mousedown', (e) => {
        if (e.target.closest('a')) return;
        isDown = true;
        grid.classList.add('active-drag');
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;

        // Stop any active glide animation immediately on press
        cancelAnimationFrame(animationFrameId);
        velocity = 0;
        lastX = e.pageX;
        lastTime = Date.now();
    });

    grid.addEventListener('mouseleave', () => {
        if (isDown) {
            isDown = false;
            grid.classList.remove('active-drag');
            animationFrameId = requestAnimationFrame(startInertia);
        }
    });

    grid.addEventListener('mouseup', () => {
        if (isDown) {
            isDown = false;
            grid.classList.remove('active-drag');
            animationFrameId = requestAnimationFrame(startInertia);
        }
    });

    grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();

        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag sensitivity
        grid.scrollLeft = scrollLeft - walk;

        // Track displacement and time delta to compute drag velocity
        const now = Date.now();
        const dt = now - lastTime;
        if (dt > 0) {
            const dx = e.pageX - lastX;
            velocity = dx * 0.8; // Momentum velocity scaling
        }
        lastX = e.pageX;
        lastTime = now;
    });

    // Desktop Arrow Navigation Controls
    const prevBtn = document.getElementById('prevArrow');
    const nextBtn = document.getElementById('nextArrow');
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            const colWidth = grid.scrollWidth / 3 / 4; // Width of a single column cell
            cancelAnimationFrame(animationFrameId);
            velocity = 0;
            grid.scrollBy({ left: -colWidth, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            const colWidth = grid.scrollWidth / 3 / 4; // Width of a single column cell
            cancelAnimationFrame(animationFrameId);
            velocity = 0;
            grid.scrollBy({ left: colWidth, behavior: 'smooth' });
        });
    }
}

// SPA Navigation (True Tabbed System)
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    const sidebarLinks = document.querySelectorAll('.sidebar-links .sidebar-link');
    const sections = document.querySelectorAll('.spa-section');
    const browseFeatures = document.getElementById('browseFeatures');

    // Sidebar selectors
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        hamburgerBtn.classList.toggle('open');
        sidebarMenu.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
    }

    function closeSidebar() {
        hamburgerBtn.classList.remove('open');
        sidebarMenu.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Tab switcher logic
    function switchTab(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        // Update active class on nav links (header & sidebar)
        document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === targetId);
        });

        // Toggle sections active states
        sections.forEach(sec => {
            sec.classList.remove('active');
        });
        targetSection.classList.add('active');

        // Reset scroll position to top
        window.scrollTo(0, 0);
        targetSection.scrollTop = 0;

        // Update window hash URL safely without jump
        try {
            history.pushState(null, null, targetId);
        } catch (e) {
            console.warn("Could not pushState (likely local file:// origin):", e);
            if (window.location.hash !== targetId) {
                window.location.hash = targetId;
            }
        }

        // Reset projects scroller left offset when shown
        if (targetId === '#projects') {
            setTimeout(() => {
                const grid = document.getElementById('projectsGrid');
                if (grid) {
                    const copyWidth = grid.scrollWidth / 3;
                    grid.scrollLeft = copyWidth;
                }
            }, 60);
        }
    }

    // Expose switchTab globally for programmatic redirects
    window.switchTab = switchTab;

    // Bind link event listeners with delegation safety
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                switchTab(targetId);
            }
        });
    });

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                switchTab(targetId);
                closeSidebar();
            }
        });
    });

    // Logo anchors (header + sidebar) always navigate to #home
    document.querySelectorAll('.nav-logo, .sidebar-logo-link').forEach(logo => {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('#home');
            closeSidebar();
        });
    });

    // Browse Features CTA button on Home section
    if (browseFeatures) {
        browseFeatures.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('#projects');
        });
    }

    // Join oU1TS buttons (rationale card + sidebar)
    document.querySelectorAll('.rationale-join-btn, .sidebar-join-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                switchTab(targetId);
                closeSidebar();
            }
        });
    });

    // Respond to hash and popstate changes (browser Back/Forward navigation)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash || '#home';
        if (['#home', '#projects', '#repos', '#about', '#auth', '#profile'].includes(hash)) {
            switchTab(hash);
        }
    });

    window.addEventListener('popstate', () => {
        const hash = window.location.hash || '#home';
        if (['#home', '#projects', '#repos', '#about', '#auth', '#profile'].includes(hash)) {
            switchTab(hash);
        }
    });

    // Handle initial hash on page load
    function handleInitialHash() {
        const hash = window.location.hash || '';
        const search = window.location.search || '';

        // If returning from an auth redirect (PKCE code or token hash) or profile requested, route to #profile
        if (search.includes('code=') || hash.includes('access_token=') || hash.includes('profile')) {
            switchTab('#profile');
            return;
        }

        const validHash = hash || '#home';
        if (['#home', '#projects', '#repos', '#about', '#auth', '#profile'].includes(validHash)) {
            switchTab(validHash);
        }
    }

    handleInitialHash();
}

// Light/Dark Theme Switcher
function initThemeSwitcher() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Load preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    // Toggle on click
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
    });
}

// Parallax movement for background elements on mouse hover
function initParallax() {
    let throttleTimer;
    window.addEventListener('mousemove', (e) => {
        if (throttleTimer) return;

        throttleTimer = setTimeout(() => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            const floatingElements = document.querySelectorAll('.floating-circle');
            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.015;
                const x = (mouseX - 0.5) * speed * 80;
                const y = (mouseY - 0.5) * speed * 80;
                element.style.transform = `translate(${x}px, ${y}px)`;
            });
            throttleTimer = null;
        }, 30);
    });
}

// ==========================================
// 5. Custom Responsive Dropdowns (2-Line Wrapping & Viewport Constrained)
// ==========================================

function initCustomDropdowns() {
    const selects = document.querySelectorAll('.input-wrapper select');
    selects.forEach(select => {
        if (select.dataset.customDropdownInit === 'true') return;
        select.dataset.customDropdownInit = 'true';

        const parentWrapper = select.closest('.input-wrapper');
        if (!parentWrapper) return;

        // Apply visually hidden accessible styling to native select
        select.classList.add('visually-hidden-select');
        select.setAttribute('tabindex', '-1');

        // Create container
        const container = document.createElement('div');
        container.className = 'custom-select-container';

        // Trigger button
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const label = document.createElement('span');
        label.className = 'custom-select-label';

        const arrow = document.createElement('i');
        arrow.className = 'fa-solid fa-chevron-down custom-select-arrow';

        trigger.appendChild(label);
        trigger.appendChild(arrow);

        // Menu list
        const menu = document.createElement('ul');
        menu.className = 'custom-select-menu';
        menu.setAttribute('role', 'listbox');

        function syncUI() {
            const selectedOpt = select.options[select.selectedIndex];
            const hasVal = selectedOpt && selectedOpt.value !== '';
            label.textContent = hasVal ? selectedOpt.text : (select.options[0]?.text || 'Select an option');
            if (hasVal) {
                label.classList.remove('placeholder');
            } else {
                label.classList.add('placeholder');
            }

            menu.querySelectorAll('.custom-select-option').forEach(li => {
                if (li.dataset.value === select.value) {
                    li.classList.add('selected');
                    li.setAttribute('aria-selected', 'true');
                } else {
                    li.classList.remove('selected');
                    li.setAttribute('aria-selected', 'false');
                }
            });
        }

        // Build list items from options
        Array.from(select.options).forEach(opt => {
            if (opt.disabled && opt.value === '') {
                return; // placeholder option skipped in menu
            }

            const li = document.createElement('li');
            li.className = 'custom-select-option';
            li.setAttribute('role', 'option');
            li.setAttribute('tabindex', '0');
            li.dataset.value = opt.value;
            li.textContent = opt.text;

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                select.value = opt.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                syncUI();
                close();
                trigger.focus();
            });

            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    li.click();
                }
            });

            menu.appendChild(li);
        });

        function open() {
            document.querySelectorAll('.custom-select-container.open').forEach(c => {
                if (c !== container) {
                    c.classList.remove('open');
                    const t = c.querySelector('.custom-select-trigger');
                    if (t) t.setAttribute('aria-expanded', 'false');
                }
            });
            container.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
        }

        function close() {
            container.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (container.classList.contains('open')) {
                close();
            } else {
                open();
            }
        });

        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!container.classList.contains('open')) {
                    open();
                }
                const firstOpt = menu.querySelector('.custom-select-option');
                if (firstOpt) firstOpt.focus();
            } else if (e.key === 'Escape') {
                close();
            }
        });

        select.addEventListener('change', syncUI);

        syncUI();

        container.appendChild(trigger);
        container.appendChild(menu);
        parentWrapper.appendChild(container);

        select._updateCustomDropdown = syncUI;
    });

    if (!window._customSelectGlobalCloseHandler) {
        window._customSelectGlobalCloseHandler = true;
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-container')) {
                document.querySelectorAll('.custom-select-container.open').forEach(c => {
                    c.classList.remove('open');
                    const t = c.querySelector('.custom-select-trigger');
                    if (t) t.setAttribute('aria-expanded', 'false');
                });
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.custom-select-container.open').forEach(c => {
                    c.classList.remove('open');
                    const t = c.querySelector('.custom-select-trigger');
                    if (t) t.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }
}

// ==========================================
// 5.1 Initiatives Performance Metrics & Profile Window Switcher
// ==========================================

const projectPerformanceMetrics = {
    "Projects Hub": {
        category: "Ecosystem Core",
        status: "Operational",
        statusType: "online",
        healthScore: 99.9,
        summary: "Central gateway & navigation matrix linking all student initiatives.",
        kpis: [
            { label: "Active Nodes", value: "13 Services", trend: "100% Up" },
            { label: "Monthly Visits", value: "14.2k", trend: "↑ 18%" },
            { label: "Uptime", value: "99.9%", trend: "Optimal" },
            { label: "Community Rating", value: "4.9 / 5.0", trend: "★ 4.9" }
        ]
    },
    "Resource Archive": {
        category: "Academics & Study",
        status: "Operational",
        statusType: "online",
        healthScore: 98.6,
        summary: "Curated lecture slides, lab manuals, notes, and academic papers.",
        kpis: [
            { label: "Curated Docs", value: "1,450+ PDFs", trend: "↑ 85 new" },
            { label: "Bandwidth Served", value: "88.4 GB", trend: "High Def" },
            { label: "Downloads", value: "5.8k / mo", trend: "↑ 24%" },
            { label: "Redundancy", value: "99.8%", trend: "Multi-CDN" }
        ]
    },
    "Courses Mastery": {
        category: "Learning Pathways",
        status: "Operational",
        statusType: "online",
        healthScore: 97.4,
        summary: "Structured curriculum tracks, video walkthroughs, and learning guides.",
        kpis: [
            { label: "Curated Tracks", value: "38 Courses", trend: "8 Depts" },
            { label: "Content Hours", value: "460+ hrs", trend: "Indexed" },
            { label: "Completion Rate", value: "84.2%", trend: "↑ 6.5%" },
            { label: "Active Learners", value: "1.9k", trend: "Enrolled" }
        ]
    },
    "Question Bank": {
        category: "Examination Prep",
        status: "Operational",
        statusType: "online",
        healthScore: 99.1,
        summary: "Midterm and final exam question archive with verified student solutions.",
        kpis: [
            { label: "Past Exam Papers", value: "620 Papers", trend: "6 Semesters" },
            { label: "Solutions Verified", value: "96.4%", trend: "Peer-reviewed" },
            { label: "Search Queries", value: "24.5k", trend: "Exam spike" },
            { label: "Coverage", value: "8 Departments", trend: "100%" }
        ]
    },
    "Academic Scheduler": {
        category: "Smart Campus",
        status: "Operational",
        statusType: "online",
        healthScore: 99.5,
        summary: "Conflict-free timetable generator, class alerts, and calendar sync.",
        kpis: [
            { label: "Routine Syncs", value: "2.4k Students", trend: "↑ 22%" },
            { label: "Conflict Rate", value: "0.0%", trend: "Zero clash" },
            { label: "Batch Routines", value: "14 Batches", trend: "Live update" },
            { label: "Lookup Latency", value: "35 ms", trend: "Edge cache" }
        ]
    },
    "Dev lab": {
        category: "Engineering & OSS",
        status: "Operational",
        statusType: "online",
        healthScore: 98.9,
        summary: "Collaborative open-source incubator for campus developers.",
        kpis: [
            { label: "Linked Repos", value: "26 Repos", trend: "GitHub OSS" },
            { label: "Monthly Commits", value: "390+ commits", trend: "↑ 32%" },
            { label: "Merged PRs", value: "48 PRs", trend: "Active" },
            { label: "Contributors", value: "65 Developers", trend: "Growing" }
        ]
    },
    "English Speaking": {
        category: "Skill Development",
        status: "Operational",
        statusType: "online",
        healthScore: 96.8,
        summary: "Peer-to-peer audio discussions, vocabulary builders, and IELTS circles.",
        kpis: [
            { label: "Daily Voice Rooms", value: "8 Sessions", trend: "Active" },
            { label: "Practice Time", value: "740+ Hours", trend: "↑ 40 hrs/wk" },
            { label: "Fluency Growth", value: "+32% Avg", trend: "Measured" },
            { label: "Active Speakers", value: "360 Members", trend: "↑ 18%" }
        ]
    },
    "Event Raids": {
        category: "Campus Events",
        status: "Operational",
        statusType: "online",
        healthScore: 98.0,
        summary: "Hackathons, campus workshops, and tech raid coordination.",
        kpis: [
            { label: "Events Hosted", value: "18 Raids", trend: "100% Success" },
            { label: "Total Turnout", value: "1,680 Students", trend: "Cross-campus" },
            { label: "RSVP Attendance", value: "97.8%", trend: "High loyalty" },
            { label: "Upcoming Raids", value: "3 Scheduled", trend: "Next: Oct" }
        ]
    },
    "Job Hunters": {
        category: "Career & Placement",
        status: "Operational",
        statusType: "online",
        healthScore: 97.2,
        summary: "Internship board, alumni referrals, and CV polishing workshops.",
        kpis: [
            { label: "Live Postings", value: "54 Openings", trend: "Tech & BBA" },
            { label: "Alumni Referrals", value: "135 Matched", trend: "↑ 28%" },
            { label: "Resumes Reviewed", value: "320+ CVs", trend: "Polished" },
            { label: "Placement Rate", value: "82.4%", trend: "Hired" }
        ]
    },
    "Blood Donation": {
        category: "Community Welfare",
        status: "Operational",
        statusType: "online",
        healthScore: 99.7,
        summary: "Emergency blood donor network connecting students in critical need.",
        kpis: [
            { label: "Verified Donors", value: "348 Donors", trend: "All groups" },
            { label: "Response Time", value: "< 12 Mins", trend: "Emergency" },
            { label: "Fulfilled Cases", value: "97.5%", trend: "186 Lives" },
            { label: "Donor Readiness", value: "100% On-call", trend: "Active" }
        ]
    },
    "Gym Bros": {
        category: "Fitness & Lifestyle",
        status: "Beta Testing",
        statusType: "beta",
        healthScore: 92.5,
        summary: "Workout splits, nutrition calculators, and personal record trackers.",
        kpis: [
            { label: "Curated Splits", value: "24 Programs", trend: "PPL / Upper" },
            { label: "PRs Logged", value: "980+ Records", trend: "↑ 120 mo" },
            { label: "Active Athletes", value: "440 Members", trend: "↑ 14%" },
            { label: "Streak Retention", value: "88.6%", trend: "Consistent" }
        ]
    },
    "Bus Tracker": {
        category: "Transit Telemetry",
        status: "In Development",
        statusType: "dev",
        healthScore: 91.0,
        summary: "Live GPS campus bus route telemetry and ETA estimation.",
        kpis: [
            { label: "Campus Routes", value: "5 Lines", trend: "Dhaka Metro" },
            { label: "GPS Telemetry", value: "10s Frequency", trend: "Low latency" },
            { label: "On-Time Ratio", value: "93.8%", trend: "Traffic-adj" },
            { label: "Daily Commuters", value: "1.3k Riders", trend: "Targeted" }
        ]
    },
    "Wiki": {
        category: "Knowledge Base",
        status: "Operational",
        statusType: "online",
        healthScore: 98.4,
        summary: "Community-maintained documentation, FAQs, and campus guidelines.",
        kpis: [
            { label: "Articles Published", value: "215 Docs", trend: "↑ 16 new" },
            { label: "Curators", value: "52 Contributors", trend: "Verified" },
            { label: "Weekly Reads", value: "2.1k Views", trend: "↑ 30%" },
            { label: "Access Level", value: "100% Public", trend: "Open license" }
        ]
    }
};

let currentMetricsGalleryIndex = 0;

function updateMetricsGalleryView() {
    const grid = document.getElementById('projectMetricsGrid');
    const curIdxEl = document.getElementById('galleryCurrentIndex');
    const totalCountEl = document.getElementById('galleryTotalCount');
    if (!grid) return;

    const cards = grid.querySelectorAll('.project-metric-card');
    const total = cards.length;
    if (total === 0) return;

    if (currentMetricsGalleryIndex < 0) currentMetricsGalleryIndex = total - 1;
    if (currentMetricsGalleryIndex >= total) currentMetricsGalleryIndex = 0;

    cards.forEach((card, idx) => {
        if (idx === currentMetricsGalleryIndex) {
            card.classList.add('active-gallery-card');
        } else {
            card.classList.remove('active-gallery-card');
        }
    });

    if (curIdxEl) {
        curIdxEl.textContent = String(currentMetricsGalleryIndex + 1).padStart(2, '0');
    }
    if (totalCountEl) {
        totalCountEl.textContent = String(total).padStart(2, '0');
    }

    // Synchronize active item in directory modal if open
    document.querySelectorAll('.metrics-modal-item').forEach(item => {
        const itemIdx = parseInt(item.dataset.index, 10);
        if (itemIdx === currentMetricsGalleryIndex) {
            item.classList.add('active-item');
        } else {
            item.classList.remove('active-item');
        }
    });
}

function jumpToProjectMetric(index) {
    currentMetricsGalleryIndex = index;
    updateMetricsGalleryView();
    closeMetricsModal();

    // On desktop, scroll smoothly to the card and trigger highlight pulse
    if (window.innerWidth > 768) {
        const grid = document.getElementById('projectMetricsGrid');
        if (grid) {
            const cards = grid.querySelectorAll('.project-metric-card');
            if (cards[index]) {
                cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                cards[index].classList.remove('highlight-pulse');
                void cards[index].offsetWidth; // force DOM reflow
                cards[index].classList.add('highlight-pulse');
                setTimeout(() => {
                    cards[index].classList.remove('highlight-pulse');
                }, 1500);
            }
        }
    }
}

function openMetricsModal() {
    const modal = document.getElementById('metricsJumpModal');
    const searchInput = document.getElementById('metricsModalSearch');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    renderMetricsModalList('');

    if (searchInput) {
        searchInput.value = '';
        setTimeout(() => searchInput.focus(), 50);
    }
}

function closeMetricsModal() {
    const modal = document.getElementById('metricsJumpModal');
    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function renderMetricsModalList(query = '') {
    const listEl = document.getElementById('metricsModalList');
    if (!listEl) return;

    listEl.innerHTML = '';
    const q = query.trim().toLowerCase();

    let matchCount = 0;

    primaryProjects.forEach((proj, idx) => {
        if (!proj.name) return;
        const metrics = projectPerformanceMetrics[proj.name] || {
            category: "Initiative",
            status: "Operational",
            statusType: "online",
            healthScore: 98.0
        };

        const nameMatch = proj.name.toLowerCase().includes(q);
        const catMatch = (metrics.category || '').toLowerCase().includes(q);
        const statusMatch = (metrics.status || '').toLowerCase().includes(q);

        if (q && !nameMatch && !catMatch && !statusMatch) return;

        matchCount++;

        const item = document.createElement('div');
        item.className = 'metrics-modal-item' + (idx === currentMetricsGalleryIndex ? ' active-item' : '');
        item.dataset.index = idx;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');

        item.innerHTML = `
            <div class="m-item-left">
                <div class="m-item-icon">
                    <i class="${proj.icon}"></i>
                </div>
                <div class="m-item-info">
                    <div class="m-item-name">${proj.name}</div>
                    <div class="m-item-cat">${metrics.category}</div>
                </div>
            </div>
            <div class="m-item-right">
                <span class="pm-status-badge ${metrics.statusType}">
                    <span class="pm-dot"></span>
                    ${metrics.status}
                </span>
                <span class="m-item-health">${metrics.healthScore}%</span>
            </div>
        `;

        item.addEventListener('click', () => {
            jumpToProjectMetric(idx);
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                jumpToProjectMetric(idx);
            }
        });

        listEl.appendChild(item);
    });

    if (matchCount === 0) {
        listEl.innerHTML = `<div class="metrics-modal-empty"><i class="fa-solid fa-magnifying-glass" style="margin-right: 6px;"></i> No initiatives found matching "${query}"</div>`;
    }
}

function initMetricsGalleryAndModal() {
    const prevBtn = document.getElementById('metricsGalleryPrevBtn');
    const nextBtn = document.getElementById('metricsGalleryNextBtn');
    const jumpBtn = document.getElementById('dashboardQuickJumpBtn');
    const closeBtn = document.getElementById('closeMetricsModalBtn');
    const backdrop = document.getElementById('metricsModalBackdrop');
    const searchInput = document.getElementById('metricsModalSearch');
    const grid = document.getElementById('projectMetricsGrid');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const cards = document.querySelectorAll('.project-metric-card');
            const total = cards.length || primaryProjects.length;
            currentMetricsGalleryIndex = (currentMetricsGalleryIndex - 1 + total) % total;
            updateMetricsGalleryView();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cards = document.querySelectorAll('.project-metric-card');
            const total = cards.length || primaryProjects.length;
            currentMetricsGalleryIndex = (currentMetricsGalleryIndex + 1) % total;
            updateMetricsGalleryView();
        });
    }

    // Touch swipe gesture support for mobile gallery
    if (grid) {
        let touchStartX = 0;
        let touchStartY = 0;

        grid.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        grid.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const diffX = e.changedTouches[0].clientX - touchStartX;
                const diffY = e.changedTouches[0].clientY - touchStartY;

                // Horizontal swipe detected (more horizontal than vertical, and > 40px)
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    const cards = document.querySelectorAll('.project-metric-card');
                    const total = cards.length || primaryProjects.length;
                    if (diffX < 0) {
                        // Swipe left -> Next
                        currentMetricsGalleryIndex = (currentMetricsGalleryIndex + 1) % total;
                    } else {
                        // Swipe right -> Prev
                        currentMetricsGalleryIndex = (currentMetricsGalleryIndex - 1 + total) % total;
                    }
                    updateMetricsGalleryView();
                }
            }
        }, { passive: true });
    }

    // Quick Jump Modal triggers
    if (jumpBtn) {
        jumpBtn.addEventListener('click', openMetricsModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMetricsModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeMetricsModal);
    }
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderMetricsModalList(e.target.value);
        });
    }

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('metricsJumpModal');
            if (modal && modal.style.display !== 'none') {
                closeMetricsModal();
            }
        }
    });
}

function renderProjectMetricsDashboard() {
    const grid = document.getElementById('projectMetricsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    primaryProjects.forEach((proj, index) => {
        if (!proj.name) return;
        const metrics = projectPerformanceMetrics[proj.name] || {
            category: "Initiative",
            status: "Operational",
            statusType: "online",
            healthScore: 98.0,
            summary: "Active academic community initiative under oU1TS.",
            kpis: [
                { label: "Status", value: "Online", trend: "Normal" },
                { label: "Uptime", value: "99.5%", trend: "Optimal" },
                { label: "Ecosystem Node", value: "Connected", trend: "Active" },
                { label: "Access", value: "Public", trend: "Free" }
            ]
        };

        const card = document.createElement('div');
        card.className = 'project-metric-card';
        card.dataset.index = index;

        const kpisHtml = metrics.kpis.map(kpi => `
            <div class="pm-kpi-item">
                <span class="pm-kpi-label">${kpi.label}</span>
                <div class="pm-kpi-val-row">
                    <span class="pm-kpi-val">${kpi.value}</span>
                    <span class="pm-kpi-trend">${kpi.trend}</span>
                </div>
            </div>
        `).join('');

        const isLinkActive = proj.url && proj.url !== '#';
        const buttonHtml = isLinkActive
            ? `<a href="${proj.url}" target="_blank" rel="noopener noreferrer" class="pm-launch-btn">
                   <span>Launch Initiative</span>
                   <i class="fa-solid fa-arrow-up-right-from-square"></i>
               </a>`
            : `<button type="button" class="pm-launch-btn disabled" disabled>
                   <span>In Development</span>
                   <i class="fa-solid fa-hourglass-half"></i>
               </button>`;

        card.innerHTML = `
            <div class="pm-card-header">
                <div class="pm-header-left">
                    <div class="pm-icon-wrap">
                        <i class="${proj.icon}"></i>
                    </div>
                    <div>
                        <h3 class="pm-name">${proj.name}</h3>
                        <span class="pm-category">${metrics.category}</span>
                    </div>
                </div>
                <span class="pm-status-badge ${metrics.statusType}">
                    <span class="pm-dot"></span>
                    ${metrics.status}
                </span>
            </div>

            <p class="pm-summary">${metrics.summary}</p>

            <div class="pm-health-container">
                <div class="pm-health-meta">
                    <span class="pm-health-label">System Health & Reliability</span>
                    <span class="pm-health-score">${metrics.healthScore}%</span>
                </div>
                <div class="pm-progress-track">
                    <div class="pm-progress-fill" style="width: ${metrics.healthScore}%;"></div>
                </div>
            </div>

            <div class="pm-kpis-grid">
                ${kpisHtml}
            </div>

            ${buttonHtml}
        `;

        grid.appendChild(card);
    });

    updateMetricsGalleryView();
}

function initProfileDashboardSwitcher() {
    const toDashboardBtn = document.getElementById('profileSwitchToDashboardBtn');
    const toProfileBtn = document.getElementById('dashboardSwitchToProfileBtn');
    const profileCard = document.getElementById('profileCardWindow');
    const dashboardCard = document.getElementById('initiativesDashboardCard');

    if (!toDashboardBtn || !toProfileBtn || !profileCard || !dashboardCard) return;

    let isTransitioning = false;

    toDashboardBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;

        // Render metrics if not already rendered
        renderProjectMetricsDashboard();

        // 1. Stage outgoing card: gently scale & covered directly underneath
        profileCard.classList.remove('anim-reveal-under', 'anim-place-down', 'anim-pick-up');
        profileCard.classList.add('anim-covered-under');

        // 2. Stage incoming dashboard card: place down from center on top of profile card
        dashboardCard.style.display = 'block';
        dashboardCard.classList.remove('anim-pick-up', 'anim-covered-under', 'anim-reveal-under');
        dashboardCard.classList.add('anim-place-down');

        setTimeout(() => {
            profileCard.style.display = 'none';
            profileCard.classList.remove('anim-covered-under');
            profileCard.classList.remove('active-stage-window');
            profileCard.classList.add('inactive-stage-window');

            dashboardCard.classList.remove('anim-place-down');
            dashboardCard.classList.remove('inactive-stage-window');
            dashboardCard.classList.add('active-stage-window');

            isTransitioning = false;
        }, 470);
    });

    toProfileBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;

        // 1. Stage outgoing dashboard card: pick up from center off the profile card
        dashboardCard.classList.remove('anim-place-down', 'anim-reveal-under', 'anim-covered-under');
        dashboardCard.classList.add('anim-pick-up');

        // 2. Stage incoming profile card: reveal directly from underneath
        profileCard.style.display = 'block';
        profileCard.classList.remove('anim-covered-under', 'anim-place-down', 'anim-pick-up');
        profileCard.classList.add('anim-reveal-under');

        setTimeout(() => {
            dashboardCard.style.display = 'none';
            dashboardCard.classList.remove('anim-pick-up');
            dashboardCard.classList.remove('active-stage-window');
            dashboardCard.classList.add('inactive-stage-window');

            profileCard.classList.remove('anim-reveal-under');
            profileCard.classList.remove('inactive-stage-window');
            profileCard.classList.add('active-stage-window');

            isTransitioning = false;
        }, 440);
    });
}

// Initialize on DOM ready or immediately if already loaded
function initApp() {
    createStars();
    createFloatingElements();
    renderProjectsGrid();
    initInfiniteScroller();
    initNavigation();
    initThemeSwitcher();
    initParallax();
    initCustomDropdowns();
    renderProjectMetricsDashboard();
    initMetricsGalleryAndModal();
    initProfileDashboardSwitcher();
    initAuthSystem();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ==========================================
// 6. User Authentication & Profile Engine
// ==========================================

let supabaseClient = null;

// Dynamically load env-config.js if it exists
function loadEnvConfig() {
    return new Promise((resolve) => {
        if (window.__ENV) {
            resolve();
            return;
        }
        // If a script tag for env-config.js was already declared in HTML, do not re-inject it
        if (document.querySelector('script[src*="env-config.js"]')) {
            window.__ENV = window.__ENV || null;
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'env-config.js';
        script.onload = () => resolve();
        script.onerror = () => {
            window.__ENV = window.__ENV || null;
            resolve();
        };
        document.head.appendChild(script);
    });
}

// Dynamically load Supabase Client SDK from CDN
function loadSupabaseScript() {
    return new Promise((resolve) => {
        if (window.supabase && window.supabase.createClient) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve();
        script.onerror = () => {
            console.error("Failed to load Supabase SDK from CDN.");
            resolve();
        };
        document.head.appendChild(script);
    });
}

const isSupabaseConfigured = () => {
    return Boolean(
        window.__ENV &&
        window.__ENV.SUPABASE_URL &&
        window.__ENV.SUPABASE_ANON_KEY &&
        window.__ENV.SUPABASE_URL.trim() !== "" &&
        window.__ENV.SUPABASE_ANON_KEY.trim() !== "" &&
        !window.__ENV.SUPABASE_URL.includes("your-supabase-project") &&
        !window.__ENV.SUPABASE_ANON_KEY.includes("your-anon-key")
    );
};

function updateNavLinksForAuth(isLoggedIn) {
    const navAuthLink = document.getElementById('navAuthLink');
    const sidebarAuthLink = document.getElementById('sidebarAuthLink');
    const sidebarJoinBtn = document.getElementById('sidebarJoinBtn');
    const rationaleJoinBtn = document.getElementById('rationaleJoinBtn');

    if (isLoggedIn) {
        if (navAuthLink) {
            navAuthLink.innerHTML = '<i class="fa-solid fa-user-gear" style="margin-right: 6px; font-size: 0.9em;"></i>Profile';
            navAuthLink.setAttribute('href', '#profile');
        }
        if (sidebarAuthLink) {
            sidebarAuthLink.innerHTML = '<i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i>Profile';
            sidebarAuthLink.setAttribute('href', '#profile');
        }
        if (sidebarJoinBtn) {
            sidebarJoinBtn.innerHTML = '<i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i>Profile';
            sidebarJoinBtn.setAttribute('href', '#profile');
        }
        if (rationaleJoinBtn) {
            rationaleJoinBtn.innerHTML = '<i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i>Profile';
            rationaleJoinBtn.setAttribute('href', '#profile');
        }
    } else {
        if (navAuthLink) {
            navAuthLink.innerHTML = '<i class="fa-solid fa-user-lock" style="margin-right: 6px; font-size: 0.9em;"></i>Login';
            navAuthLink.setAttribute('href', '#auth');
        }
        if (sidebarAuthLink) {
            sidebarAuthLink.innerHTML = '<i class="fa-solid fa-user-lock" style="margin-right: 8px;"></i>Login';
            sidebarAuthLink.setAttribute('href', '#auth');
        }
        if (sidebarJoinBtn) {
            sidebarJoinBtn.innerHTML = '<i class="fa-solid fa-handshake" style="margin-right: 8px;"></i>Join oU1TS';
            sidebarJoinBtn.setAttribute('href', '#auth');
        }
        if (rationaleJoinBtn) {
            rationaleJoinBtn.innerHTML = '<i class="fa-solid fa-handshake" style="margin-right: 8px;"></i>Join oU1TS';
            rationaleJoinBtn.setAttribute('href', '#auth');
        }
    }
}

// Check if user profile has all required mandatory fields
function isProfileComplete(profile) {
    if (!profile) return false;
    const studentId = String(profile.student_id || '').trim();
    const hasValidStudentId = /^[0-9]+$/.test(studentId) && studentId !== 'OAUTH_USER';
    const hasDept = Boolean(profile.department && profile.department.trim() !== '');
    const hasBatch = Boolean(profile.batch && String(profile.batch).trim() !== '');
    const validBlood = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const hasBlood = Boolean(profile.blood_group && validBlood.includes(profile.blood_group));
    const hasSocial = Boolean(
        (profile.social_facebook && profile.social_facebook.trim() !== '') ||
        (profile.social_instagram && profile.social_instagram.trim() !== '') ||
        (profile.social_telegram && profile.social_telegram.trim() !== '') ||
        (profile.social_discord && profile.social_discord.trim() !== '')
    );
    return hasValidStudentId && hasDept && hasBatch && hasBlood && hasSocial;
}

// Get current user session details
async function getCurrentUser(sessionOverride = null) {
    if (!supabaseClient) {
        return null;
    }
    try {
        let user = null;
        if (sessionOverride && sessionOverride.user) {
            user = sessionOverride.user;
        } else {
            const { data: sessionData } = await supabaseClient.auth.getSession();
            if (sessionData && sessionData.session && sessionData.session.user) {
                user = sessionData.session.user;
            } else {
                const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
                if (authError || !authUser) return null;
                user = authUser;
            }
        }

        if (!user) return null;

        let profile = null;
        try {
            const { data, error: profileError } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            if (!profileError) profile = data;
        } catch (pe) {
            console.warn("Could not retrieve profile record:", pe);
        }

        return {
            id: user.id,
            email: user.email,
            ...(profile || {})
        };
    } catch (err) {
        console.error("Error retrieving user session:", err);
        return null;
    }
}

// Register user
async function signUpUser(email, password, fullName, studentId, department) {
    if (!/^[0-9]+$/.test(studentId)) {
        throw new Error("Student ID must contain only digits.");
    }

    if (!supabaseClient) {
        throw new Error("Unable to register: Database connection not configured. Supabase credentials are missing.");
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName,
                student_id: studentId,
                department: department
            }
        }
    });
    if (error) throw error;
    return data;
}

// Log in user
async function signInUser(email, password) {
    if (!supabaseClient) {
        throw new Error("Unable to log in: Database connection not configured. Supabase credentials are missing.");
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
}

// Update profile details
async function updateProfile(profileData) {
    const studentId = String(profileData.student_id || '').trim();
    if (!studentId || !/^[0-9]+$/.test(studentId) || studentId === 'OAUTH_USER') {
        throw new Error("Student ID is required and must contain only digits.");
    }
    if (!profileData.department || profileData.department.trim() === '') {
        throw new Error("Department selection is required.");
    }
    if (!profileData.batch || String(profileData.batch).trim() === '') {
        throw new Error("Batch is required.");
    }
    const validBlood = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!profileData.blood_group || !validBlood.includes(profileData.blood_group)) {
        throw new Error("A valid Blood Group is required.");
    }
    const hasSocial = Boolean(
        (profileData.social_facebook && profileData.social_facebook.trim() !== '') ||
        (profileData.social_instagram && profileData.social_instagram.trim() !== '') ||
        (profileData.social_telegram && profileData.social_telegram.trim() !== '') ||
        (profileData.social_discord && profileData.social_discord.trim() !== '')
    );
    if (!hasSocial) {
        throw new Error("Please provide at least one social media link (Facebook, Instagram, Telegram, or Discord).");
    }

    if (!supabaseClient) {
        throw new Error("Unable to update profile: Database connection not configured.");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("No authenticated session found. Please log in.");

    const { error } = await supabaseClient.from('profiles').update({
        full_name: profileData.full_name,
        student_id: studentId,
        department: profileData.department,
        batch: profileData.batch,
        blood_group: profileData.blood_group,
        social_facebook: profileData.social_facebook,
        social_instagram: profileData.social_instagram,
        social_telegram: profileData.social_telegram,
        social_discord: profileData.social_discord,
        updated_at: new Date().toISOString()
    }).eq('id', user.id);

    if (error) throw error;
}

// Log out user
async function signOutUser() {
    if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    }
    localStorage.removeItem('mock_session');
    localStorage.removeItem('mock_users');
}

// Alert helper
function showAuthAlert(message, type = 'error', formAlertId = 'authAlert') {
    const alertBox = document.getElementById(formAlertId);
    if (!alertBox) return;
    alertBox.className = `auth-alert ${type}`;
    alertBox.innerText = message;
    alertBox.style.display = 'block';
}

function clearAuthAlerts() {
    const alert1 = document.getElementById('authAlert');
    if (alert1) alert1.style.display = 'none';
    const alert2 = document.getElementById('profileAlert');
    if (alert2) alert2.style.display = 'none';
}

// Render social links
function updateSocialLink(id, value, isHandle = false) {
    const linkEl = document.getElementById(id);
    if (!linkEl) return;

    if (value && value.trim() !== '') {
        linkEl.classList.remove('disabled');
        if (isHandle) {
            linkEl.setAttribute('href', '#');
            linkEl.setAttribute('title', `Discord Handle: ${value}`);
            linkEl.onclick = (e) => {
                e.preventDefault();
                alert(`Discord Handle: ${value}`);
            };
        } else {
            let url = value.trim();
            if (!/^https?:\/\//i.test(url)) {
                if (id === 'linkTelegram') {
                    const username = url.replace(/^@/, '');
                    url = `https://t.me/${username}`;
                } else {
                    url = `https://${url}`;
                }
            }
            linkEl.setAttribute('href', url);
            linkEl.onclick = null;
        }
    } else {
        linkEl.classList.add('disabled');
        linkEl.setAttribute('href', '#');
        linkEl.onclick = (e) => e.preventDefault();
    }
}

// Populate views
function populateProfileUI(profile) {
    if (!profile) return;

    const displayName = document.getElementById('displayName');
    const displayDeptAndBatch = document.getElementById('displayDeptAndBatch');
    const displayEmail = document.getElementById('displayEmail');
    const displayStudentId = document.getElementById('displayStudentId');
    const displayDept = document.getElementById('displayDept');
    const displayBatch = document.getElementById('displayBatch');
    const displayBlood = document.getElementById('displayBlood');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileBadges = document.getElementById('profileBadges');

    if (displayName) displayName.innerText = profile.full_name || 'N/A';
    if (displayDeptAndBatch) displayDeptAndBatch.innerText = `${profile.department || 'N/A'} • Batch ${profile.batch || 'N/A'}`;
    if (displayEmail) displayEmail.innerText = profile.email || 'N/A';
    if (displayStudentId) displayStudentId.innerText = profile.student_id || 'N/A';
    if (displayDept) displayDept.innerText = profile.department || 'N/A';
    if (displayBatch) displayBatch.innerText = profile.batch || 'N/A';
    if (displayBlood) displayBlood.innerText = profile.blood_group || 'N/A';

    if (profileAvatar) {
        const nameParts = (profile.full_name || 'U').split(' ');
        const initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();
        profileAvatar.innerText = initials;
    }

    if (profileBadges) {
        profileBadges.innerHTML = '';
        const tags = profile.project_tags || ['root'];
        tags.forEach(tag => {
            const badge = document.createElement('span');
            badge.className = 'profile-badge';
            badge.innerText = tag;
            profileBadges.appendChild(badge);
        });
    }

    updateSocialLink('linkFacebook', profile.social_facebook);
    updateSocialLink('linkInstagram', profile.social_instagram);
    updateSocialLink('linkTelegram', profile.social_telegram);
    updateSocialLink('linkDiscord', profile.social_discord, true);

    // Form inputs
    const editName = document.getElementById('editName');
    const editStudentId = document.getElementById('editStudentId');
    const editDept = document.getElementById('editDept');
    const editBatch = document.getElementById('editBatch');
    const editBlood = document.getElementById('editBlood');
    const editFacebook = document.getElementById('editFacebook');
    const editInstagram = document.getElementById('editInstagram');
    const editTelegram = document.getElementById('editTelegram');
    const editDiscord = document.getElementById('editDiscord');

    if (editName) editName.value = profile.full_name || '';
    if (editStudentId) editStudentId.value = profile.student_id || '';
    if (editDept) {
        editDept.value = profile.department || '';
        if (typeof editDept._updateCustomDropdown === 'function') {
            editDept._updateCustomDropdown();
        }
    }
    if (editBatch) editBatch.value = profile.batch || '';
    if (editBlood) {
        editBlood.value = profile.blood_group || '';
        if (typeof editBlood._updateCustomDropdown === 'function') {
            editBlood._updateCustomDropdown();
        }
    }
    if (editFacebook) editFacebook.value = profile.social_facebook || '';
    if (editInstagram) editInstagram.value = profile.social_instagram || '';
    if (editTelegram) editTelegram.value = profile.social_telegram || '';
    if (editDiscord) editDiscord.value = profile.social_discord || '';
}

let currentSessionUser = null;

// Sync session and toggle profile/login sections
async function syncAuthStatus(redirectHash = null, sessionOverride = null) {
    try {
        currentSessionUser = await getCurrentUser(sessionOverride);
        const isLoggedIn = !!currentSessionUser;
        updateNavLinksForAuth(isLoggedIn);

        const hash = window.location.hash || '#home';

        if (isLoggedIn) {
            populateProfileUI(currentSessionUser);
            const isComplete = isProfileComplete(currentSessionUser);
            const profileReadView = document.getElementById('profileReadView');
            const profileEditForm = document.getElementById('profileEditForm');
            const cancelEditBtn = document.getElementById('cancelEditBtn');
            const incompleteBanner = document.getElementById('incompleteProfileBanner');

            if (!isComplete) {
                if (incompleteBanner) incompleteBanner.style.display = 'block';
                if (profileReadView && profileEditForm) {
                    profileReadView.style.display = 'none';
                    profileEditForm.style.display = 'block';
                }
                if (cancelEditBtn) cancelEditBtn.style.display = 'none';
                showAuthAlert("Please complete your profile details (Student ID, Department, Batch, Blood Group, and at least one social link).", "warning", "profileAlert");
            } else {
                if (incompleteBanner) incompleteBanner.style.display = 'none';
                if (profileReadView && profileEditForm) {
                    profileReadView.style.display = 'block';
                    profileEditForm.style.display = 'none';
                }
                if (cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
            }

            if (redirectHash) {
                if (window.switchTab) window.switchTab(redirectHash);
            } else if (hash === '#auth') {
                // If they go to login while active, move them to profile
                if (window.switchTab) window.switchTab('#profile');
            }
        } else {
            // Only kick back to #home if user intentionally visited #profile while logged out
            // Do NOT kick back if browser is in the middle of exchanging auth tokens/code
            const isExchangingAuth = window.location.search.includes('code=') || window.location.hash.includes('access_token=');
            if (hash === '#profile' && !isExchangingAuth) {
                if (window.switchTab) window.switchTab('#home');
            } else if (redirectHash) {
                if (window.switchTab) window.switchTab(redirectHash);
            }
        }
    } catch (e) {
        console.error("Error syncing authentication state:", e);
    }
}

// Master Auth System Init
async function initAuthSystem() {
    // Purge any legacy mock session data from local storage
    localStorage.removeItem('mock_session');
    localStorage.removeItem('mock_users');

    // Dynamically load environment variables first
    await loadEnvConfig();

    // 1. Initialize Supabase if variables are configured
    if (isSupabaseConfigured()) {
        try {
            await loadSupabaseScript();
            if (window.supabase && window.supabase.createClient) {
                supabaseClient = window.supabase.createClient(window.__ENV.SUPABASE_URL, window.__ENV.SUPABASE_ANON_KEY);
                console.log("Supabase Client initialized successfully.");

                // -------------------------------------------------------
                // PKCE Code Exchange: Must happen BEFORE onAuthStateChange
                // is registered so the resulting SIGNED_IN event fires into
                // our listener (not before it exists).
                // -------------------------------------------------------
                const urlParams = new URLSearchParams(window.location.search);
                const authCode = urlParams.get('code');
                if (authCode) {
                    console.log("Detected OAuth auth code in URL, exchanging for session...");
                    try {
                        const { data: exchangeData, error: exchangeErr } = await supabaseClient.auth.exchangeCodeForSession(authCode);
                        if (exchangeErr) {
                            console.error("OAuth code exchange error:", exchangeErr);
                        } else if (exchangeData && exchangeData.session) {
                            console.log("OAuth code exchange successful.");
                            // Clean up the ?code=... from the browser URL
                            try {
                                window.history.replaceState(null, document.title, window.location.pathname + '#profile');
                            } catch (e) {}
                            // Session is now stored in localStorage; listener will fire SIGNED_IN
                        }
                    } catch (err) {
                        console.error("Unexpected error exchanging auth code:", err);
                    }
                }

                // -------------------------------------------------------
                // Auth State Change Listener
                // IMPORTANT: Per Supabase docs, do NOT make async Supabase
                // calls directly inside this callback — it causes deadlocks.
                // Use setTimeout(fn, 0) to defer out of the microtask queue.
                // -------------------------------------------------------
                supabaseClient.auth.onAuthStateChange((event, session) => {
                    console.log("Supabase Auth State Changed:", event, session ? "Session active" : "No session");

                    if (event === 'PASSWORD_RECOVERY') {
                        setTimeout(() => showResetPasswordView(), 0);
                        return;
                    }

                    if (event === 'SIGNED_IN') {
                        // Defer async UI update; pass session to avoid re-fetching
                        setTimeout(() => syncAuthStatus('#profile', session), 0);
                    } else if (event === 'INITIAL_SESSION') {
                        if (session && session.user) {
                            // User has an active session on page load/reload
                            const currentHash = window.location.hash;
                            const inSearch = window.location.search;
                            // Always redirect away from #auth if logged in
                            // Also redirect to #profile if returning from OAuth code exchange
                            if (!currentHash || currentHash === '#auth' || currentHash.includes('profile') || inSearch.includes('code=')) {
                                setTimeout(() => syncAuthStatus('#profile', session), 0);
                            } else {
                                // Stay on the current tab, just update nav links
                                setTimeout(() => syncAuthStatus(null, session), 0);
                            }
                        } else {
                            // No session — sync logged-out nav state, no navigation change
                            setTimeout(() => syncAuthStatus(null, null), 0);
                        }
                    } else if (event === 'SIGNED_OUT') {
                        setTimeout(() => syncAuthStatus('#home', null), 0);
                    } else if (event === 'TOKEN_REFRESHED') {
                        // Token silently refreshed; update session reference without navigation
                        setTimeout(() => syncAuthStatus(null, session), 0);
                    } else {
                        setTimeout(() => syncAuthStatus(null, session), 0);
                    }
                });
            } else {
                console.error("Supabase SDK loaded but createClient is not available.");
            }
        } catch (error) {
            console.error("Error initializing Supabase client:", error);
        }
    } else {
        console.warn("Supabase credentials not configured. Running with authentication disabled until environment variables are set.");
    }


    // Auth view helper functions
    function showForgotPasswordView() {
        const authTabs = document.querySelector('.auth-tabs');
        const oauthDivider = document.getElementById('oauthDivider');
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const resetPasswordForm = document.getElementById('resetPasswordForm');

        if (authTabs) authTabs.style.display = 'none';
        if (oauthDivider) oauthDivider.style.display = 'none';
        if (googleLoginBtn) googleLoginBtn.style.display = 'none';
        if (loginForm) {
            loginForm.classList.remove('active');
            loginForm.style.display = 'none';
        }
        if (registerForm) {
            registerForm.classList.remove('active');
            registerForm.style.display = 'none';
        }
        if (resetPasswordForm) resetPasswordForm.style.display = 'none';
        if (forgotPasswordForm) {
            forgotPasswordForm.style.display = 'block';
            const loginEmail = document.getElementById('loginEmail');
            const forgotEmail = document.getElementById('forgotEmail');
            if (loginEmail && forgotEmail && loginEmail.value) {
                forgotEmail.value = loginEmail.value;
            }
        }
        clearAuthAlerts();
    }

    function restoreLoginView() {
        const authTabs = document.querySelector('.auth-tabs');
        const oauthDivider = document.getElementById('oauthDivider');
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        const tabLoginBtn = document.getElementById('tabLoginBtn');
        const tabRegisterBtn = document.getElementById('tabRegisterBtn');

        if (authTabs) authTabs.style.display = 'flex';
        if (oauthDivider) oauthDivider.style.display = 'flex';
        if (googleLoginBtn) googleLoginBtn.style.display = 'flex';
        if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
        if (resetPasswordForm) resetPasswordForm.style.display = 'none';

        if (tabLoginBtn && tabRegisterBtn) {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
        }
        if (loginForm) {
            loginForm.classList.add('active');
            loginForm.style.display = 'block';
        }
        if (registerForm) {
            registerForm.classList.remove('active');
            registerForm.style.display = 'none';
        }
        clearAuthAlerts();
    }

    function showResetPasswordView() {
        if (window.switchTab) window.switchTab('#auth');
        const authTabs = document.querySelector('.auth-tabs');
        const oauthDivider = document.getElementById('oauthDivider');
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const resetPasswordForm = document.getElementById('resetPasswordForm');

        if (authTabs) authTabs.style.display = 'none';
        if (oauthDivider) oauthDivider.style.display = 'none';
        if (googleLoginBtn) googleLoginBtn.style.display = 'none';
        if (loginForm) {
            loginForm.classList.remove('active');
            loginForm.style.display = 'none';
        }
        if (registerForm) {
            registerForm.classList.remove('active');
            registerForm.style.display = 'none';
        }
        if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
        if (resetPasswordForm) resetPasswordForm.style.display = 'block';

        showAuthAlert("You can now enter and save your new password.", "success", "authAlert");
    }

    // 2. Setup auth tab toggle
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
        tabLoginBtn.addEventListener('click', () => {
            restoreLoginView();
        });

        tabRegisterBtn.addEventListener('click', () => {
            const authTabs = document.querySelector('.auth-tabs');
            const oauthDivider = document.getElementById('oauthDivider');
            const googleLoginBtn = document.getElementById('googleLoginBtn');
            if (authTabs) authTabs.style.display = 'flex';
            if (oauthDivider) oauthDivider.style.display = 'flex';
            if (googleLoginBtn) googleLoginBtn.style.display = 'flex';
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.classList.add('active');
            registerForm.style.display = 'block';
            loginForm.classList.remove('active');
            loginForm.style.display = 'none';
            if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
            if (resetPasswordForm) resetPasswordForm.style.display = 'none';
            clearAuthAlerts();
        });
    }

    // 3. Bind form logins
    const loginFormElement = document.getElementById('loginForm');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthAlerts();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const submitBtn = loginFormElement.querySelector('button[type="submit"]');
                const origText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Signing In...';

                await signInUser(email, password);

                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;

                showAuthAlert("Login successful! Redirecting to profile...", "success", "authAlert");
                await syncAuthStatus('#profile');
            } catch (error) {
                const submitBtn = loginFormElement.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="btn-text">Sign In</span><i class="fa-solid fa-arrow-right"></i>';
                showAuthAlert(error.message || "Login failed. Check your credentials.", "error", "authAlert");
            }
        });
    }

    // 4. Bind registration submit
    const registerFormElement = document.getElementById('registerForm');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthAlerts();
            const fullName = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const studentId = document.getElementById('registerStudentId').value;
            const department = document.getElementById('registerDept').value;

            try {
                const submitBtn = registerFormElement.querySelector('button[type="submit"]');
                const origText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Registering...';

                await signUpUser(email, password, fullName, studentId, department);

                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;

                showAuthAlert("Registration successful! Redirecting to profile...", "success", "authAlert");
                await syncAuthStatus('#profile');
            } catch (error) {
                const submitBtn = registerFormElement.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="btn-text">Create Account</span><i class="fa-solid fa-user-plus"></i>';
                showAuthAlert(error.message || "Registration failed. Try again.", "error", "authAlert");
            }
        });
    }

    // 5. Profile Edit switching
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileReadView = document.getElementById('profileReadView');
    const profileEditForm = document.getElementById('profileEditForm');

    if (editProfileBtn && cancelEditBtn && profileReadView && profileEditForm) {
        editProfileBtn.addEventListener('click', () => {
            profileReadView.style.display = 'none';
            profileEditForm.style.display = 'block';
            clearAuthAlerts();
            if (currentSessionUser && !isProfileComplete(currentSessionUser)) {
                cancelEditBtn.style.display = 'none';
                showAuthAlert("Please complete all required profile details.", "warning", "profileAlert");
            } else {
                cancelEditBtn.style.display = 'inline-flex';
            }
        });

        cancelEditBtn.addEventListener('click', () => {
            if (currentSessionUser && !isProfileComplete(currentSessionUser)) {
                showAuthAlert("You must complete your profile details before proceeding.", "warning", "profileAlert");
                return;
            }
            profileReadView.style.display = 'block';
            profileEditForm.style.display = 'none';
            clearAuthAlerts();
        });
    }

    // 6. Bind Profile form submit
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthAlerts();

            const profileData = {
                full_name: document.getElementById('editName').value,
                student_id: document.getElementById('editStudentId').value,
                department: document.getElementById('editDept').value,
                batch: document.getElementById('editBatch').value,
                blood_group: document.getElementById('editBlood').value,
                social_facebook: document.getElementById('editFacebook').value,
                social_instagram: document.getElementById('editInstagram').value,
                social_telegram: document.getElementById('editTelegram').value,
                social_discord: document.getElementById('editDiscord').value
            };

            try {
                const submitBtn = profileEditForm.querySelector('button[type="submit"]');
                const origText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Saving...';

                await updateProfile(profileData);

                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;

                showAuthAlert("Profile updated successfully!", "success", "profileAlert");

                await syncAuthStatus();
                setTimeout(() => {
                    profileReadView.style.display = 'block';
                    profileEditForm.style.display = 'none';
                    clearAuthAlerts();
                }, 1200);

            } catch (error) {
                const submitBtn = profileEditForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right: 8px;"></i>Save Changes';
                showAuthAlert(error.message || "Failed to update profile details.", "error", "profileAlert");
            }
        });
    }

    // 7. Bind Log Out
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOutUser();
                await syncAuthStatus('#home');
            } catch (error) {
                alert("Failed to log out: " + error.message);
            }
        });
    }

    // 8. Bind Google Login
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            if (!supabaseClient) {
                showAuthAlert("Unable to sign in with Google: Database connection not configured.", 'error', 'authAlert');
                return;
            }
            try {
                const redirectUrl = window.location.origin + window.location.pathname;
                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: redirectUrl }
                });
                if (error) throw error;
            } catch (e) {
                showAuthAlert(e.message || "Google sign in failed.", 'error', 'authAlert');
            }
        });
    }

    // 9. Bind Forgot Password & Reset Password handlers
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', showForgotPasswordView);
    }
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', restoreLoginView);
    }

    if (forgotPasswordForm) {
        let resetCooldownTimer = null;
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthAlerts();

            const emailInput = document.getElementById('forgotEmail');
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                showAuthAlert("Please enter a valid email address.", "error", "authAlert");
                return;
            }

            if (!supabaseClient) {
                showAuthAlert("Unable to send recovery email: Database connection not configured.", "error", "authAlert");
                return;
            }

            const submitBtn = document.getElementById('sendResetLinkBtn');
            const origText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Sending Link...';

            try {
                const redirectUrl = window.location.origin + window.location.pathname;
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: redirectUrl
                });

                if (error) {
                    if (error.status === 429 || error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
                        showAuthAlert("Email rate limit reached (3-4 emails/hour on free tier). Please wait a few minutes before trying again.", "error", "authAlert");
                    } else {
                        showAuthAlert(error.message || "Failed to send reset link.", "error", "authAlert");
                    }
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origText;
                    return;
                }

                showAuthAlert("Password recovery link sent! Please check your email inbox (and spam folder).", "success", "authAlert");

                // Start 60-second cooldown timer
                let countdown = 60;
                submitBtn.innerHTML = `<i class="fa-solid fa-clock" style="margin-right: 8px;"></i>Resend in ${countdown}s`;
                if (resetCooldownTimer) clearInterval(resetCooldownTimer);
                resetCooldownTimer = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        submitBtn.innerHTML = `<i class="fa-solid fa-clock" style="margin-right: 8px;"></i>Resend in ${countdown}s`;
                    } else {
                        clearInterval(resetCooldownTimer);
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origText;
                    }
                }, 1000);

            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
                showAuthAlert(err.message || "An unexpected error occurred.", "error", "authAlert");
            }
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearAuthAlerts();

            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword.length < 6) {
                showAuthAlert("Password must be at least 6 characters long.", "error", "authAlert");
                return;
            }
            if (newPassword !== confirmNewPassword) {
                showAuthAlert("Passwords do not match. Please re-enter.", "error", "authAlert");
                return;
            }

            if (!supabaseClient) {
                showAuthAlert("Database connection not configured.", "error", "authAlert");
                return;
            }

            const submitBtn = document.getElementById('saveNewPasswordBtn');
            const origText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Updating Password...';

            try {
                const { error } = await supabaseClient.auth.updateUser({
                    password: newPassword
                });

                if (error) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origText;
                    showAuthAlert(error.message || "Failed to update password.", "error", "authAlert");
                    return;
                }

                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
                showAuthAlert("Password updated successfully! Logging you in...", "success", "authAlert");

                setTimeout(async () => {
                    restoreLoginView();
                    await syncAuthStatus('#profile');
                }, 1500);

            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
                showAuthAlert(err.message || "An unexpected error occurred.", "error", "authAlert");
            }
        });
    }

    // Check if user landed on page via recovery link
    if (window.location.hash.includes('type=recovery') || window.location.hash === '#reset-password') {
        showResetPasswordView();
    }

    // 10. Fallback initial sync if Supabase is not configured
    if (!isSupabaseConfigured()) {
        syncAuthStatus();
    }
}

