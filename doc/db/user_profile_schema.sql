-- oU1TS Centralized Database - User Profile Schema
-- Follows instructions in oU1TS_Central_Database_Guide(from portal repo).md

-- 1. Create the profiles table
CREATE TABLE public.profiles (
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

  -- Constraints
  CONSTRAINT check_student_id_numeric_or_oauth 
    CHECK (student_id ~ '^[0-9]+$' OR student_id = 'OAUTH_USER'),
  
  CONSTRAINT check_blood_group_valid 
    CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow system triggers to insert during registration
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 4. Create Partial Unique Index for Student ID (fixes duplicate OAUTH_USER conflicts)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_id_unique
  ON public.profiles (student_id)
  WHERE student_id IS NOT NULL AND student_id <> 'OAUTH_USER';

-- 5. Auto-Profile Trigger Function
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

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Add Project Tag helper function (for sub-projects)
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
