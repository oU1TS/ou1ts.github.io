# oU1TS Website Redesign Documentation

Welcome to the technical documentation for the redesigned **oU1TS Student Support Center website** ([ou1ts.github.io](https://ou1ts.github.io/)), the centralized student-centered digital ecosystem for the University of Information Technology & Sciences (UITS).

---

## 🛠️ Architecture & Technology Stack

The oU1TS ecosystem operates as a lightweight, performance-focused **Single Page Application (SPA)** with zero heavy frontend framework dependencies:

1. **Core:** Semantic HTML5, Vanilla JavaScript (ES6+ modular patterns).
2. **Styling:** Custom Vanilla CSS utilizing CSS Custom Variables (`:root` & `body.light-mode`) for runtime design consistency, dynamic glassmorphism, and instant dark/light theme switching.
3. **Icons:** Vector-based icons rendered using **Font Awesome v6.4.0** CDN for unified branding.
4. **Visual Effects:** Dynamic starfield twinkles and drifting gradient bubbles with theme-aware opacity, color mapping, and subtle parallax motion.
5. **Centralized Authentication & Data Layer:**
   - **Direct Supabase SDK (`@supabase/supabase-js@2`):** Direct client-to-database communication for student registration, login, session persistence, password recovery, and profile updates.
   - **Row Level Security (RLS):** All student data operations are enforced at the PostgreSQL database layer (`auth.uid() = id`), guaranteeing zero cross-user data leakage.
   - **Initiatives Telemetry Engine:** Database-driven performance metrics for community initiatives (`public.project_metrics`) with seamless offline client-side fallback.
   - **Authentic Error Propagation:** Strict, transparent UI error reporting (no silent mock fallbacks) notifying users of invalid credentials, unconfirmed emails, or rate limits.
6. **Automated CI/CD:** Cross-platform environment variable injection (`scripts/build-env.js`) for automated zero-downtime deployments via GitHub Actions and Netlify.

---

## 🎨 Layout, Navigation & Animations

### 1. Vertical Snap-Scrolling (Home Fold)
- The primary **Home** section occupies exactly `100vh`.
- Utilizes CSS properties (`scroll-snap-type: y mandatory; overflow-y: auto;`) to enable vertical snap scrolling between the main brand landing card and the quote section: *"Open source isn't just code—it's proof of your potential."*
- Seamlessly resets the scroll position to the top of the fold whenever the user clicks navigations to switch between sections.

### 2. Carousel Grid with Mouse Drag Inertia
- The **Primary Projects** grid is structured with 4 rows.
- **Desktop (>= 1000px):** Arranged in a **4x4 grid** constrained to a centralized `max-width: 1000px`.
- **Mobile (< 992px):** Arranged in a **4x3 grid** with scaled cells (`110px` tall).
- **Infinite Carousel Loop:** The projects list is rendered as three cloned sets (`[Copy 1][Copy 2][Copy 3]`). Scrolling is seamlessly repositioned at boundary crossings.
- **Inertial Momentum:** Dragging calculates scroll displacement velocity. On release, a recursive frame decay loop (`velocity *= 0.95`) glides the grid smoothly to a stop.
- **Overlaid Controls:** Circular chevron navigations (`#prevArrow` and `#nextArrow`) sit on the outer gutters, remaining fixed on screen while cells slide beneath.

### 3. Hardware-Accelerated Section Transitions
- Sections transition using a performant custom timing matching the home header intro (`sectionFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)`).
- Animates exclusively opacity (`0` to `1`) and a smooth vertical glide (`translateY(25px)` to `translateY(0)`). This matches the staggered entrance feel of the home logo while remaining fully hardware-accelerated.

### 4. Centered Card-Deck Window Switcher & Elevation Transitions
- **CSS Grid Stacking:** Encapsulates the Profile Card (`.profile-card`) and Initiatives Dashboard Card (`.dashboard-card`) inside `.profile-stage-wrapper` using `grid-template-areas: "card"`. Both windows share identical centered spatial coordinates, preventing awkward horizontal sliding.
- **Realistic Placement & Pick-Up Elevation Animations:**
  - `@keyframes placeDownOnCard`: Brought in from near the center of the screen with subtle elevation scaling (`scale(1.03) translateY(-12px)`), casting a soft shadow, and gracefully settling flat (`scale(1) translateY(0)`) onto the underlying profile card to cover it completely.
  - `@keyframes pickUpOffCard`: Reverses the sequence, lifting the dashboard card off the stack and revealing the profile card resting beneath.
- **Sequential Animation Controllers:** Managed in `initProfileDashboardSwitcher()` (`index.js`) using `.anim-place-down`, `.anim-covered-under`, `.anim-pick-up`, and `.anim-reveal-under` classes with cleanup handlers.
- **Mobile Protruding Switchers:** On screens `<= 768px`, the window switch buttons (`#profileSwitchToDashboardBtn` and `#dashboardSwitchToProfileBtn`) are anchored to the top-right corner (`top: -10px; right: -10px;`), slightly protruding outside the card boundaries with elevated glass styling and high-contrast drop shadows.

### 5. Mobile Initiatives Gallery Carousel & Directory Jump Modal
- **Single-Card Carousel (`@media (max-width: 768px)`):** Transforms the multi-column desktop initiatives grid into a focused single-card showcase showing one initiative at a time.
  - Features dedicated touch-friendly previous (`#galleryPrevBtn`) and next (`#galleryNextBtn`) navigation buttons.
  - Live serial counter (`#galleryCounter`) rendering current position (`1 / 13`, `2 / 13`, etc.).
- **Full-Viewport Quick Jump Directory Modal (`#metricsJumpModal`):**
  - Triggered via top-right directory buttons (`#dashboardQuickJumpBtn` on desktop, `#mobileMetricsJumpBtn` on mobile).
  - Attached directly to `<body>` to eliminate CSS transform/filter container clipping and ensure full-screen coverage (`100vw` by `100vh`) with `z-index: 99999`.
  - Dynamically toggles `body.modal-open { overflow: hidden !important; }` to lock background document scrolling while the directory is open.
  - Clicking any initiative instantly sets the mobile carousel index, scrolls the card into view, and dismisses the modal.

### 6. Desktop Metrics Layout & Single-Row Aggregates
- **Desktop Action Hierarchy:** Aligns `#dashboardQuickJumpBtn` directly beneath `#dashboardSwitchToProfileBtn` in the upper-right corner of the dashboard card.
- **Single-Row Metric Badges:** Uses `@media (min-width: 640px) { .dashboard-aggregate-stats { grid-template-columns: repeat(4, 1fr); } }` to display all four global ecosystem telemetry pills in a single unified horizontal row.

### 7. Custom Responsive Dropdown Listbox Engine
- **Mobile Viewport Containment:** Replaced browser-native `<select>` popups with glassmorphic ARIA listbox components (`.custom-select-container`, `.custom-select-trigger`, `.custom-select-menu`). Rigid `max-width: 100%; box-sizing: border-box;` constraints prevent the menu from ever extending outside narrow mobile viewports.
- **2-Line Text Wrapping:** Option items wrap cleanly across two lines with `line-height: 1.35; word-break: break-word;`, ensuring verbose university department titles (*"Electrical & Electronic Engineering (EEE)"*) display without truncation.
- **Form Synchronization:** Automatically binds bidirectional event synchronization with native hidden `<select>` controls for native form validation, plus full keyboard accessibility (Enter, Space, Escape, Arrow navigation).

### 8. Dynamic Triple-Anchor Navigation Synchronization
- Global auth state changes automatically synchronize three primary navigation anchors:
  1. **Desktop Navbar:** `#navAuthLink` toggles between `"Login"` (`#auth`) and `"Profile"` (`#profile`).
  2. **Mobile Sidebar Drawer:** `#sidebarJoinBtn` within the drawer transitions between `"Join oU1TS"` and `"Profile"`.
  3. **About Rationale Card:** `#rationaleJoinBtn` dynamically switches between `"Join oU1TS"` (`#auth`) and `"Profile"` (`#profile`).

### 9. Responsive Drawer Menu (Mobile)
- Standard navbar links transition to a mobile hamburger toggle button on touch displays.
- Clicking the hamburger slides out a high-blur sidebar drawer (`.sidebar-menu`) with a backdrop overlay.

### 10. Global Scrollbar Hiding & Section Spacing Normalization
- Visual scrollbars are hidden globally (`scrollbar-width: none` and `::-webkit-scrollbar { display: none; }`) while standard touch gestures, trackpads, and mouse wheel actions remain fully interactive.
- Section header gap spacing normalized across the Projects and About sections for consistent visual rhythm on mobile and desktop viewports.

---

## 🔐 Authentication, Profiles & Security

### 1. Unified Authentication Flow
- **Supabase Client Initializer (`initSupabase`):** Securely reads `window.__ENV.SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- **Registration Form:** Validates Student ID format (digits only, e.g., `04324100051`), Full Name, Email, and Department. On registration, the PostgreSQL trigger `handle_new_user()` automatically inserts the initial row into `public.profiles`.
- **Centralized Header Branding:** Consistent visual identity across both `#auth` and `#profile` views displaying:
  - Heading: `"One account for all of oU1TS"`
  - Subtitle: `"oU1TS uses central database for all of its initiatives"`

### 2. Mandatory Profile Completeness Guard
- Function `isProfileComplete()` checks authenticated profiles for:
  - Numeric Student ID (replaces OAuth placeholder `'OAUTH_USER'`)
  - Department
  - Academic Batch (e.g., `61`)
  - Valid Blood Group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
  - At least one social handle (Facebook, Instagram, Telegram, or Discord)
- If an authenticated user's profile is incomplete, the system automatically redirects to the `#profile` edit form, presents a reminder banner, and disables the cancel button until required data is saved.

### 3. Self-Service Password Recovery Workflow
- **Forgot Password Form (`#forgotPasswordForm`):** Accessible directly from the login card via "Forgot Password?".
- **Reset Email Dispatch:** Executes `supabaseClient.auth.resetPasswordForEmail()` with automated error catching and a 60-second cooldown timer.
- **Recovery Token Interceptor:** Intercepts `PASSWORD_RECOVERY` events in `onAuthStateChange`, prompts the `#resetPasswordForm`, and executes `supabaseClient.auth.updateUser({ password })`.

### 4. Custom SMTP & Rate Limit Elimination
- Documented in [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md):
  - **Gmail SMTP:** Enables up to 500 emails/day via Google App Passwords without requiring a custom domain.
  - **Resend SMTP:** Delivers up to 3,000 emails/month for verified custom domains (`@ou1ts.org`).
  - Bypasses Supabase's default shared limit of 3–4 emails/hour, resolving `429 (over_email_send_rate_limit)`.

### 5. OAuth 2.0 PKCE Flow & Deadlock-Free Session Coordination
- **PKCE Authorization Code Exchange (`exchangeCodeForSession`):** Supports OAuth 2.0 PKCE redirects (e.g. Google Sign-In) with `?code=...`. The code is exchanged via `supabaseClient.auth.exchangeCodeForSession(authCode)` prior to listener attachment, and URL query strings are sanitized cleanly using `window.history.replaceState`.
- **Supabase JS v2 Client Deadlock Prevention:** Calling asynchronous Supabase SDK queries directly within an `async` `onAuthStateChange` callback triggers internal event dispatch deadlocks in `@supabase/supabase-js@2`. The listener is declared synchronous, and all state synchronization routines (`syncAuthStatus`) are deferred using `setTimeout(fn, 0)` to run outside the internal event lock.
- **Hardened Initial Session Navigation:** Evaluates `INITIAL_SESSION` state upon page load or reload; if an active session is detected and the user is either on `#auth`, an empty hash (`''`), or returning from an OAuth callback, the router transitions immediately to `#profile`.


---

## 📊 Initiatives Performance Metrics Dashboard

Accessible via the Profile Card window switcher button (`<` left chevron):

### 1. Contextual Domain Metrics Registry
Pre-configured for all **13 primary ecosystem initiatives**:
- **Resource Archive:** Materials Served (`1,420+`), Active Users/Mo (`3.8k`), Uptime (`99.9%`), Storage Used (`48 GB`).
- **Question Bank:** Papers Indexed (`680+`), Solutions Verified (`92%`), Monthly Downloads (`12.4k`), Contributors (`45`).
- **Academic Scheduler:** Schedules Built (`850+`), Conflict Accuracy (`99.4%`), Routine Views (`5.2k`), Supported Depts (`8`).
- **Notice Board:** Daily Syncs (`96`), Avg Latency (`< 2 min`), Subscribers (`2.1k`), Channels (`Telegram, Web`).
- **Blood Donation:** Verified Donors (`340+`), Urgent Matches (`89`), Avg Response Time (`14 min`), Blood Groups (`8/8 Covered`).
- **Dev Lab:** Active Projects (`18`), Git Commits/Mo (`420+`), Student Builders (`62`), Open PRs (`7`).
- **Faculty Directory:** Faculty Profiles (`165`), Consultation Hours (`Updated`), Searches (`4.1k/mo`), Accuracy (`98%`).
- **Student Forum:** Active Threads (`512`), Daily Posts (`130+`), Active Members (`1.2k`), Spam Block Rate (`99.8%`).
- **Lost & Found:** Items Reported (`210`), Return Rate (`76%`), Student IDs Reunited (`142`), Active Cases (`8`).
- **Campus Transit:** Routes Mapped (`6`), Daily Commuters (`640+`), Schedule Tracking (`In Progress`), Active Drivers (`Pending`).
- **Internship Portal:** Job Listings (`94`), Partner Companies (`32`), Applications (`410+`), Placements (`28`).
- **Event Radar:** Events Hosted (`46`), RSVP Count (`1.8k`), Active Clubs (`14`), Upcoming Events (`3`).
- **Course Reviews:** Courses Reviewed (`42`), Peer Reviews (`280+`), Moderation (`100%`), Dept Coverage (`4/8`).

### 2. Database Schema & Live Telemetry
- Database table: `public.project_metrics` (see [`doc/db/project_metrics_schema.sql`](doc/db/project_metrics_schema.sql)).
- RLS Policy: Public read access (`FOR SELECT USING (true)`), write restricted to `service_role`.
- Frontend gracefully falls back to client baseline telemetry if unseeded or network is unavailable.

---

## 🚀 CI/CD & Automated Production Deployment

### 1. Build Environment Injection (`scripts/build-env.js`)
- Runs cross-platform via Node.js before web server deployment.
- Reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from process environment variables and generates `env-config.js` (`window.__ENV = { ... }`).
- Includes a safety guard to prevent accidental overwrite of existing local development configurations.

### 2. GitHub Pages Actions Pipeline (`.github/workflows/deploy.yml`)
- Triggered on pushes to `main`.
- Injects repository secrets via `node scripts/build-env.js`.
- Verifies generation with a `test -f env-config.js` pipeline step.
- Deploys static artifacts using `actions/deploy-pages@v4`.
- Accompanied by [`.nojekyll`](.nojekyll) to suppress default Jekyll build overwrites.

### 3. Netlify Deployment (`netlify.toml`)
- Triggers `node scripts/build-env.js` on every build command.
- Serves from repository root with zero container dependencies.

---

## 🌓 Theme & Animation Variables

The background starfield and floating bubbles dynamically adapt when toggling Dark and Light modes:

| Variable | Dark Theme (Default) | Light Theme |
|---|---|---|
| `--bg-gradient` | Deep Space Indigo (`#0f0f23` to `#16213e`) | Clean Soft Slate (`#f4f6f9` to `#d8e1f0`) |
| `--star-color` | White (`#ffffff`) | Dark Slate (`#0f172a`) |
| `--star-opacity` | `1` (full visibility) | `0.5` (subtle twinkle) |
| `--circle-opacity` | `0.1` | `0.12` |
| `--circle-gradient` | Cyan to Pink glow | Soft Slate to Blue |
| `--card-shadow` | Classic soft drop shadow | High contrast Slate drop shadow |
| `--text-color` | Bright Slate (`#f8fafc`) | Midnight Navy (`#0f172a`) |
| `--card-bg` | Frosted Dark Glass (`rgba(17, 24, 39, 0.75)`) | Frosted Light Glass (`rgba(255, 255, 255, 0.85)`) |

---

## 📜 Version History

### **v4.1.0 (Mobile Initiatives Gallery, Quick Jump Modal, PKCE Auth Flow & Deadlock Resolution Milestone)**
- **Mobile Initiatives Single-Card Gallery Carousel**:
  - Transformed multi-column metrics grid on mobile screens (`<= 768px`) into an intuitive single-card carousel with touch-friendly navigation arrows and serial position counter (`X / 13`).
  - Implemented `#metricsJumpModal` full-screen directory overlay attached to `<body>` (`100vw` by `100vh`, `z-index: 99999`) with background document scroll locking (`body.modal-open`).
  - Added protruding top-right card switcher buttons (`#profileSwitchToDashboardBtn`, `#dashboardSwitchToProfileBtn`) on mobile cards.
  - Formatted aggregate telemetry pills to display in a unified single row for viewports `>= 640px`.
- **OAuth 2.0 PKCE Flow & Supabase JS v2 Deadlock Resolution**:
  - Implemented PKCE authorization code exchange (`exchangeCodeForSession`) on return from OAuth / magic link redirects.
  - Resolved internal client event dispatch deadlocks in `@supabase/supabase-js@2` by switching `onAuthStateChange` to a synchronous callback and deferring downstream async state synchronization routines using `setTimeout(fn, 0)`.
  - Hardened `INITIAL_SESSION` routing to automatically navigate to `#profile` upon successful authentication when landing with an empty URL hash.
- **Section Spacing & Ecosystem Repository Links**:
  - Added verified direct external links for repository **Source Code** and rendered **Documentation** to the About section footer.
  - Normalized section header spacing between Projects and About sections on both mobile and desktop viewports.

### **v4.0.0 (Initiatives Metrics Dashboard, Custom Dropdown Engine & Production Auth Milestone)**
- **Initiatives Performance Metrics Dashboard**:
  - Implemented `.dashboard-card` inside `.profile-stage-wrapper` displaying domain KPIs for all 13 ecosystem projects.
  - Added centered card-deck elevation animations (`placeDownOnCard`, `pickUpOffCard`) for seamless window switching between profile and metrics views.
  - Created PostgreSQL database schema and seed data in `public.project_metrics` with RLS read access and live frontend queries.
- **Custom Responsive Dropdown Listbox Engine**:
  - Replaced native `<select>` controls with custom glassmorphic ARIA listboxes preventing viewport overflow on mobile devices.
  - Added 2-line option text wrapping and high-contrast styling across dark and light themes.
  - Full keyboard accessibility (Enter, Space, Escape, Arrow keys) and bidirectional form sync.
- **Centralized Authentication & Mandatory Profile Setup**:
  - Real Supabase authentication enforcement, removing mock dataset fallbacks in favor of authentic API feedback.
  - Mandatory profile completeness checks (`isProfileComplete()`) requiring numeric Student ID, Department, Batch, Blood Group, and social handle.
  - Implemented Self-Service Password Recovery workflow (`resetPasswordForEmail`, token recovery listener, and `updateUser({ password })`).
  - Added centralized branding header (`"One account for all of oU1TS"`) across both Auth and Profile views.
  - Unified dynamic navigation states across navbar, mobile sidebar drawer (`#sidebarJoinBtn`), and About section rationale CTA (`#rationaleJoinBtn`).
- **Production CI/CD & SMTP Infrastructure**:
  - Built automated environment variable injector (`scripts/build-env.js`) for GitHub Actions and Netlify.
  - Documented Custom SMTP setup (Gmail App Passwords & Resend) to eliminate default email rate limits.
  - Hardened GitHub Pages deployment with `.nojekyll` and workflow build artifact validation.

### **v3.0.0 (Authentication & Profile Milestone)**
- Introduced the **User Authentication & Profile Engine** supporting user logins, registration, profile viewing, and profile updates.
- Added strict format constraints for Student IDs (numeric) and Blood Groups (alphabetical + symbol).
- Added `Civil` and `IT` departments to registration forms.
- Replaced manual hash redirects with a global `window.switchTab` transition engine.
- Wrapped `pushState` in safety handlers to support local `file://` runs without console crashes.
- Implemented hardware-accelerated fade-in/slide-up section transitions.

### **v2.0.0 (Redesign Milestone)**
- Migrated multi-page structures into a fluid Single Page Application (SPA).
- Relocated UITS Rationale text card to the **About** section.
- Added vertical snap-scrolling to the **Home** section.
- Added momentum-decay glide to the **Primary Projects** scroller.
- Redesigned Projects carousel into a 4-row layout supporting 4x4 (desktop) and 4x3 (mobile) cell views.
- Upgraded SVG inline icons and raw text tags to **Font Awesome v6.4.0** vector icons.
- Positioned scroller chevrons statically over the outer gutters to prevent clipping.
- Enabled dark-slate twinkling stars and bubble drift animations in **Light Mode**.
