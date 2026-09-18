# oU1TS Centralized Login & Database — Step-by-Step Setup Guide

This document is your actionable, step-by-step checklist to configure and activate live authentication on **`ou1ts.github.io`** and all connected sub-projects using **Supabase**.

---

## 📋 Overview of the Setup Flow

```
[ Step 1: Create Supabase Project ]
                │
                ▼
[ Step 2: Run SQL Schema in Supabase ] (Creates profiles table with blood_group + triggers)
                │
                ▼
[ Step 3: Configure Auth URLs & Redirects ] (Permits ou1ts.github.io and localhost)
                │
                ▼
[ Step 4: Configure Local env-config.js ] (Connects your local testing site to live DB)
                │
                ▼
[ Step 5: Test Register & Login Locally ] (Verify profiles row created in Supabase)
                │
                ▼
[ Step 6: Add GitHub Secrets & Deploy ] (Automates production injection for GitHub Pages)
```

---

## Step 1: Create the Supabase Project

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New project**.
3. Fill in the details:
   - **Name**: `oU1TS-Central`
   - **Database Password**: Generate a secure password and **save it in a password manager**.
   - **Region**: Choose the region closest to your primary user base (e.g. `Singapore` or `Southeast Asia`).
   - **Pricing Plan**: Free tier.
4. Click **Create new project** and wait ~2 minutes for provisioning to finish.
5. In your project dashboard, navigate to **Project Settings** (gear icon) → **API**:
   - Copy the **Project URL** (e.g. `https://xxxxxxxxxxxx.supabase.co`).
   - Copy the **`anon` public key** (the long string starting with `eyJhbGci...`).
   - *(Keep the `service_role` secret private — do NOT add it to the frontend code).*

---

## Step 2: Execute the Database Schema SQL

1. In your Supabase project dashboard sidebar, open the **SQL Editor**.
2. Click **New query** and paste the complete script below (also located in [`doc/db/user_profile_schema.sql`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/db/user_profile_schema.sql)):

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

-- 5. Auto-Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    student_id, 
    email, 
    full_name, 
    blood_group,
    project_tags
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'student_id', 'OAUTH_USER'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
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

-- 6. Helper Function: Add Project Tag (for sub-projects like /portal, /archive, /scheduler)
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

-- 7. (Optional) Portal Stars Table (if supporting /portal star features)
CREATE TABLE IF NOT EXISTS public.stars (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_stars_resource ON public.stars(resource_type, resource_id);
ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view star counts" ON public.stars;
CREATE POLICY "Anyone can view star counts" ON public.stars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can star" ON public.stars;
CREATE POLICY "Authenticated users can star" ON public.stars FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unstar own stars" ON public.stars;
CREATE POLICY "Users can unstar own stars" ON public.stars FOR DELETE USING (auth.uid() = user_id);
```

3. Click **Run** (green button). Verify that the query executes with `Success. No rows returned`.

---

## Step 3: Configure Authentication Settings in Supabase

In the Supabase Dashboard sidebar, navigate to **Authentication**:

### 3.1 URL Configuration
Go to **Authentication → URL Configuration**:
1. **Site URL**: Set to:
   ```text
   https://ou1ts.github.io
   ```
2. **Redirect URLs**: Add all the following domains (one by one or wildcards):
   - `https://ou1ts.github.io/**`
   - `https://ou1ts.github.io/portal/**`
   - `https://bd-ou1ts.netlify.app/**`
   - `https://b1tsched.netlify.app/**`
   - `https://b1tacad.netlify.app/**`
   - `http://localhost:5500/**` *(Live Server)*
   - `http://127.0.0.1:5500/**` *(Loopback IP)*
   - `http://localhost:5173/**` *(Vite dev)*
3. Click **Save**.

### 3.2 Email Provider Settings (Optional Quick Testing)
Go to **Authentication → Providers → Email**:
- By default, Supabase sends confirmation emails.
- **Tip for rapid local testing:** You can temporarily toggle **"Confirm email"** to **OFF** if you want new registrations to be immediately signed in without waiting for an email verification link.
- For production, keep **"Confirm email"** enabled.

### 3.3 Google OAuth (Optional)
If you want to allow "Sign In with Google":
1. Go to **Authentication → Providers → Google** and toggle it **ON**.
2. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
3. Create an **OAuth 2.0 Client ID** (Web application).
4. In Google Cloud, add the **Authorized redirect URI** shown in Supabase (e.g. `https://<your-project>.supabase.co/auth/v1/callback`).
5. Copy the Google **Client ID** and **Client Secret** into Supabase and click **Save**.

---

## Step 4: Configure Local Frontend Credentials

1. Open [`env-config.js`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/env-config.js) in the root of this project:
   ```javascript
   window.__ENV = window.__ENV || {
     SUPABASE_URL: "https://YOUR_ACTUAL_PROJECT_ID.supabase.co",
     SUPABASE_ANON_KEY: "YOUR_ACTUAL_ANON_KEY"
   };
   ```
2. Replace `https://YOUR_ACTUAL_PROJECT_ID.supabase.co` and `YOUR_ACTUAL_ANON_KEY` with the keys copied from Step 1.
3. Save the file.
4. **Important**: Verify that [`env-config.js`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/env-config.js) is ignored by Git in [`.gitignore`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/.gitignore) so your keys are never accidentally pushed to public repositories.

---

## Step 5: Test Login and Registration Locally

1. Launch a local web server (e.g., in VS Code, right click `index.html` → **Open with Live Server** at `http://localhost:5500`, or use `npx serve .`).
2. In the browser, navigate to `#auth` by clicking the **Login** button on the navbar.
3. **Test Registration:**
   - Switch to the **Register** tab.
   - Enter Full Name, Email, Password, Student ID (digits only), and Department.
   - Click **Create Account**.
4. **Verify in Supabase:**
   - In your Supabase Dashboard, check **Authentication → Users** to confirm the user account was created.
   - In **Table Editor → profiles**, confirm that a new row exists with the corresponding UUID, email, full name, student ID, and `['root']` project tag.
5. **Test Login:**
   - Log out (or open an incognito window).
   - Switch to the **Login** tab, enter your email and password, and sign in.
   - You should be automatically navigated to `#profile` displaying your student details and an **Edit Profile** button.

---

## Step 6: Configure GitHub Secrets for Production Deployment

Since `env-config.js` is gitignored to protect secrets, your deployed GitHub Pages site uses a GitHub Actions workflow to generate `env-config.js` automatically on every push:

1. **Add Repository Secrets**:
   - In your GitHub repository, go to **Settings → Secrets and variables → Actions**.
   - Click **New repository secret** and create:
     - Name: `SUPABASE_URL`, Secret: `https://YOUR_PROJECT_ID.supabase.co`
     - Name: `SUPABASE_ANON_KEY`, Secret: `YOUR_ANON_KEY`

2. **Enable GitHub Actions for Pages**:
   - Go to **Settings → Pages**.
   - Under **Build and deployment → Source**, select **GitHub Actions** (instead of "Deploy from a branch").

3. **Automated Workflow (`.github/workflows/deploy.yml`)**:
   - The workflow file has been created at [`.github/workflows/deploy.yml`](file:///d:/GitHub/%5BoU1TS%5D/ou1ts.github.io/.github/workflows/deploy.yml).
   - Once secrets are saved and changes are pushed to `main`, GitHub Actions will **automatically**:
     1. Check out the repository.
     2. Inject `env-config.js` with your repository secrets.
     3. Deploy the live site to GitHub Pages with working authentication!

---

## Step 7: Configure Netlify Deployment Environment Variables

If your site is hosted on Netlify (e.g. `https://ou1ts.netlify.app`), Netlify automatically builds using [`netlify.toml`](file:///d:/GitHub/[oU1TS]/ou1ts.github.io/netlify.toml) and [`scripts/build-env.js`](file:///d:/GitHub/[oU1TS]/ou1ts.github.io/scripts/build-env.js) to generate `env-config.js` during deployment:

1. **Log in to Netlify Dashboard**:
   - Go to [Netlify Dashboard](https://app.netlify.com/) and open your site project (`ou1ts`).
2. **Add Environment Variables**:
   - Navigate to **Site configuration → Environment variables** (or **Site settings → Build & deploy → Environment**).
   - Click **Add a variable** → **Add a single variable**:
     - Key: `SUPABASE_URL` | Value: `https://YOUR_PROJECT_ID.supabase.co`
     - Key: `SUPABASE_ANON_KEY` | Value: `YOUR_ACTUAL_ANON_KEY`
   - Set Scope to **All scopes** (or Production + Deploy Previews) and click **Create variable**.
3. **Trigger Deployment**:
   - Go to **Deploys** in the top navigation bar.
   - Click **Trigger deploy** → **Clear cache and deploy site**.
   - Netlify will run `node scripts/build-env.js`, inject your Supabase credentials into `env-config.js`, and deploy!

---

## 🔍 Verification & Troubleshooting Checklist

| Test Case | Expected Outcome | Troubleshooting |
|---|---|---|
| **Form Submission with Invalid ID** | Validation tooltip blocks submission | Student ID must contain only digits (e.g. `0432410005`). |
| **Supabase SDK Load** | `@supabase/supabase-js` loads from CDN | If offline or blocked by ad-blocker, app falls back to local storage mock mode with a warning notice. |
| **Duplicate Student ID** | Registration rejected with duplicate error | Partial unique index ensures no two students register with the same ID. |
| **Redirect after OAuth** | User returned to `#profile` | Verify that the current domain is included in **Allowed Redirect URLs** in Supabase Auth settings. |
| **Profile Update** | Edits save to `public.profiles` | RLS policy `Users can update own profile` checks `auth.uid() = id`. |
| **"Supabase variables not set" in Console** | Supabase client initializes successfully | Ensure credentials in `env-config.js` are not default placeholders and hard-refresh browser (`Ctrl + F5` or `Cmd + Shift + R`). |
| **Favicon 404 in Console** | Clean console without favicon error | SVG favicon is configured in `<head>` to prevent browser 404s. |
