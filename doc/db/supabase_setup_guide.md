# oU1TS Centralized Supabase Database Setup Guide

This guide provides step-by-step instructions on setting up, configuring, and maintaining the central Supabase database for the **oU1TS Student Support Center**. This database serves as the unified identity and authentication provider for the main oU1TS landing page (`ou1ts.github.io`) and all associated sub-projects (e.g., `/portal`, `/archive`, `/scheduler`, `/events`, `/english`, `/qbank`, `/course`, `bd-ou1ts.netlify.app`, etc.).

---

## 📐 Architecture Overview

```
                          [ oU1TS Central Supabase Project ]
                                         │
        ┌──────────────────┬─────────────┼─────────────┬──────────────────┐
        ▼                  ▼             ▼             ▼                  ▼
   [ Main Site ]      [ /portal ]   [ /archive ]  [ /scheduler ]   [ Other Sub-Projects ]
 (ou1ts.github.io)   (Projects Hub)  (Archiver)    (Scheduler)    (events, english, etc.)
  Tag: root           Tag: portal    Tag: archive  Tag: scheduler Tag: events, english...
```

- **Unified Identity:** All oU1TS applications share a **single Supabase project** and a centralized `public.profiles` table.
- **Application Tags:** A user's profile contains a `project_tags` array (defaulting to `['root']`). When they access or register through sub-projects, the corresponding sub-project tag (e.g., `'portal'`, `'archive'`) is appended to identify their membership.
- **Isolation of Sub-Project Tables:** Sub-project specific tables (such as `/portal`'s `stars` table) live inside the same database but are kept separate from the core `profiles` table.

---

## 🚀 Setup Steps

### Phase 1 — Create the Supabase Project

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and click **New project**.
2. Name the project `oU1TS-Central` and select your Organization.
3. Configure a **strong database password** (save this securely!).
4. Select the region closest to your users (e.g., Southeast Asia).
5. Click **Create new project** and wait for the database to provision (~2 minutes).
6. Once provisioned, navigate to **Project Settings → API** and copy:
   - **Project URL** (e.g., `https://xxxxxxxxxxxx.supabase.co`)
   - **`anon` public key** (the API key starting with `eyJ...`)
   - **`service_role` secret key** (Keep this secure and **never** expose it in frontend code).

---

### Phase 2 — Database Schema & SQL Setup

Open the **SQL Editor** in your Supabase project dashboard, create a new query, and execute the following scripts in order to build the oU1TS central database structure:

#### Step 2.1 — Create the `profiles` Table
This table holds the core student details (Student ID, Department, Batch, Blood Group, Social Media URLs, and Project Tags):

```sql
-- Central profiles table (shared across all oU1TS sub-projects)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT,               -- NULL or 'OAUTH_USER' allowed for OAuth users
  email TEXT NOT NULL,
  full_name TEXT,
  department TEXT,
  batch TEXT,
  blood_group TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_telegram TEXT,
  social_discord TEXT,
  -- 'root' is always present by default; others added per sub-project join
  project_tags TEXT[] DEFAULT ARRAY['root']::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_student_id_numeric_or_oauth 
    CHECK (student_id ~ '^[0-9]+$' OR student_id = 'OAUTH_USER'),
  
  CONSTRAINT check_blood_group_valid 
    CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profile access
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow auto-trigger / service role to insert profiles
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);
```

#### Step 2.2 — Partial Unique Index for Student ID
Enforces unique student IDs across UITS students while permitting multiple Google/OAuth accounts (which default to `OAUTH_USER` or `NULL`):

```sql
-- Drop old unique constraint if it exists
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_student_id_key;

-- Allow multiple OAUTH_USER / NULL rows, but enforce unique real numeric student IDs
CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_id_unique
  ON public.profiles (student_id)
  WHERE student_id IS NOT NULL AND student_id <> 'OAUTH_USER';
```

#### Step 2.3 — Auto-Profile Trigger Function
Automates creation of a profile row whenever a user signs up (extracting metadata like `full_name` and `student_id`):

```sql
-- Drop old trigger/function if migrating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- New trigger function: handles both email and OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    student_id, 
    email, 
    full_name, 
    project_tags
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'student_id', 'OAUTH_USER'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    ARRAY['root']::TEXT[]
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Step 2.4 — Sub-Project Tag Helper Function
Allows sub-projects (like `/archive`, `/scheduler`, or `/portal`) to append their identifier to the user's `project_tags` array upon join:

```sql
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

#### Step 2.5 — Create Sub-Project Tables (e.g. `stars` for Portal)
Sub-project-specific tables live in the same database under `public`:

```sql
CREATE TABLE public.stars (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX idx_stars_resource ON public.stars(resource_type, resource_id);

ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view star counts" ON public.stars
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can star" ON public.stars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar own stars" ON public.stars
  FOR DELETE USING (auth.uid() = user_id);
```

---

### Phase 3 — Data Migration & Restoration

To migrate existing profiles and stars from database backups:

1. **Re-creating Auth Users:** Since `profiles.id` references `auth.users(id)`, user accounts must exist in Supabase Auth before inserting profile rows.
   - **Option A (Recommended):** Users re-register on the new platform.
   - **Option B (Programmatic):** Use the Supabase Management API with `service_role` to generate auth records, then insert profile values.

2. **Executing Profile & Stars SQL Restores:**
   Run the SQL scripts in the **Supabase SQL Editor**:

> [!IMPORTANT]
> To protect user privacy and sensitive backup data, actual user profile records and sub-project stars data are kept secure and must not be committed to the public repository.
> 
> Please refer to the gitignored guide **[[DoNotCommit]oU1TS_Central_Database_Guide(from portal repo).md](file:///c:/Users//Documents/GitHub/%5BoU1TS%5D/ou1ts.github.io/doc/idea/%5BDoNotCommit%5DoU1TS_Central_Database_Guide%28from%20portal%20repo%29.md#L163-L225)** under **Phase 3 (Steps 3.1 & 3.2)** to copy the complete `INSERT INTO public.profiles ...` and `INSERT INTO public.stars ...` query values.
```

---

### Phase 4 — Supabase Auth & Allowed Domains Configuration

To ensure authentication callbacks, registration redirects, and OAuth flows succeed across all oU1TS applications, update your Supabase settings in **Authentication → URL Configuration**:

#### 1. Site URL
Set the global Site URL to:
`https://ou1ts.github.io`

#### 2. Allowed Redirect URLs
Add the following array of allowed redirect URLs corresponding to the **Primary Projects Roster** (`index.js`) and local development environments:

| Project Name | Primary Target URL / Pattern | Allowed Redirect URL Pattern |
|---|---|---|
| **Main Landing Page** | `https://ou1ts.github.io` | `https://ou1ts.github.io/**` |
| **Projects Hub** | `https://ou1ts.github.io/portal` | `https://ou1ts.github.io/portal/**` |
| **Wiki** | `https://ou1ts.github.io/wiki.html` | `https://ou1ts.github.io/wiki.html` |
| **Blood Donation** | `https://bd-ou1ts.netlify.app/` | `https://bd-ou1ts.netlify.app/**` |
| **Scheduler** | `https://b1tsched.netlify.app/` | `https://b1tsched.netlify.app/**` |
| **Archive** | `https://b1tacad.netlify.app/` | `https://b1tacad.netlify.app/**` |
| **Events** | `https://ou1ts.github.io/events/` | `https://ou1ts.github.io/events/**` |
| **English Speaking** | `https://ou1ts.github.io/english/` | `https://ou1ts.github.io/english/**` |
| **QBank** | `https://ou1ts.github.io/qbank/` | `https://ou1ts.github.io/qbank/**` |
| **Courses** | `https://ou1ts.github.io/course/` | `https://ou1ts.github.io/course/**` |
| **Local Dev (Live Server)** | `http://localhost:5500` | `http://localhost:5500/**` |
| **Local Dev (IP Loopback)** | `http://127.0.0.1:5500` | `http://127.0.0.1:5500/**` |
| **Local Dev (Vite Default)** | `http://localhost:5173` | `http://localhost:5173/**` |

#### 3. Google OAuth Setup
1. In Supabase Dashboard, navigate to **Authentication → Providers → Google**.
2. Toggle Google OAuth to **ON**.
3. Input your Google OAuth **Client ID** and **Client Secret** (obtained from the [Google Cloud Console](https://console.cloud.google.com/)).
4. Configure the **Authorized redirect URI** inside Google Cloud Console to:
   `https://<your-project-id>.supabase.co/auth/v1/callback`

---

### Phase 5 — Frontend Integration & Secrets Protection

To prevent committing credentials to public repositories while maintaining static HTML/JS deployment compatibility:

1. **Config Loader Pattern (`env-config.js`):** Create `env-config.js` in the project root (pre-listed in `.gitignore`):
   ```javascript
   window.__ENV = {
     SUPABASE_URL: "https://your-project-id.supabase.co",
     SUPABASE_ANON_KEY: "your-anon-public-key"
   };
   ```
2. **Local Environment Protection (`.env`):**
   Create a `.env` file for local development tools:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. **Ensure `.gitignore` contains:**
   ```
   .env
   env-config.js
   ```

---

### Phase 6 — GitHub Actions: Deploy-Time Secrets Injection

Inject Supabase credentials into `env-config.js` during deployment on GitHub Pages without storing secrets in Git:

1. Navigate to repository **Settings → Secrets and variables → Actions**.
2. Create repository secrets:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
3. In your GitHub Actions deployment workflow (e.g., `.github/workflows/deploy.yml`), add an injection step before deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Inject environment config
        run: |
          cat > env-config.js << EOF
          window.__ENV = {
            SUPABASE_URL: "${{ secrets.SUPABASE_URL }}",
            SUPABASE_ANON_KEY: "${{ secrets.SUPABASE_ANON_KEY }}"
          };
          EOF

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

### Phase 7 — Key Rotation & Git History Cleanup

If credentials were ever committed to Git history in the past:

1. **Rotate JWT Secret:**
   - In Supabase Dashboard: **Project Settings → API → JWT Settings** → click **Generate new JWT secret**.
   - This invalidates all old tokens and automatically regenerates fresh `anon` and `service_role` keys.
2. **Purge History using `git filter-repo`:**
   ```powershell
   pip install git-filter-repo
   git filter-repo --path js/supabase-config.js --invert-paths
   git push origin --force --all
   ```

---

### Phase 8 — Verification Checklist

| Action / Test | Expected Result |
|---|---|
| Open main site with `env-config.js` present | Page loads cleanly; console logs: `Supabase database initialized.` |
| Click "Join oU1TS" | Smoothly transitions SPA section to `#auth` form |
| Register a new student account | Account created in Auth and linked row inserted into `public.profiles` |
| Register via Google OAuth | Profile created with `student_id = 'OAUTH_USER'` and default tag `['root']` |
| Attempt duplicate Student ID signup | Fails with constraint error `profiles_student_id_unique`, raising validation alert |
| Update profile details (Dept, Batch, Socials) | Successfully saves and reflects on `#profile` section and Supabase DB |
| Access sub-projects (`/portal`, `/archive`, etc.) | Cross-domain redirect callbacks succeed via allowed domain list |
