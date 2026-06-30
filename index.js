// Project Roster
const primaryProjects = [
    { name: "Projects Hub", icon: "fa-solid fa-globe", url: "https://ou1ts.github.io/portal" },
    { name: "Wiki", icon: "fa-solid fa-book", url: "wiki.html" },
    // { name: "Join Us", icon: "fa-solid fa-handshake", url: "https://forms.gle/treGsBbsE3UTFUos9" },
    { name: "Blood Donation", icon: "fa-solid fa-droplet", url: "https://bd-ou1ts.netlify.app/" },
    { name: "Scheduler", icon: "fa-solid fa-calendar-days", url: "https://b1tsched.netlify.app/" },
    { name: "Archive", icon: "fa-solid fa-boxes-packing", url: "https://b1tacad.netlify.app/" },
    { name: "Events", icon: "fa-solid fa-location-dot", url: "https://ou1ts.github.io/events/" },
    { name: "English Speaking", icon: "fa-regular fa-comments", url: "https://ou1ts.github.io/english/" },
    { name: "QBank", icon: "fa-solid fa-file-circle-question", url: "https://ou1ts.github.io/qbank/" }

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
        history.pushState(null, null, targetId);

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

    // Bind link event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            switchTab(targetId);
        });
    });

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            switchTab(targetId);
            closeSidebar();
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

    // Handle initial hash on page load
    function handleInitialHash() {
        const hash = window.location.hash || '#home';
        if (['#home', '#projects', '#repos', '#about'].includes(hash)) {
            switchTab(hash);
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    createFloatingElements();
    renderProjectsGrid();
    initInfiniteScroller();
    initNavigation();
    initThemeSwitcher();
    initParallax();
});

