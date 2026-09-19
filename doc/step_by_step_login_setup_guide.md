# oU1TS Centralized Login & Database — Step-by-Step Setup Guide

This document provides an end-to-end, actionable checklist to set up a live **Supabase** backend, execute the PostgreSQL schema, configure environment variables, and verify live registration and login for **`ou1ts.github.io`** and its sub-projects.

---

## 📋 Overview of the Complete Setup Flow

```
[ Step 1: Create Supabase Project & Copy API Keys ]
                    │
                    ▼
[ Step 2: Run SQL Schemas in Supabase SQL Editor ] (Creates profiles & project_metrics tables, RLS, triggers & seed data)
                    │
                    ▼
[ Step 3: Configure Auth URLs, Email & Custom SMTP ] (Set Site URL, Redirects, and Custom SMTP)
                    │
                    ▼
[ Step 4: Configure Local env-config.js ] (Connects your local testing server to live Supabase DB)
                    │
                    ▼
[ Step 5: Test Registration & Login Locally ] (Verify real account created in Supabase Table Editor)
                    │
                    ▼
[ Step 6: Configure GitHub Actions & Deploy Pages ] (Switch Pages Source to GitHub Actions + Secrets)
                    │
                    ▼
[ Step 7: Configure Netlify Environment Variables ] (Optional: If using Netlify hosting)
```

---

## Step 1: Create the Supabase Project & Retrieve Credentials

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project** (or select your existing organization).
3. Fill in the project details:
   - **Name**: `oU1TS-Central`
   - **Database Password**: Generate a secure password and **save it in your password manager**.
   - **Region**: Select a region close to Bangladesh / South Asia (e.g., `Singapore` or `India`).
   - **Pricing Plan**: Free tier.
4. Click **Create new project** and wait ~2 minutes for provisioning to finish.
5. In your project dashboard, navigate to **Project Settings** (gear icon in sidebar) → **API**:
   - Copy **Project URL** (format: `https://<project-ref>.supabase.co`).
   - Copy **Project API Keys → `anon` public key** (long string starting with `eyJhbGci...`).
   - *(Keep the `service_role` key confidential — it must never be placed in frontend code).*

---

## Step 2: Execute the Database Schema SQL

In your Supabase dashboard sidebar, open the **SQL Editor** (icon with `>_`). You will execute two schemas: one for user profiles and authentication, and one for the initiatives performance metrics dashboard.

### 2.1 User Profile & Auth Schema (`public.profiles`)
Click **New query** and paste the script below (also stored in [`doc/db/user_profile_schema.sql`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/db/user_profile_schema.sql)):

```sql
-- ========================================================
-- oU1TS Centralized Database: User Profile & Auth Schema
-- ========================================================

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  student_id TEXT,
  department TEXT,
  batch TEXT,
  blood_group TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_telegram TEXT,
  social_discord TEXT,
  project_tags TEXT[] DEFAULT ARRAY['root']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Format & value validation constraints
  CONSTRAINT check_student_id_numeric_or_oauth 
    CHECK (student_id ~ '^[0-9]+$' OR student_id = 'OAUTH_USER' OR student_id IS NULL),
  
  CONSTRAINT check_blood_group_valid 
    CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') OR blood_group IS NULL)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 4. Partial Unique Index for Student ID (allows multiple OAuth sign-ins while keeping student IDs unique)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_id_unique
  ON public.profiles (student_id)
  WHERE student_id IS NOT NULL AND student_id <> 'OAUTH_USER';

-- 5. Auto-Profile Creation Trigger (Automatically creates a profile row when auth.users is populated)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    student_id, 
    email, 
    full_name, 
    department,
    blood_group,
    project_tags
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'student_id', 'OAUTH_USER'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'department', NULL),
    COALESCE(NEW.raw_user_meta_data->>'blood_group', NULL),
    ARRAY['root']::TEXT[]
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Helper Function: Add Project Tag (for sub-projects like /portal, /scheduler)
CREATE OR REPLACE FUNCTION public.add_project_tag(tag TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET project_tags = array_append(project_tags, tag),
      updated_at = NOW()
  WHERE id = auth.uid()
    AND NOT (tag = ANY(project_tags));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Click **Run** (green button). Verify that the status reports `Success. No rows returned`.

---

### 2.2 Initiatives Performance Metrics Schema (`public.project_metrics`)
Click **New query** and paste the script below (also stored in [`doc/db/project_metrics_schema.sql`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/db/project_metrics_schema.sql)). This table powers the **Initiatives Performance Metrics Dashboard** accessible via the Profile Card Window Switcher:

```sql
-- ========================================================
-- oU1TS Centralized Database: Initiatives Performance Metrics Schema
-- ========================================================

-- 1. Create the project_metrics table
CREATE TABLE IF NOT EXISTS public.project_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  status_type TEXT NOT NULL CHECK (status_type IN ('operational', 'beta', 'dev')),
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  summary TEXT,
  kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.project_metrics ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Public read-only access, writes restricted to service_role / administrators
DROP POLICY IF EXISTS "Anyone can view project metrics" ON public.project_metrics;
CREATE POLICY "Anyone can view project metrics" ON public.project_metrics
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can modify project metrics" ON public.project_metrics;
CREATE POLICY "Service role can modify project metrics" ON public.project_metrics
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. Seed Data: Initial Performance Telemetry for all 13 Primary Projects
INSERT INTO public.project_metrics (project_name, category, status, status_type, health_score, summary, kpis)
VALUES
  (
    'Resource Archive', 'Academic Repositories', 'Operational', 'operational', 98,
    'Centralized syllabus, lecture notes, textbook PDFs, and lab manuals organized by department and semester.',
    '[{"label": "Materials Served", "val": "1,420+"}, {"label": "Active Users/Mo", "val": "3.8k"}, {"label": "Uptime", "val": "99.9%"}, {"label": "Storage Used", "val": "48 GB"}]'::jsonb
  ),
  (
    'Question Bank', 'Exam Prep & Archives', 'Operational', 'operational', 96,
    'Midterm and final exam question collections with peer-reviewed solutions, mark distributions, and search filters.',
    '[{"label": "Papers Indexed", "val": "680+"}, {"label": "Solutions Verified", "val": "92%"}, {"label": "Monthly Downloads", "val": "12.4k"}, {"label": "Contributors", "val": "45"}]'::jsonb
  ),
  (
    'Academic Scheduler', 'Course & Routine Tools', 'Beta Testing', 'beta', 91,
    'Conflict-free course schedule builder, classroom finder, and exam routine visualizer synced with university notices.',
    '[{"label": "Schedules Built", "val": "850+"}, {"label": "Conflict Accuracy", "val": "99.4%"}, {"label": "Routine Views", "val": "5.2k"}, {"label": "Supported Depts", "val": "8"}]'::jsonb
  ),
  (
    'Notice Board', 'Campus Feeds & Alerts', 'Operational', 'operational', 99,
    'Real-time automated notification aggregator scraping official university department notices, holidays, and deadlines.',
    '[{"label": "Daily Syncs", "val": "96"}, {"label": "Avg Latency", "val": "< 2 min"}, {"label": "Subscribers", "val": "2.1k"}, {"label": "Channels", "val": "Telegram, Web"}]'::jsonb
  ),
  (
    'Blood Donation', 'Emergency Services', 'Operational', 'operational', 97,
    'Student voluntary blood donor registry enabling instant urgent match broadcasts across UITS networks.',
    '[{"label": "Verified Donors", "val": "340+"}, {"label": "Urgent Matches", "val": "89"}, {"label": "Avg Response Time", "val": "14 min"}, {"label": "Blood Groups", "val": "8/8 Covered"}]'::jsonb
  ),
  (
    'Dev Lab', 'Open Source Incubator', 'Operational', 'operational', 94,
    'Community repository workspace supporting student-led software development, code reviews, and tooling.',
    '[{"label": "Active Projects", "val": "18"}, {"label": "Git Commits/Mo", "val": "420+"}, {"label": "Student Builders", "val": "62"}, {"label": "Open PRs", "val": "7"}]'::jsonb
  ),
  (
    'Faculty Directory', 'Academic Contact Index', 'Operational', 'operational', 95,
    'Verified faculty consultation hours, contact emails, room numbers, and academic research publications.',
    '[{"label": "Faculty Profiles", "val": "165"}, {"label": "Consultation Hours", "val": "Updated"}, {"label": "Directory Searches", "val": "4.1k/mo"}, {"label": "Accuracy Rate", "val": "98%"}]'::jsonb
  ),
  (
    'Student Forum', 'Community Discussion', 'Beta Testing', 'beta', 88,
    'Topic-based forum for campus advice, subject discussions, project teaming, and community announcements.',
    '[{"label": "Active Threads", "val": "512"}, {"label": "Daily Posts", "val": "130+"}, {"label": "Active Members", "val": "1.2k"}, {"label": "Spam Block Rate", "val": "99.8%"}]'::jsonb
  ),
  (
    'Lost & Found', 'Campus Welfare', 'Operational', 'operational', 93,
    'Campus recovery desk connecting finders with owners for student cards, lab equipment, and personal belongings.',
    '[{"label": "Items Reported", "val": "210"}, {"label": "Return Rate", "val": "76%"}, {"label": "Student IDs Reunited", "val": "142"}, {"label": "Active Cases", "val": "8"}]'::jsonb
  ),
  (
    'Campus Transit', 'Commute & Bus Tracker', 'In Development', 'dev', 79,
    'Crowdsourced university shuttle bus schedules, route stop maps, and real-time transit delay reporting.',
    '[{"label": "Routes Mapped", "val": "6"}, {"label": "Daily Commuters", "val": "640+"}, {"label": "Schedule Tracking", "val": "In Progress"}, {"label": "Active Drivers", "val": "Pending"}]'::jsonb
  ),
  (
    'Internship Portal', 'Career & Alumni Desk', 'Beta Testing', 'beta', 86,
    'Job and internship listings curated specifically for UITS undergraduates, alumni referrals, and CV templates.',
    '[{"label": "Job Listings", "val": "94"}, {"label": "Partner Companies", "val": "32"}, {"label": "Student Applications", "val": "410+"}, {"label": "Placements", "val": "28"}]'::jsonb
  ),
  (
    'Event Radar', 'Club & Tech Events', 'Operational', 'operational', 92,
    'Comprehensive calendar for tech fests, programming contests, club workshops, and cultural galas.',
    '[{"label": "Events Hosted", "val": "46"}, {"label": "RSVP Count", "val": "1.8k"}, {"label": "Active Clubs", "val": "14"}, {"label": "Upcoming Events", "val": "3"}]'::jsonb
  ),
  (
    'Course Reviews', 'Academic Feedback', 'In Development', 'dev', 74,
    'Constructive course workload insights, lab difficulty ratings, and prerequisite preparation tips from seniors.',
    '[{"label": "Courses Reviewed", "val": "42"}, {"label": "Peer Reviews", "val": "280+"}, {"label": "Review Moderation", "val": "100%"}, {"label": "Dept Coverage", "val": "4/8"}]'::jsonb
ON CONFLICT (project_name) DO UPDATE SET
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  status_type = EXCLUDED.status_type,
  health_score = EXCLUDED.health_score,
  summary = EXCLUDED.summary,
  kpis = EXCLUDED.kpis,
  updated_at = NOW();
```

Click **Run** (green button). Verify `Success. No rows returned`.

> [!NOTE]
> **Frontend Telemetry Integration & Graceful Fallback Strategy:**
> The frontend client (`index.js`) seamlessly queries `public.project_metrics` whenever Supabase is configured. If the table is not yet seeded or if the network is offline, the UI automatically and silently falls back to its embedded, verified domain metrics dataset without throwing errors or interrupting user navigation.

---

## Step 3: Configure Authentication Settings in Supabase

In the Supabase Dashboard sidebar, navigate to **Authentication**:

### 3.1 URL Configuration
Go to **Authentication → URL Configuration**:
1. **Site URL**: Set to your primary domain:
   ```text
   https://ou1ts.github.io
   ```
2. **Redirect URLs**: Add all allowed domains and local development origins:
   - `https://ou1ts.github.io/**`
   - `https://ou1ts.netlify.app/**`
   - `http://localhost:5500/**` *(VS Code Live Server)*
   - `http://127.0.0.1:5500/**` *(Loopback IP)*
   - `http://localhost:5173/**` *(Vite dev server)*
   - `http://localhost:3000/**` *(Node/serve)*
3. Click **Save**.

> [!NOTE]
> **Security Clarification on `localhost` in Redirect URLs:**
> - **Redirect URLs do NOT grant database access:** Redirect URLs only tell Supabase's Auth service where the user's browser is allowed to return after an OAuth or magic link flow.
> - **`localhost` resolves strictly to the visitor's own machine:** `localhost` (`127.0.0.1`) is loopback address. Anyone visiting `localhost:5500` only talks to a local server on their own computer, never yours or your database directly.
> - **Data access is enforced by Row Level Security (RLS):** Database security is protected by PostgreSQL Row Level Security (`auth.uid() = id`). Even if someone has your code and runs it on their own computer, they cannot view, modify, or delete other users' profiles without that user's login session.

### 3.2 Email Confirmation Settings
Go to **Authentication → Providers → Email**:
- **For immediate local testing without waiting for email confirmation**:
  Toggle **"Confirm email"** to **OFF** and click **Save**. This allows newly registered users to log in instantly without checking an email inbox.
- **For production use**:
  Keep **"Confirm email"** **ON**. Registered users must click the verification link sent to their email before Supabase permits login.

### 3.3 Custom SMTP Setup (Eliminating Email Rate Limits)

> [!WARNING]
> **The Default Supabase Email Limit:**
> By default, Supabase's shared built-in mailer restricts projects to **3 to 4 emails per hour** (for confirmation emails, password resets, and magic links combined). Exceeding this triggers error `429 (over_email_send_rate_limit)`.
> Enabling a **Custom SMTP provider** completely removes this limit!

In your Supabase project dashboard, navigate to **Project Settings → Authentication → SMTP Settings** (or **Authentication → Email Templates → SMTP**):

#### Option 1: Gmail SMTP (Easiest — Zero Custom Domain Required)
If you do not own a custom domain name, Gmail SMTP is the quickest setup (takes ~2 minutes) and provides a free sending limit of up to **500 emails/day**:

1. Log into your Google account (e.g. `your-team@gmail.com`).
2. Go to **Google Account Settings → Security** and verify **2-Step Verification** is turned **ON**.
3. In the security search bar, type **App Passwords** (or navigate to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create a new App Password:
   - Name: `Supabase Auth`
   - Click **Create**. Google will generate a 16-character code (e.g., `abcd efgh ijkl mnop`). Copy it.
5. In Supabase **SMTP Settings**, configure the following:
   - **Enable Custom SMTP**: Toggle **ON**
   - **Sender email**: `your-team@gmail.com`
   - **Sender name**: `oU1TS Academic Ecosystem`
   - **Host**: `smtp.gmail.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `your-team@gmail.com`
   - **Password**: `<paste your 16-character Google App Password without spaces>`
6. Click **Save Changes**. Supabase's 3-email/hour limit is now completely bypassed!

#### Option 2: Resend (Best for Custom Domains — e.g., `@ou1ts.org`)
If your organization owns a custom domain, [Resend](https://resend.com) provides clean custom sender addresses and **3,000 free emails/month** (100/day):

1. Sign up for a free account at [Resend.com](https://resend.com).
2. In Resend, go to **Domains → Add Domain** (e.g., `ou1ts.org` or `mail.ou1ts.org`).
3. Add the provided DNS records (**SPF**, **DKIM**, **MX**) in your domain registrar/DNS provider (Cloudflare, Namecheap, GoDaddy). Wait for Resend status to show **Verified**.
4. Go to **API Keys** in Resend and create a key with full sending permissions (starts with `re_...`).
5. In Supabase **SMTP Settings**, configure:
   - **Enable Custom SMTP**: Toggle **ON**
   - **Sender email**: `noreply@ou1ts.org` (or any address on your verified domain)
   - **Sender name**: `oU1TS Academic Ecosystem`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` or `587`
   - **Username**: `resend`
   - **Password**: `<paste your Resend API key>`
6. Click **Save Changes**.

---

## Step 4: Configure Local Frontend Credentials

1. Open [`env-config.js`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/env-config.js) in the root of the workspace.
2. Insert your live Supabase credentials copied from Step 1:
   ```javascript
   // oU1TS Project Environment Configuration
   // This file is gitignored. In production, values are injected during deployment.
   window.__ENV = window.__ENV || {
     SUPABASE_URL: "https://<your-project-id>.supabase.co",
     SUPABASE_ANON_KEY: "<your-actual-anon-key>"
   };
   ```
3. Save the file.
4. Verify that `env-config.js` is listed in [`.gitignore`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/.gitignore) so your keys are never committed to public Git history.

---

## Step 5: Test Registration and Login Locally

1. Launch a local web server (e.g., right-click `index.html` → **Open with Live Server** at `http://127.0.0.1:5500`, or run `npx serve .`).
2. Open browser Developer Tools (`F12` or `Ctrl + Shift + I`) and view the **Console** tab:
   - Verify you see: `Supabase Client initialized successfully.`
   - Confirm there are **no** mock mode notices.
3. Click **Login** on the navigation bar (navigates to `#auth`).
4. **Test Registration:**
   - Click the **Register** tab.
   - Enter your Full Name, Email, Password, Student ID (digits only), and select your Department.
   - Click **Create Account**.
   - If "Confirm email" was disabled in Step 3.2, you will be registered and signed in immediately.
5. **Verify in Supabase Table Editor:**
   - In your Supabase Dashboard, open **Table Editor → profiles**.
   - Confirm a new record exists displaying your UUID, Email, Full Name, Student ID, and Department.
6. **Test Profile Editing:**
   - In the browser, on the `#profile` screen, click **Edit Profile**.
   - Add a Batch (e.g. `61`), select Blood Group (e.g. `A+`), and enter social handles.
   - Click **Save Changes**. Verify the changes update instantly on the screen and in Supabase.
7. **Test Sign Out and Sign In:**
   - Click **Log Out**. You will be navigated back to `#home` and the navbar will show **Login**.
   - Click **Login**, switch to the **Login** tab, enter your registered email and password, and sign in.
   - You should be navigated directly to `#profile` with your saved details.
8. **Verify Authentic Error Handling:**
   - Log out, enter an incorrect password, and click **Sign In**.
   - Verify that the alert banner displays the authentic error: `Invalid login credentials`.
9. **Test Profile Window Switcher & Initiatives Metrics Dashboard:**
   - Sign back in to `#profile`.
   - On the top-right corner of the Profile Card, locate the switcher button (`<` left chevron). Hover over it to view the tooltip `"View Initiatives Metrics"`.
   - Click the button: observe the smooth centered elevation animation (`placeDownOnCard`) as the Initiatives Performance Metrics Dashboard slides from the center and places down over the Profile Card.
   - Inspect the 13 initiative cards (Resource Archive, Question Bank, Blood Donation, Academic Scheduler, etc.) checking their status badges, health score bars, and 2x2 metric pills.
   - Click the return switcher button (`>` right chevron) on the top-right of the dashboard: observe the picking up animation (`pickUpOffCard`) gracefully lifting the dashboard and revealing the Profile Card.

---

## Step 6: Configure GitHub Actions & GitHub Pages Deployment

To enable live Supabase authentication on **`https://ou1ts.github.io`**:

### 6.1 Add GitHub Repository Secrets
1. Go to your repository on GitHub: **[oU1TS/ou1ts.github.io](https://github.com/oU1TS/ou1ts.github.io)**.
2. Click **Settings** (top navigation) → **Secrets and variables** (left sidebar) → **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add:
   - Name: `SUPABASE_URL` | Secret: `https://<your-project-id>.supabase.co`
   - Name: `SUPABASE_ANON_KEY` | Secret: `<your-actual-anon-key>`

### 6.2 Switch GitHub Pages Source to GitHub Actions (CRITICAL)
1. In the same repository **Settings**, click **Pages** (left sidebar).
2. Under **Build and deployment → Source**, change the dropdown from **"Deploy from a branch"** to **"GitHub Actions"**.
   > [!IMPORTANT]
   > If this setting remains on "Deploy from a branch", GitHub Pages will ignore `.github/workflows/deploy.yml` and serve files directly from `main`. Since `env-config.js` is gitignored, it will return `404 (Not Found)`. Switching the source to **GitHub Actions** is mandatory.

### 6.3 Deploy and Verify
1. Go to the **Actions** tab on GitHub.
2. Select **Deploy to GitHub Pages with Env Injection** from the left list.
3. Click **Run workflow** → **Run workflow** (or push a commit to `main`).
4. Wait for the workflow run to complete (green checkmark).
5. Open `https://ou1ts.github.io/` in your browser:
   - Check `https://ou1ts.github.io/env-config.js` in a new tab: it should return HTTP 200 with your credentials.
   - Test login and registration on the live site!

---

## Step 7: Configure Netlify Deployment (If Using Netlify)

If your site is also published to Netlify (`https://ou1ts.netlify.app`):

1. Open your [Netlify Dashboard](https://app.netlify.com/) and click your site project.
2. Go to **Site configuration → Environment variables**.
3. Click **Add a variable** → **Add a single variable**:
   - Key: `SUPABASE_URL` | Value: `https://<your-project-id>.supabase.co`
   - Key: `SUPABASE_ANON_KEY` | Value: `<your-actual-anon-key>`
4. Set Scope to **All scopes** and click **Create variable**.
5. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**.
6. Netlify will execute `node scripts/build-env.js`, inject `env-config.js`, and deploy.

---

## 🔍 Verification & Troubleshooting Checklist

| Symptom / Error | Root Cause | Solution |
|---|---|---|
| **`GET /env-config.js 404 (Not Found)` on GitHub Pages** | GitHub Pages is set to "Deploy from a branch" (`main`), ignoring GitHub Actions. | In repository **Settings → Pages**, switch **Source** to **GitHub Actions**, then re-run the deployment workflow. |
| **`Unable to log in: Database connection not configured`** | `env-config.js` is missing, 404, or has empty/placeholder values. | Verify Step 4 (for localhost), Step 6.1 (for GitHub Pages), or Step 7 (for Netlify). |
| **`Invalid login credentials`** | The email or password entered is incorrect. | Verify password spelling or register a new user in the Register tab. |
| **`Email not confirmed`** | "Confirm email" is enabled in Supabase, but the user has not clicked the link. | Open the inbox of the registered email to confirm, OR toggle **Confirm email** to **OFF** in Supabase Auth settings (Step 3.2). |
| **`over_email_send_rate_limit` (HTTP 429)** | Exceeded Supabase free-tier built-in email limit (capped at 3–4 emails/hour on default shared mailer). | Configure Custom SMTP (Gmail or Resend) in **Project Settings → Authentication → SMTP Settings** (Step 3.3) to completely bypass this rate limit. |
| **`Failed to load Supabase SDK from CDN`** | Network connectivity issue or CDN blocked by firewall/ad-blocker. | Check internet connection, disable ad-blockers for CDN domains (`cdn.jsdelivr.net`). |
| **Student ID Validation Error** | Non-numeric characters entered in Student ID. | Student ID must contain digits only (e.g. `04324100051`). |
| **Duplicate Student ID Error** | Another user has already registered with this Student ID. | Student IDs are unique in the database schema. Use your assigned Student ID. |
| **Project Metrics Table Empty / Offline** | `public.project_metrics` not created yet or device is offline. | The dashboard automatically falls back to verified client-side baseline metrics without throwing UI errors. Execute Step 2.2 in SQL Editor if live Supabase updates are desired. |

