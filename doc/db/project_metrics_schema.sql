-- ========================================================
-- oU1TS Centralized Database: Initiatives Performance Metrics Schema
-- ========================================================
-- This table powers the Initiatives Performance Metrics Dashboard
-- shown via the Profile Card Window Switcher in ou1ts.github.io.
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
