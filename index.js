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
        if (['#home', '#projects', '#repos', '#about', '#auth', '#profile'].includes(hash)) {
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
    initAuthSystem();
});

// ==========================================
// 6. User Authentication & Profile Engine
// ==========================================

let supabase = null;

// Dynamically load env-config.js if it exists, otherwise fall back to placeholders
function loadEnvConfig() {
    return new Promise((resolve) => {
        if (window.__ENV) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'env-config.js';
        script.onload = () => resolve();
        script.onerror = () => {
            // Safe fallback if the config file is missing
            window.__ENV = window.__ENV || {
                SUPABASE_URL: "https://your-supabase-project.supabase.co",
                SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here"
            };
            resolve();
        };
        document.head.appendChild(script);
    });
}

// Dynamically load Supabase Client SDK from CDN
function loadSupabaseScript() {
    return new Promise((resolve) => {
        if (window.supabase) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve();
        script.onerror = () => {
            console.warn("Failed to load Supabase SDK from CDN. Falling back to local mock storage.");
            resolve();
        };
        document.head.appendChild(script);
    });
}

const isSupabaseConfigured = () => {
    return window.supabase && window.__ENV && window.__ENV.SUPABASE_URL && 
           window.__ENV.SUPABASE_ANON_KEY && 
           !window.__ENV.SUPABASE_URL.includes("your-supabase-project");
};

function updateNavLinksForAuth(isLoggedIn) {
    const navAuthLink = document.getElementById('navAuthLink');
    const sidebarAuthLink = document.getElementById('sidebarAuthLink');
    
    if (isLoggedIn) {
        if (navAuthLink) {
            navAuthLink.innerHTML = '<i class="fa-solid fa-user-gear" style="margin-right: 6px; font-size: 0.9em;"></i>Profile';
            navAuthLink.setAttribute('href', '#profile');
        }
        if (sidebarAuthLink) {
            sidebarAuthLink.innerHTML = '<i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i>Profile';
            sidebarAuthLink.setAttribute('href', '#profile');
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
    }
}

// Get current user session details
async function getCurrentUser() {
    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            return {
                id: user.id,
                email: user.email,
                ...profile
            };
        }
        return null;
    } else {
        const session = localStorage.getItem('mock_session');
        if (session) {
            const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
            if (users[session]) {
                return users[session].profile;
            }
        }
        return null;
    }
}

// Register user
async function signUpUser(email, password, fullName, studentId, department) {
    if (!/^[0-9]+$/.test(studentId)) {
        throw new Error("Student ID must contain only digits.");
    }

    if (supabase) {
        const { data, error } = await supabase.auth.signUp({
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
    } else {
        const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
        if (users[email]) {
            throw new Error("A user with this email already exists.");
        }
        const newId = 'mock-uuid-' + Math.random().toString(36).substr(2, 9);
        users[email] = {
            email: email,
            password: password,
            profile: {
                id: newId,
                email: email,
                full_name: fullName,
                student_id: studentId,
                department: department,
                batch: 'N/A',
                blood_group: 'A+',
                social_facebook: '',
                social_instagram: '',
                social_telegram: '',
                social_discord: '',
                project_tags: ['root']
            }
        };
        localStorage.setItem('mock_users', JSON.stringify(users));
        // Auto sign-in locally
        localStorage.setItem('mock_session', email);
        return { user: { email } };
    }
}

// Log in user
async function signInUser(email, password) {
    if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    } else {
        const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
        if (!users[email] || users[email].password !== password) {
            throw new Error("Invalid email or password.");
        }
        localStorage.setItem('mock_session', email);
        return { user: { email } };
    }
}

// Update profile details
async function updateProfile(profileData) {
    if (!/^[0-9]+$/.test(profileData.student_id)) {
        throw new Error("Student ID must contain only digits.");
    }
    const validBlood = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (profileData.blood_group && !validBlood.includes(profileData.blood_group)) {
        throw new Error("Invalid blood group selected.");
    }

    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated session found.");
        
        const { error } = await supabase.from('profiles').update({
            full_name: profileData.full_name,
            student_id: profileData.student_id,
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
    } else {
        const session = localStorage.getItem('mock_session');
        if (!session) throw new Error("No authenticated session found.");
        const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
        if (!users[session]) throw new Error("User profile not found.");
        
        users[session].profile = {
            ...users[session].profile,
            full_name: profileData.full_name,
            student_id: profileData.student_id,
            department: profileData.department,
            batch: profileData.batch,
            blood_group: profileData.blood_group,
            social_facebook: profileData.social_facebook,
            social_instagram: profileData.social_instagram,
            social_telegram: profileData.social_telegram,
            social_discord: profileData.social_discord,
            project_tags: users[session].profile.project_tags || ['root']
        };
        localStorage.setItem('mock_users', JSON.stringify(users));
    }
}

// Log out user
async function signOutUser() {
    if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } else {
        localStorage.removeItem('mock_session');
    }
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
    if (editDept) editDept.value = profile.department || '';
    if (editBatch) editBatch.value = profile.batch || '';
    if (editBlood) editBlood.value = profile.blood_group || '';
    if (editFacebook) editFacebook.value = profile.social_facebook || '';
    if (editInstagram) editInstagram.value = profile.social_instagram || '';
    if (editTelegram) editTelegram.value = profile.social_telegram || '';
    if (editDiscord) editDiscord.value = profile.social_discord || '';
}

let currentSessionUser = null;

// Sync session and toggle profile/login sections
async function syncAuthStatus(redirectHash = null) {
    try {
        currentSessionUser = await getCurrentUser();
        const isLoggedIn = !!currentSessionUser;
        updateNavLinksForAuth(isLoggedIn);

        const hash = window.location.hash || '#home';

        if (isLoggedIn) {
            populateProfileUI(currentSessionUser);
            if (hash === '#auth') {
                // If they go to login while active, move them to profile
                if (window.switchTab) window.switchTab('#profile');
            } else if (redirectHash) {
                if (window.switchTab) window.switchTab(redirectHash);
            }
        } else {
            if (hash === '#profile') {
                // If they try to go to profile while logged out, move them to home
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
    // Dynamically load environment variables first
    await loadEnvConfig();

    // 1. Initialize Supabase if variables are configured
    if (isSupabaseConfigured()) {
        try {
            await loadSupabaseScript();
            if (window.supabase && window.supabase.createClient) {
                supabase = window.supabase.createClient(window.__ENV.SUPABASE_URL, window.__ENV.SUPABASE_ANON_KEY);
                console.log("Supabase Client initialized successfully.");
                
                // Listen for auth state changes on Supabase
                supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log("Supabase Auth State Changed:", event);
                    await syncAuthStatus();
                });
            } else {
                console.warn("Supabase SDK loaded but createClient is not available. Running in Local Mock mode.");
            }
        } catch (error) {
            console.error("Error initializing Supabase client:", error);
        }
    } else {
        console.log("Supabase variables not set. Running in Local Mock mode.");
        // Seed mock database
        if (!localStorage.getItem('mock_users')) {
            const initialUsers = {
                'test@uits.edu.bd': {
                    email: 'test@uits.edu.bd',
                    password: 'password123',
                    profile: {
                        id: 'mock-uuid-1',
                        email: 'test@uits.edu.bd',
                        full_name: 'Shamiur Hasan',
                        student_id: '04324100051',
                        department: 'CSE',
                        batch: '61',
                        blood_group: 'A+',
                        social_facebook: 'https://facebook.com/shamiur',
                        social_instagram: 'https://instagram.com/shamiur',
                        social_telegram: 't.me/shamiur',
                        social_discord: 'shamiur#1337',
                        project_tags: ['root', 'portal']
                    }
                }
            };
            localStorage.setItem('mock_users', JSON.stringify(initialUsers));
        }
    }

    // 2. Setup auth tab toggle
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
        tabLoginBtn.addEventListener('click', () => {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            clearAuthAlerts();
        });

        tabRegisterBtn.addEventListener('click', () => {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
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
                
                showAuthAlert("Login successful!", "success", "authAlert");
                setTimeout(async () => {
                    await syncAuthStatus('#profile');
                }, 800);
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

                showAuthAlert("Registration successful! Logging in...", "success", "authAlert");
                setTimeout(async () => {
                    await syncAuthStatus('#profile');
                }, 1000);
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
        });

        cancelEditBtn.addEventListener('click', () => {
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
            if (supabase) {
                try {
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin + window.location.pathname }
                    });
                } catch (e) {
                    showAuthAlert(e.message, 'error', 'authAlert');
                }
            } else {
                showAuthAlert("OAuth simulation: Signing in with Google...", "success", "authAlert");
                const email = 'google.student@uits.edu.bd';
                const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
                if (!users[email]) {
                    users[email] = {
                        email: email,
                        password: '',
                        profile: {
                            id: 'mock-oauth-uid-1',
                            email: email,
                            full_name: 'Google Student',
                            student_id: 'OAUTH_USER',
                            department: 'CSE',
                            batch: 'N/A',
                            blood_group: 'A+',
                            social_facebook: '',
                            social_instagram: '',
                            social_telegram: '',
                            social_discord: '',
                            project_tags: ['root']
                        }
                    };
                    localStorage.setItem('mock_users', JSON.stringify(users));
                }
                localStorage.setItem('mock_session', email);
                setTimeout(async () => {
                    await syncAuthStatus('#profile');
                }, 800);
            }
        });
    }

    // 9. Initial sync on page load
    syncAuthStatus();
}

