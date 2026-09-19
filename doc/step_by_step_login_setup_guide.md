# oU1TS Centralized Login & Database — Step-by-Step Setup Guide

This document provides an end-to-end, actionable checklist to set up a live **Supabase** backend, execute the PostgreSQL schema, configure environment variables, and verify live registration and login for **`ou1ts.github.io`** and its sub-projects.

---

## 📋 Overview of the Complete Setup Flow

```
[ Step 1: Create Supabase Project & Copy API Keys ]
                    │
                    ▼
[ Step 2: Run SQL Schema in Supabase SQL Editor ] (Creates profiles table, RLS, and auto-insert trigger)
                    │
                    ▼
[ Step 3: Configure Auth URLs & Email Settings ] (Set Site URL, Redirects, and Email confirmation)
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

1. In your Supabase dashboard sidebar, open the **SQL Editor** (icon with `>_`).
2. Click **New query** and paste the complete script below (also stored in [`doc/db/user_profile_schema.sql`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/db/user_profile_schema.sql)):

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

3. Click **Run** (green button). Verify that the status reports `Success. No rows returned`.

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
| **`Failed to load Supabase SDK from CDN`** | Network connectivity issue or CDN blocked by firewall/ad-blocker. | Check internet connection, disable ad-blockers for CDN domains (`cdn.jsdelivr.net`). |
| **Student ID Validation Error** | Non-numeric characters entered in Student ID. | Student ID must contain digits only (e.g. `04324100051`). |
| **Duplicate Student ID Error** | Another user has already registered with this Student ID. | Student IDs are unique in the database schema. Use your assigned Student ID. |
