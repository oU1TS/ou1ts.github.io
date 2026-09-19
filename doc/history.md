<!-- Frontmatter Tags: #changelog #history #ou1ts #login #database -->

# 19.09.26

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




