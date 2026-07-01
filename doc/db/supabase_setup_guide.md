# Supabase SQL Database Setup Guide

This guide provides step-by-step instructions on setting up your Supabase backend to support the User Registration, Login, and Profile features using the schema defined in [user_profile_schema.sql](ou1ts.github.io/doc/idea/user_profile_schema.sql).

---

## 🚀 Setup Steps

### Step 1: Create a Supabase Project
1. Go to the [Supabase Dashboard](https://supabase.com) and log in.
2. Click **New project** and select your Organization.
3. Configure the following project parameters:
   - **Name:** e.g., `oU1TS Portal`
   - **Database Password:** Enter a secure password (store this safely).
   - **Region:** Choose a region close to your target users (e.g., Singapore).
4. Click **Create new project** and wait a few minutes for the project database to provision.

---

### Step 2: Apply the SQL Schema
Once your project is ready, apply the schema to configure the database tables, constraints, row-level security (RLS) policies, and triggers:
1. On the left navigation sidebar of your Supabase dashboard, click the **SQL Editor** tab (the `SQL` icon).
2. Click **New query** (or **New blank query**).
3. Open the schema file [user_profile_schema.sql](ou1ts.github.io/doc/idea/user_profile_schema.sql) in your text editor and copy the entire contents.
4. Paste the copied SQL code into the Supabase SQL editor.
5. Click the **Run** button (or press `Ctrl + Enter` / `Cmd + Enter`).
6. Verify the console displays a success message: `Success. No rows returned.`

---

### Step 3: Enable Authentication Providers (Optional)
By default, Email/Password authentication is enabled in Supabase. If you wish to support Google Logins:
1. Navigate to **Authentication** -> **Providers** on the Supabase dashboard.
2. Select **Google** from the list of OAuth providers.
3. Toggle **Enable Google Provider** to on.
4. Provide the **Client ID** and **Client Secret** (obtained from the [Google Cloud Console](https://console.cloud.google.com)).
5. Copy the **Redirect URL** displayed by Supabase and add it to your Google Cloud OAuth consent settings.

---

### Step 4: Connect the Website Frontend
To point your local website frontend to your live Supabase database instance:
1. Go to **Project Settings** (the gear icon at the bottom of the sidebar) and click **API**.
2. Copy the following API credentials:
   - **Project URL:** under "Project API keys"
   - **anon public API key:** under "Project API keys" (starts with `eyJ...`)
3. Open or create the [env-config.js](ou1ts.github.io/env-config.js) file in your website's root directory.
4. Replace the placeholder values with your copied live credentials:
   ```javascript
   window.__ENV = window.__ENV || {
     SUPABASE_URL: "https://your-actual-project-id.supabase.co",
     SUPABASE_ANON_KEY: "your-actual-copied-anon-key-here"
   };
   ```
5. Save the file and reload the website. The website will automatically detect the configuration and transition from Local Mock mode to Live Database mode.

---

## 🔍 Under the Hood: What the SQL Script Does

1. **`public.profiles` Table:** Sets up columns to capture User Names, Emails, Student IDs, Departments, Batches, Blood Groups, and Social URLs.
2. **Check Constraints:**
   - `check_student_id_numeric_or_oauth`: Enforces that the `student_id` is either completely numeric or set to `OAUTH_USER` (for third-party login fallbacks).
   - `check_blood_group_valid`: Restricts values to valid standard formats: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.
3. **Row Level Security (RLS) & Policies:** Enables RLS and attaches policies so users can query/view only their own profiles, while blocking unauthorized edits from other users.
4. **Registration Trigger (`handle_new_user`):** Hooks into Supabase's internal user registration system. Whenever a user registers an account, a trigger function is automatically fired to insert a corresponding row into the `public.profiles` table with metadata (e.g. `student_id`, `full_name`) supplied during registration.
