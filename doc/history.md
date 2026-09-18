<!-- Frontmatter Tags: #changelog #history #ou1ts #login #database -->

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



