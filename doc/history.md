<!-- Frontmatter Tags: #changelog #history #ou1ts #login #database -->

# 20.09.26

### **Fix: Authentication Refresh Disconnect, Metadata Fallback & Uninterrupted Profile Display**
- **Instant Session Pass-Through on Login**:
  - Updated `loginFormElement` and `registerFormElement` in [`index.js`](index.js) to capture the authentication response from `signInUser()` and `signUpUser()` and pass the active `session` directly into `syncAuthStatus('#profile', session)`. This eliminates local storage read lag and guarantees instantaneous routing to `#profile`.
- **User Metadata Fallback in `getCurrentUser`**:
  - Enhanced `getCurrentUser(sessionOverride)` in [`index.js`](index.js) to merge `user.user_metadata` (`full_name`, `student_id`, `department`) alongside database `profiles` records. If database triggers are delayed or profile rows have not yet populated (e.g. for Google OAuth or new signups), user identity attributes remain intact and display correctly rather than reverting to blank values (`—`).
- **Uninterrupted Profile Screen Presentation (`profileReadView`)**:
  - Modified `syncAuthStatus()` so that logged-in users are always presented with their profile showcase (`profileReadView`), even when `isProfileComplete()` is false. Rather than hiding the profile card and trapping the user in the edit form, a gentle banner (`#incompleteProfileBanner`) alerts them to missing fields while preserving view access, avatar, badges, and logout buttons.
- **Clean PKCE Configuration & Race Elimination**:
  - Configured `window.supabase.createClient` with `{ auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } }`, allowing Supabase JS v2's native URL detection to exchange OAuth codes cleanly without competing against manual `exchangeCodeForSession` calls.
  - Added clean query string sanitization via `window.history.replaceState` upon successful auth event processing.
- **Page Load & Reload Session Verification**:
  - Restored immediate session verification on startup in `initAuthSystem()` via `supabaseClient.auth.getSession()`, keeping logged-in users on `#profile` upon browser refresh (`F5`) instead of erroneously kicking them to `#home`.
- **Form Submit & Button Type Hardening**:
  - Explicitly added `type="button"` to `#tabLoginBtn`, `#tabRegisterBtn`, `#googleLoginBtn`, `#editProfileBtn`, and `#logoutBtn` in [`index.html`](index.html), preventing browser native form submission events from triggering unwanted page refreshes.
- **Profile Database Upsert Operation**:
  - Switched `updateProfile()` in [`index.js`](index.js) from `.update().eq('id', user.id)` to `.upsert()`, guaranteeing that users with un-provisioned profile records can save details without silent failures.

### **Session 6 Archival, Comprehensive Documentation Synchronization & v4.1.0 Milestone**
- **Session 6 Archival**:
  - Fully concluded and archived chat session 6 in [`doc/prompts/6. Mobile Navigation, Profile Setup and Theme Contrast.md`](doc/prompts/6.%20Mobile%20Navigation,%20Profile%20Setup%20and%20Theme%20Contrast.md), preserving all prompt cycles, technical deliberations, companion plans, and walkthroughs (`6.1` through `6.8`).
- **Comprehensive Project Documentation Maintenance (`README.md`, `documentation.md`)**:
  - In accordance with repository guidelines in [`AGENTS.md`](AGENTS.md), synchronized all accumulated architectural and UI features landed during Session 6 into [`README.md`](README.md) and [`documentation.md`](documentation.md) (Milestone v4.1.0):
    - Mobile single-card initiatives gallery carousel with prev/next navigation, serial index counter, and quick-jump directory modal.
    - Viewport-contained full-screen overlay dialog (`#metricsJumpModal`) attached to `<body>` with dynamic background scroll locking (`body.modal-open`).
    - Responsive protruding switch buttons on mobile cards for rapid navigation between Profile and Initiatives Dashboard.
    - Single-row aggregate telemetry metrics layout (`grid-template-columns: repeat(4, 1fr)` on `>= 640px`).
    - Robust Supabase Auth v2 PKCE flow integration (`exchangeCodeForSession`) and non-async event listener deadlock resolution using `setTimeout(fn, 0)`.
    - Embedded direct repository Source Code and rendered Documentation links in the About section footer.
    - Refined section header spacing across mobile and desktop breakpoints.

# 19.09.26

### **PKCE Code Exchange, Initial Session Handling & OAuth URL Normalization**
- **PKCE Auth Code Exchange on Redirect (`exchangeCodeForSession`)**:
  - Implemented explicit PKCE authorization code detection in [`index.js`](index.js): when returning from Supabase OAuth or magic link redirects with `?code=...`, `supabaseClient.auth.exchangeCodeForSession(authCode)` is executed immediately to exchange the authorization code for a session before URL cleanup.
  - Sanitized the browser URL after exchange using `window.history.replaceState` targeting `#profile`.
- **`INITIAL_SESSION` Auth State Routing & In-Memory Session Override**:
  - Updated `supabaseClient.auth.onAuthStateChange` to inspect the `session` object passed on `INITIAL_SESSION`: if an active authenticated session exists and the user is either on `#auth`, `#profile`, or returning from OAuth (`code=`), the SPA immediately navigates to `#profile` and updates navigation links.
  - Enhanced `getCurrentUser(sessionOverride)` and `syncAuthStatus(redirectHash, sessionOverride)` to accept active session overrides directly, bypassing unnecessary or delayed `getSession()` round-trips.
  - Added guard in `syncAuthStatus()` preventing premature logout fallback redirects to `#home` while the browser is actively in the process of exchanging auth tokens (`code=` or `access_token=`).
- **OAuth Redirect URL Compliance (RFC 6749)**:
  - Stripped `#profile` URL fragments from `signInWithOAuth` `redirectTo` parameter in [`index.js`](index.js) (`window.location.origin + window.location.pathname`), ensuring compliance with OAuth 2.0 standards and exact matching against Supabase Allowed Redirect URLs.
- **Initial Navigation Guard (`handleInitialHash`)**:
  - Updated `handleInitialHash()` to check for `search.includes('code=')` and `hash.includes('access_token=')`, directing incoming auth callbacks straight to `#profile` without clearing query parameters.

### **Auth Callback Deadlock Fix & Hardened INITIAL_SESSION Routing**
- **`onAuthStateChange` Deadlock Prevention**:
  - Removed `async` keyword from the `onAuthStateChange` callback. Per Supabase JS v2 documentation, making async Supabase API calls (such as `getSession()`, `getUser()`, or Postgres queries) directly inside `onAuthStateChange` can cause **deadlocks**. All calls to `syncAuthStatus()` are now deferred with `setTimeout(fn, 0)` to run outside the Supabase internal event microtask queue.
  - Split `TOKEN_REFRESHED` as a distinct case to silently update session reference without triggering navigation.
- **PKCE Code Exchange Before Listener Registration**:
  - Reorganized `initAuthSystem()` so that `supabaseClient.auth.exchangeCodeForSession(authCode)` is executed **before** `onAuthStateChange` is registered. This ensures that the `SIGNED_IN` event generated by the code exchange fires correctly into the registered listener (rather than being missed).
- **Hardened `INITIAL_SESSION` Routing**:
  - Extended the `INITIAL_SESSION` routing condition from `currentHash === '#auth'` to also catch `!currentHash` (empty hash, as on OAuth redirect return), ensuring that any page load with a valid session and no explicit destination always routes to `#profile`.
  - Displays auth-aware nav links (Profile button) immediately via `syncAuthStatus(null, session)` for pages where the user should remain (e.g., refreshing on `#home` while logged in).

### **Post-Login Profile Redirection & Robust Session Synchronization**
- **Guaranteed Post-Login Profile Navigation**:
  - Updated `supabaseClient.auth.onAuthStateChange` in [`index.js`](index.js) to explicitly call `await syncAuthStatus('#profile')` on `SIGNED_IN` events, ensuring that user authentication (via Email/Password or Google OAuth) immediately transitions directly to the `#profile` section instead of falling back to `#home`.
  - Updated Google OAuth `redirectTo` to include `#profile` (`window.location.origin + window.location.pathname + '#profile'`), allowing `handleInitialHash()` to recognize the post-OAuth redirect and switch immediately to the profile view on return.
  - Replaced delayed `setTimeout` redirect invocations in `loginForm` and `registerForm` submit listeners with immediate `await syncAuthStatus('#profile')` navigation.
- **Fail-Safe User & Profile Record Retrieval (`getCurrentUser`)**:
  - Enhanced `getCurrentUser()` in [`index.js`](index.js) to check synchronous cached session data (`supabaseClient.auth.getSession()`) first before issuing network requests.
  - Replaced `.single()` with `.maybeSingle()` wrapped in a try/catch when querying the `profiles` table. This prevents PostgREST `PGRST116` errors (thrown when a newly registered user does not yet have a profile row) from returning `null` for the entire authenticated user session and inadvertently triggering a logout redirect to `#home`.

### **Full-Viewport Modal Overlay, Protruding Mobile Action Buttons & Single-Row Aggregate Metrics**
- **Full Viewport Overlay & Background Scroll Locking**:
  - Relocated `#metricsJumpModal` out of the transformed/filtered `#initiativesDashboardCard` container directly into `<body>` in [`index.html`](index.html), removing containing block entrapment and ensuring the modal dialog and backdrop cover the entire screen viewport (`100vw` by `100vh`) with `z-index: 99999`.
  - Added `body.modal-open { overflow: hidden !important; }` in [`index.css`](index.css) toggled dynamically via `openMetricsModal()` and `closeMetricsModal()` in [`index.js`](index.js) to freeze background document scrolling while the directory modal is active.
- **Desktop Action Placement & Summarized Metrics Row Layout**:
  - Reorganized desktop action layout in [`index.css`](index.css): positioned `#dashboardQuickJumpBtn` (`top: 74px; right: 22px;`) directly underneath `#dashboardSwitchToProfileBtn` (`top: 22px; right: 22px;`).
  - Added `@media (min-width: 640px) { .dashboard-aggregate-stats { grid-template-columns: repeat(4, 1fr); } }` ensuring all 4 summarized telemetry stat pills display cleanly in a single horizontal row whenever screen space permits.
- **Mobile Protruding Window Switchers & Gallery Controls Quick Jump**:
  - Anchored `#dashboardSwitchToProfileBtn` (and `#profileSwitchToDashboardBtn`) to the top-right corner of the window (`top: -10px; right: -10px;`) on mobile screens (`@media (max-width: 768px)`), slightly protruding past the card border with elevated dark glass styling and shadow elevation.
  - Placed `#dashboardQuickJumpBtn` directly into `#metricsGalleryControls` in [`index.html`](index.html), positioned at `top: -10px; right: -8px;` protruding slightly outside the gallery controls container, freeing header space and contextually linking the directory search directly to the single-card gallery view.

### **Reduced Page Gap Above Initiatives Section Title & Scaled Mobile Top Spacing**
- **Desktop Section Alignment Matching About Section**:
  - Overrode `.spa-section.active` flex centering behavior for `#projects` and `#about` by configuring `#projects.spa-section.active, #about.spa-section.active { justify-content: flex-start; }` in [`index.css`](index.css).
  - Eliminated the excessive and variable vertical centering gap that previously pushed the `"Initiatives"` section heading far down on desktop viewports, aligning its top fold gap directly to the `80px` standard established by the `"About oU1TS"` section.
- **Responsive Mobile & Tablet Viewport Gap Scaling**:
  - Added responsive padding rules across breakpoints:
    - Tablet (`@media (max-width: 992px)`): `.spa-section { padding-top: 48px; }` and `#projects.spa-section { padding-top: 40px; }`.
    - Mobile (`@media (max-width: 768px)`): `.spa-section { padding-top: 28px; }` and `#projects.spa-section { padding-top: 22px; }`.
    - Compact Mobile (`@media (max-width: 480px)`): `.spa-section { padding-top: 20px; }` and `#projects.spa-section { padding-top: 16px; }`.
  - Scaled down `.projects-header-container .section-subtitle` bottom margin from `40px` to `18px` on mobile screens, optimizing vertical density and bringing the squircle card grid into immediate viewport prominence without dead whitespace.

### **Profile Mobile Typography Scaling, Project Metrics Gallery View & Quick-Jump Directory Modal**
- **Mobile Page Element & Typography Scaling**:
  - Scaled down font sizes, numerical indicators, padding, and avatars across `.profile-card`, `#initiativesDashboardCard`, and inner components under `@media (max-width: 768px)` in [`index.css`](index.css).
  - Scaled profile avatar from `90px` to `62px`, profile name to `1.25rem`, details grid text and student ID numbers to `0.88rem`, aggregate metrics numbers (`.agg-stat-num`) to `0.95rem`, and KPI values to `0.82rem`, preventing screen overflow.
- **Single-Card Mobile Gallery View with Serial Counter & Touch Swiping**:
  - Transformed `.project-metrics-grid` into a mobile gallery view showing exactly one project's performance card at a time with smooth `@keyframes galleryCardFadeIn` transitions.
  - Added `#metricsGalleryControls` in [`index.html`](index.html) featuring left and right navigation buttons (`#metricsGalleryPrevBtn`, `#metricsGalleryNextBtn`) and a formatted serial counter (`#metricsGalleryCounter` displaying `01 / 13`).
  - Added touch swipe gesture listeners (`touchstart`/`touchend` horizontal delta detection) in [`index.js`](index.js) for native-feeling carousel navigation.
- **Top-Right Quick Jump Initiatives Directory Modal**:
  - Added `.dashboard-top-actions` container in [`index.html`](index.html) housing a quick-jump directory button (`#dashboardQuickJumpBtn` with `<i class="fa-solid fa-layer-group"></i>`) alongside the return profile switcher.
  - Built an accessible frosted-glass modal (`#metricsJumpModal`) listing all 13 initiatives with live search filtering (`#metricsModalSearch`), category tags, operational status badges, and health score indicators.
  - Selecting any initiative instantly navigates the mobile gallery view directly to that project's card (or smoothly scrolls to and highlights it on desktop via `@keyframes metricCardPulse`).

### **Source Code & Rendered Documentation Links Added to About Section**
- **Bottom Section Footer Navigation**:
  - Inserted `.about-footer-links` container at the bottom of the About section in [`index.html`](index.html).
  - Added repository link as `"Source Code"` pointing to `https://github.com/oU1TS/ou1ts.github.io` with GitHub vector icon.
  - Added rendered documentation link pointing to `https://b1tranger.netlify.app/render.html?file=https%3A%2F%2Fgithub.com%2FoU1TS%2Fou1ts.github.io%2Fblob%2Fmain%2Fdocumentation.md` with open book icon.
  - Styled with glassmorphism pill containers, hover elevation transitions, and theme-adaptive shadows in [`index.css`](index.css).

### **About Section Rationale CTA Button Synchronized with Auth State**
- **Unified Navigation & CTA State**:
  - Connected `#rationaleJoinBtn` within the About section's rationale card to `updateNavLinksForAuth(isLoggedIn)` in [`index.js`](index.js).
  - When logged out, it displays `"Join oU1TS"` (`#auth`) with the handshake icon; when logged in, it dynamically transforms into `"Profile"` (`#profile`) with the user gear icon, aligning with the desktop navbar and mobile sidebar navigation anchors.

### **Profile Dashboard Switcher & Initiatives Contextual Metrics Dashboard**
- **Centered Seamless Window Placing & Picking-Up Animation**:
  - Replaced side-sliding push transitions with a centered card-deck overlay mechanism using `grid-template-areas: "card"` on `.profile-stage-wrapper` in [`index.css`](index.css). Both the Profile and Dashboard cards stay strictly centered along the same vertical axis without abrupt lateral displacements.
  - Implemented `@keyframes placeDownOnCard` on the Dashboard card, bringing it from near the screen center with a slight floating scale and elevation shadow and placing it smoothly onto the Profile card to cover it completely.
  - Implemented `@keyframes pickUpOffCard` to pick up the Dashboard card off the stack and reveal the Profile card resting directly beneath it.
  - Updated `initProfileDashboardSwitcher()` in [`index.js`](index.js) to sequence `.anim-place-down`, `.anim-covered-under`, `.anim-pick-up`, and `.anim-reveal-under` animations with seamless state transitions.
- **Profile Window Switcher Structure**:
  - Encapsulated `.profile-card` and `.dashboard-card` inside `.profile-stage-wrapper` in [`index.html`](index.html).
  - Added window switcher button (`#profileSwitchToDashboardBtn`) on the top-right corner of the profile card with left arrowhead (`<i class="fa-solid fa-chevron-left"></i>`) and hover tooltip.
  - Added return switcher button (`#dashboardSwitchToProfileBtn`) on the top-right of the metrics dashboard window with right arrowhead (`<i class="fa-solid fa-chevron-right"></i>`).
- **Contextual Performance Metrics Registry for Primary Projects**:
  - Created `projectPerformanceMetrics` in [`index.js`](index.js) detailing domain-specific real-world KPIs for all 13 projects (e.g. materials served for Resource Archive, question solutions for Question Bank, schedule conflicts for Academic Scheduler, emergency donor match rates for Blood Donation, repositories/commits for Dev Lab, etc.).
  - Built `renderProjectMetricsDashboard()` dynamically building squircle header cards, status badges (`Operational`, `Beta Testing`, `In Development`) with glowing indicators, health progress bars, 2x2 metric pills, and live launch buttons.

### **Custom Responsive Dropdown Component with 2-Line Text Wrapping & Screen Containment**
- **Mobile Viewport Overflow Prevention**:
  - Replaced native `<select>` controls with custom, responsive glassmorphic dropdowns (`.custom-select-container`, `.custom-select-trigger`, `.custom-select-menu`, `.custom-select-option`) in [`index.css`](index.css).
  - Enforced `max-width: 100%; box-sizing: border-box;` on both the trigger and dropdown menu popup to ensure the menu never extends outside the viewport or triggers horizontal scrollbars on mobile devices.
  - Implemented 2-line text wrapping with `white-space: normal; word-break: break-word; overflow-wrap: break-word; line-height: 1.35;` on option items, cleanly displaying verbose department names like *"Computer Science & Engineering (CSE)"* and *"Electrical & Electronic Engineering (EEE)"*.
  - Configured high-contrast themes for dropdown menus across dark mode (`#161b26` background, `#f8fafc` text) and light mode (`#ffffff` background, `#0f172a` text).
- **Dynamic Attachment & Form Synchronization**:
  - Created `initCustomDropdowns()` in [`index.js`](index.js) that automatically discovers all `.input-wrapper select` elements (`#registerDept`, `#editDept`, `#editBlood`), hides native controls via `.visually-hidden-select`, and renders accessible ARIA listbox structures.
  - Bound bidirectional value synchronization: option clicks update `<select>.value` and dispatch `change` events for seamless form validation, while programmatically updating inputs via `select._updateCustomDropdown()` synchronizes the visible trigger button.
  - Built keyboard navigation support (Enter, Space, Escape, Arrow keys) and global document click listeners for auto-closing open dropdowns.

### **Centralized Header Added to Authentication/Login Page**
- **Auth Page Header Alignment**:
  - Inserted `.auth-page-header` directly above `.auth-card` in [`index.html`](index.html) displaying heading `"One account for all of oU1TS"` and subtitle `"oU1TS uses central database for all of its initiatives"`, identical to the profile section.
  - Linked styles in [`index.css`](index.css) to guarantee unified visual identity across both auth and profile pages.

### **Custom SMTP Setup Guide & Rate Limit Diagnostics Added to Setup Documentation**
- **Expanded Setup Guide with SMTP Protocols**:
  - Updated [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) with Step 3.3 ("Custom SMTP Setup") detailing how to bypass Supabase's default 3–4 email/hour rate limit.
  - Documented complete setup instructions for **Gmail SMTP** (App Passwords, zero domain requirement, 500 emails/day) and **Resend** (custom domain DNS verification, 3,000 emails/month).
  - Added troubleshooting entry for `over_email_send_rate_limit` (HTTP 429) directing users to configure Custom SMTP in Supabase project settings.

### **Supabase Password Recovery Workflow & Forgot Password Trigger**
- **Forgot Password UI in Login Card**:
  - Added `.form-label-row` in [`index.html`](index.html) housing a dedicated `#forgotPasswordBtn` ("Forgot Password?") directly above the password field.
  - Added `#forgotPasswordForm` (email entry + link dispatch) and `#resetPasswordForm` (new password + confirmation) within the `#auth` section.
  - Styled labels, triggers, and back buttons with responsive glassmorphism in [`index.css`](index.css).
- **Client Recovery & Reset Logic**:
  - Bound `supabaseClient.auth.resetPasswordForEmail()` with a 60-second cooldown timer on the submit button and explicit detection for `429` (`over_email_send_rate_limit`) errors in [`index.js`](index.js).
  - Intercepted `PASSWORD_RECOVERY` events in `supabaseClient.auth.onAuthStateChange` and parsed recovery hashes on page load to reveal `#resetPasswordForm`.
  - Implemented `supabaseClient.auth.updateUser({ password })` handling with length validation (min 6 characters) and automated login upon completion.

### **Mobile Navigation Refinement, Mandatory Profile Setup & Select Contrast Improvements**
- **Mobile Sidebar Auth Simplification**:
  - Removed dedicated `#sidebarAuthLink` ("Login") from `.sidebar-links` in [`index.html`](index.html).
  - Configured `#sidebarJoinBtn` within `.sidebar-join` as the dynamic authentication anchor in [`index.js`](index.js). When logged out, it displays `"Join oU1TS"` linking to `#auth`. When authenticated, it transforms into `"Profile"` with user icon linking to `#profile`.
- **Profile Section Header Standardized**:
  - Inserted `.profile-page-header` directly above `.profile-card` in [`index.html`](index.html) with heading `"One account for all of oU1TS"` and subtitle `"oU1TS uses central database for all of its initiatives"`.
  - Added matching typography and spacing rules in [`index.css`](index.css).
- **High-Contrast Dropdown `<select>` Options Across Themes**:
  - Added `color-scheme: dark;` to `:root` and `.input-wrapper select`, and `color-scheme: light;` to `body.light-mode` in [`index.css`](index.css).
  - Explicitly styled `.input-wrapper select option` with dark background (`#161b26`) and bright white text (`#f8fafc`) in dark mode, and pure white background (`#ffffff`) with dark slate text (`#0f172a`) in light mode, eliminating invisible white-on-white text in browser dropdown popups.
- **Mandatory Profile Completion Flow**:
  - Created `isProfileComplete()` in [`index.js`](index.js) validating presence of numeric Student ID (not `'OAUTH_USER'`), Department, Batch, Blood Group, and at least one social handle (Facebook, Instagram, Telegram, or Discord).
  - Updated `syncAuthStatus()` to automatically open the edit view (`#profileEditForm`), display an alert banner, and hide the cancel button if an authenticated user's profile is incomplete.
  - Enforced required validation checks in `updateProfile()` and form submission handler to ensure profile completeness before committing to Supabase `public.profiles`.

### **Fix: Navbar Responsiveness, Supabase Variable Scope Collision & Navigation Resilience**
- **Resolved Identifier Scope Collision in `index.js`**: Renamed `let supabase = null;` to `let supabaseClient = null;` across all database and auth references. The CDN bundle for `@supabase/supabase-js@2` declared `var supabase` on the global scope, causing modern JavaScript engines to throw `SyntaxError: Identifier 'supabase' has already been declared` and abort script execution before navigation listeners could attach.
- **Immediate DOM-Ready Initialization Fallback**: Replaced bare `document.addEventListener('DOMContentLoaded', ...)` with a ready-state guard checking `document.readyState === 'loading'`. This ensures `initApp()` and `initNavigation()` execute immediately if the DOM is already interactive or complete.
- **Added Pointer Cursor**: Set `cursor: pointer;` on `.nav-link` in [`index.css`](index.css).

### **Automated Netlify Build Environment Injection & Redundant Script Prevention**
- **Automated Netlify Environment Configuration**: Added [`netlify.toml`](netlify.toml) and cross-platform build script [`scripts/build-env.js`](scripts/build-env.js) to automatically generate `env-config.js` during Netlify deployments from configured environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- **Eliminated Redundant 404 Logging in `loadEnvConfig`**: Added a script-presence guard in `loadEnvConfig()` within [`index.js`](index.js) preventing duplicate dynamic script tag injections when `env-config.js` is already declared in `index.html`.
- **Expanded Setup Guide for Netlify**: Added Step 7 in [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) documenting Netlify Dashboard environment variable setup and cache-clearing deployment.

### **Deployment Source Clarification & CI Script Unification**
- **Unified CI Environment Injection via `scripts/build-env.js`**: Updated [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) to utilize `node scripts/build-env.js` directly with GitHub Secrets mapped via `env:`, standardizing build logic across both GitHub Actions and Netlify and avoiding shell heredoc escaping issues.
- **Added Local File Preservation Safeguard**: Added an execution guard in [`scripts/build-env.js`](scripts/build-env.js) checking for existing local `env-config.js` when run outside CI environments (`CI`, `NETLIFY`, `GITHUB_ACTIONS`), ensuring local credentials are never accidentally erased by manual script invocations.
- **Diagnosed Demo Values Fallback in Client-Side Login**:
  - **GitHub Pages 404**: Confirmed `https://ou1ts.github.io/env-config.js` returned 404 because GitHub Pages repository source was configured to "Deploy from a branch" (which runs GitHub's internal `pages-build-deployment` and excludes gitignored files) rather than "GitHub Actions".
  - **Netlify Empty Secrets**: Confirmed `https://ou1ts.netlify.app/env-config.js` returned empty string values because `SUPABASE_URL` and `SUPABASE_ANON_KEY` were not yet populated in Netlify Site Configuration environment variables.
  - **Local Mock Trigger**: Documented that both 404 and empty credential states cause `isSupabaseConfigured()` in [`index.js`](index.js) to evaluate to `false`, activating the fallback demo seed dataset in `localStorage` (`mock_users`).

### **Architectural Clarification: Direct Client-to-Supabase vs Backend Service**
- **Verified Server Independence for Client Auth**: Confirmed that client authentication, registration, session management, and profile CRUD execute directly against Supabase's hosted API via `@supabase/supabase-js@2`, requiring zero involvement from `ou1ts-backend`.
- **Confirmed Cause of Mock Fallback**: Reaffirmed that the absence of a running `ou1ts-backend` service does not cause the `env-config.js` 404 or the fallback to demo values; the sole cause is missing client-side environment variables in the static host.

### **Removal of Mock Fallback & Real Authentication Enforcement**
- **Eliminated Local Mock Fallback**: Completely removed mock dataset seeding (`mock_users`) and simulated session state (`mock_session`) from [`index.js`](index.js). Failed logins, invalid credentials, or unconfigured Supabase environments now throw and display authentic error messages (`Unable to log in: Database connection not configured`) directly in the UI alert banner without silently defaulting to demo profiles.
- **Removed Simulated Google OAuth**: Replaced simulated mock OAuth handler for Google login in [`index.js`](index.js) with strict Supabase OAuth dispatch, surfacing explicit configuration errors if the client is not initialized.
- **Purged Legacy Mock Storage**: Added automatic cleanup calls (`localStorage.removeItem('mock_session')`, `localStorage.removeItem('mock_users')`) on app initialization to instantly wipe any leftover demo data from client browsers.
- **Sanitized Profile Card Template**: Replaced hardcoded demo preview strings ("User Name", "0432410005", "CSE • Batch N/A") in [`index.html`](index.html) with clean neutral indicators (`—`).

### **Setup Guide Refinement & Schema Synchronization**
- **Synchronized Trigger Attributes**: Updated `handle_new_user()` in [`doc/db/user_profile_schema.sql`](doc/db/user_profile_schema.sql) and [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) to auto-populate `department` from user registration metadata into `public.profiles`.
- **End-to-End Walkthrough Updated**: Refined [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) with comprehensive instructions covering project creation, SQL schema execution, email confirmation settings, local Live Server verification, and mandatory GitHub Pages Source switching to **GitHub Actions**.
- **Non-Mock Troubleshooting**: Replaced mock mode troubleshooting items with authentic error diagnostics for `Invalid login credentials`, `Email not confirmed`, and missing environment configurations.
- **Security Clarification on `localhost` Redirect URLs**: Documented in [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) why having `localhost:5500` in Supabase Redirect URLs is safe, how loopback routing works, and why database authorization is strictly enforced by PostgreSQL Row Level Security (RLS) rather than caller domains.

### **CI/CD Pipeline Hardening & Live Site 404 Root Cause Resolution**
- **Diagnosed Overwrite by Branch Deployment**: Querying the GitHub Actions API revealed that every push to `main` triggers both `Deploy to GitHub Pages with Env Injection` AND a concurrent `pages build and deployment` (event: `dynamic`). The dynamic job runs GitHub's default Jekyll builder directly against the `main` branch, overwriting the Actions deployment and dropping `env-config.js` (which is gitignored).
- **Added `.nojekyll` Marker**: Created [`.nojekyll`](.nojekyll) in the repository root to suppress default Jekyll processing.
- **Added Generation Validation to Workflow**: Added a verification step in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (`test -f env-config.js && ls -lh env-config.js`) to guarantee that `env-config.js` exists and is logged before packaging.
- **Sanitized Secrets Input**: Added `.trim()` to `SUPABASE_URL` and `SUPABASE_ANON_KEY` in [`scripts/build-env.js`](scripts/build-env.js) to safeguard against accidental whitespace or newline characters when copying secrets into GitHub Actions settings.

# 18.09.26

### **Database Schema Alignment, Project AGENTS.md & Step-by-Step Login Setup Guide**
- **Added Blood Group Attribute**: Updated `profiles` schema in [`[DoNotCommit]oU1TS_Central_Database_Guide(from portal repo).md`](doc/idea/[DoNotCommit]oU1TS_Central_Database_Guide(from%20portal%20repo).md), [`user_profile_schema.sql`](doc/db/user_profile_schema.sql), and [`supabase_setup_guide.md`](doc/db/supabase_setup_guide.md) to define `blood_group` with check constraints and auto-insertion in `handle_new_user` trigger.
- **Created Step-by-Step Login Guide**: Added [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) containing an end-to-end guide covering Supabase project creation, SQL script execution, auth redirect configuration, local `env-config.js` testing, and GitHub Actions secret deployment.
- **Adopted Project Rules**: Created [`AGENTS.md`](AGENTS.md) adapted from `b1t-Acad` guidelines establishing rules for changelog maintenance (`doc/history.md`), per-turn prompt archiving (`doc/prompts/`), code quality standards, and commit message suggestions.
- **Session Prompt Archive**: Initialized [`doc/prompts/5. Central Database Setup and Login Integration Guide.md`](doc/prompts/5.%20Central%20Database%20Setup%20and%20Login%20Integration%20Guide.md) archiving user requests, internal reasoning, and assistant responses.

### **Central Backend Architecture Assessment & Gitignored Boilerplate**
- **Gitignore Protection**: Added `ou1ts-backend/` to [`.gitignore`](.gitignore) to allow local development and staging without polluting the static frontend repository.
- **Created Central Backend Starter (`ou1ts-backend`)**: Built a modular, production-ready Node.js/Express service scaffold featuring:
  - Supabase client & admin integration (`@supabase/supabase-js`) with `service_role` security.
  - JWT Bearer auth middleware verifying sessions across all frontend sub-projects.
  - REST endpoints for profiles (`/api/profiles/me`), blood donor directory (`/api/profiles/donors`), and canonical project roster (`/api/projects`).
  - Webhook dispatch handlers for Telegram notifications and Discord emergency blood calls.
  - Supabase SQL schema migrations and Dockerfile for containerized deployment (Render/Fly.io).
- **Environment Credential Separation Clarified**: Clarified that `env-config.js` (`window.__ENV`) is strictly for client-side static frontends, whereas `ou1ts-backend` utilizes standard Node.js `.env` (`process.env`) with `SUPABASE_SERVICE_ROLE_KEY`.

### **Automated Production Deployment Workflow**
- **Created GitHub Actions Workflow**: Added [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) configuring automated `env-config.js` injection from GitHub repository secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) and automated artifact deployment to GitHub Pages.
- **Updated Setup Guide**: Enhanced Step 6 in [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) with instructions to switch GitHub Pages Source to **GitHub Actions**.

### **Rule Enhancement: Full Conversation Retention & Secret Sanitization**
- **Updated Repository Guidelines**: Modified [`AGENTS.md`](AGENTS.md) Section 2 to strictly prohibit summarizing or condensing chat turns, mandating complete unabridged preservation of user inputs, internal thinking, and outputs.
- **Enforced Mandatory Secret Redaction**: Added explicit rule requiring all API keys, database passwords, JWT tokens, and OAuth credentials to be replaced with descriptive placeholders (`<YOUR_SUPABASE_URL>`, `<YOUR_SUPABASE_ANON_KEY>`, `[REDACTED_SECRET]`) across all markdown archives and docs.

### **Fix: Frontend Supabase Client Initialization, Static Script Inclusion & Favicon 404**
- **Resolved Chicken-and-Egg Guard in `isSupabaseConfigured`**: Fixed a bug in [`index.js`](index.js) where `isSupabaseConfigured()` checked `window.supabase` before the Supabase SDK was loaded, erroneously forcing the application into Local Mock mode even when valid credentials were provided.
- **Static Script Preloading**: Added `<script src="env-config.js"></script>` and `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` to [`index.html`](index.html) prior to `index.js`, eliminating dynamic script loading race conditions and 404 errors.
- **Added SVG Favicon**: Added an inline SVG favicon `<link rel="icon" ...>` in [`index.html`](index.html), eliminating browser console `/favicon.ico:1 404` errors.
- **Enhanced Setup Guide Troubleshooting**: Added troubleshooting checklist items in [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) for cache clearing and mock mode fallback.




