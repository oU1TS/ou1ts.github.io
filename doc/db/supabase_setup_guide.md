# oU1TS Centralized Supabase Database Setup Guide

This guide provides step-by-step instructions on setting up and configuring the central Supabase database for the **oU1TS Student Support Center**. This database serves as the unified identity and authentication provider for the main oU1TS landing page and all associated sub-projects (e.g. `/portal`, `/archive`, `/scheduler`).

---

## 📐 Architecture Overview

```
             [ oU1TS Central Supabase Project ]
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   [ Main Landing ]    [ /portal ]        [ /archive ]
 (ou1ts.github.io)    (Project Hub)     (Resource Archiver)
  Tag: root            Tag: portal        Tag: archive
```

- **Unified Identity:** All oU1TS applications share a **single Supabase project** and a centralized `public.profiles` table.
- **Application Tags:** A user's profile contains a `project_tags` array (defaulting to `['root']`). When they access or register through sub-projects, the corresponding sub-project tag (e.g., `'portal'`, `'archive'`) is appended to identify their membership.
- **Isolation of Sub-Project Tables:** Sub-project specific tables (such as `/portal`'s `stars` table) live inside the same database but are kept separate from the core `profiles` table.

---

## 🚀 Setup Steps

### Phase 1 — Create the Supabase Project

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and click **New project**.
2. Name the project `oU1TS-Central` and select your Organization.
3. Configure a **strong database password** (save this securely).
4. Select the region closest to your users (e.g., Southeast Asia).
5. Click **Create new project** and wait for the database to provision (~2 minutes).
6. Once provisioned, navigate to **Project Settings → API** and copy:
   - **Project URL** (e.g., `https://xxxxxxxxxxxx.supabase.co`)
   - **`anon` public key** (the API key starting with `eyJ...`)
   - **`service_role` secret key** (Keep this secure and **never** expose it in frontend code).

---

### Phase 2 — Database Schema Setup

Open the **SQL Editor** in your Supabase project dashboard, create a new query, and execute the following scripts to build the oU1TS central database structure:

#### Step 2.1 — Create the `profiles` Table
This table holds the core student details (Student ID, Department, Batch, Blood Group, Social Media URLs, and Project Tags):
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT,
  email TEXT NOT NULL,
  full_name TEXT,
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

CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);
```

#### Step 2.2 — Partial Unique Index for Student ID
Enforces unique student IDs across UITS students while permitting multiple Google/OAuth accounts (which default to `OAUTH_USER`):
```sql
CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_id_unique
  ON public.profiles (student_id)
  WHERE student_id IS NOT NULL AND student_id <> 'OAUTH_USER';
```

#### Step 2.3 — Auto-Profile Trigger Function
Automates creation of a profile row whenever a user signs up (extracting metadata like `full_name` and `student_id`):
```sql
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
Allows sub-projects (like `/archive` or `/scheduler`) to append their identifier to the user's `project_tags` array upon join:
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

---

### Phase 3 — Migrate Existing Data

To restore the 17 existing UITS student profiles from the previous database backup:

1. **Create the Auth Entries First:** Since the `profiles` table references `auth.users`, you must invite or create the user accounts inside the Supabase **Authentication** dashboard first.
2. **Execute the Profile Inserts:** Once the auth users exist, copy and run the `INSERT` query containing the 17 actual student profiles.

   > [!IMPORTANT]
   > To protect user privacy, the actual profile data hashes, names, and email mappings are kept secure and must not be committed to the public repository.
   > 
   > Please refer to the gitignored guide **[oU1TS_Central_Database_Guide(from portal repo).md](ou1ts.github.io/doc/idea/%5BDoNotCommit%5DoU1TS_Central_Database_Guide%28from%20portal%20repo%29.md#L163-L186)** under **Phase 3 (Step 3.1)** to copy the complete `INSERT INTO public.profiles ...` query values.

*(Note: Portal-specific sub-project tables like `stars` and their records are not part of the central `profiles` layout and should only be created and imported inside the portal deployment guide).*

---

### Phase 4 — Supabase Auth Configuration

To ensure registration requests and redirect callbacks pass successfully across all oU1TS applications:

1. In the Supabase Dashboard, navigate to **Authentication → URL Configuration**.
2. Set the global **Site URL** to:
   `https://ou1ts.github.io`
3. Add the following entries to **Redirect URLs** (to allow transitions back to sub-projects after registration or login):
   - `https://ou1ts.github.io/**`
   - `https://ou1ts.github.io/portal/**`
   - `https://ou1ts.github.io/archive/**`
   - `https://ou1ts.github.io/scheduler/**`
   - `http://localhost:5500/**` *(for local development)*
   - `http://127.0.0.1:5500/**` *(for local development)*

---

### Phase 5 — Frontend Integration & Secrets Protection

To prevent exposing credentials to public view in the git repository:

1. Create a config loader file named `env-config.js` in the website root directory.
2. In your local development workspace, write your Supabase credentials into `env-config.js` (this file is pre-configured in `.gitignore` so it will never be committed):
   ```javascript
   window.__ENV = {
     SUPABASE_URL: "https://your-project-id.supabase.co",
     SUPABASE_ANON_KEY: "your-anon-public-key"
   };
   ```
3. The main site's `index.js` automatically attempts to dynamically fetch and process this file. If it exists, it switches from local `localStorage` mock mode to your live Supabase database instance.

---

### Phase 6 — GitHub Actions: Deploy Time Secrets Injection

To inject credentials into `env-config.js` during deployment on GitHub Pages without storing them in Git:

1. Go to your GitHub repository → **Settings → Secrets and variables → Actions**.
2. Click **New repository secret** and add:
   - `SUPABASE_URL` -> Your Supabase URL
   - `SUPABASE_ANON_KEY` -> Your Supabase Anon Public Key
3. Ensure your deploy workflow (e.g., `.github/workflows/deploy.yml`) generates the config file on the build runner:
   ```yaml
   - name: Inject environment config
     run: |
       cat > env-config.js << EOF
       window.__ENV = {
         SUPABASE_URL: "${{ secrets.SUPABASE_URL }}",
         SUPABASE_ANON_KEY: "${{ secrets.SUPABASE_ANON_KEY }}"
       };
       EOF
   ```

---

### Phase 7 — Verification Checklist

Verify your setup using the following checks:

| Action | Expected Result |
|---|---|
| Open local `index.html` with `env-config.js` | Page loads, console shows: `Supabase database initialized.` |
| Register a new account | A new user appears in Supabase **Authentication** and a linked row is added in `public.profiles`. |
| Edit profile values | Changes are successfully updated in the `profiles` table. |
| Try a duplicate student ID signup | The query fails due to unique index constraints (`profiles_student_id_unique`), raising a validation alert. |
