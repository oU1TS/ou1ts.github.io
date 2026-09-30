-- ========================================================
-- oU1TS Centralized Database: Child Projects Telemetry Architecture
-- ========================================================
-- Central Supabase DB Architecture:
-- The database is shared across the root landing page ('root' = ou1ts.github.io)
-- and all child projects ('portal' = ou1ts.github.io/portal, 'archive', 'scheduler', etc.).
--
-- Each user profile in public.profiles contains a "project_tags" array (e.g. ARRAY['root', 'portal']).
-- The Initiatives Dashboard dynamically renders cards ONLY for initiatives whose project tag
-- is present in the active user's project_tags column.
--
-- Live Child Project Tables (currently live for 'portal'):
-- 1. public.portal_resources: Curated educational & community resources (materials, tools, etc.)
-- 2. public.stars: User favorites and bookmark engagements
-- 3. public.profiles: User registrations with project_tags
-- ========================================================

-- 1. Ensure RLS on Portal Resources allows public counting
ALTER TABLE IF EXISTS public.portal_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for portal_resources" ON public.portal_resources;
CREATE POLICY "Public read access for portal_resources" ON public.portal_resources
  FOR SELECT USING (true);

-- 2. Ensure RLS on Stars allows public counting
ALTER TABLE IF EXISTS public.stars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for stars" ON public.stars;
CREATE POLICY "Public read access for stars" ON public.stars
  FOR SELECT USING (true);

-- 3. Live Telemetry View (Aggregates real data from actual child project tables)
CREATE OR REPLACE VIEW public.portal_telemetry_view AS
SELECT
  'Projects Hub' AS project_name,
  'portal' AS project_tag,
  'Ecosystem Core' AS category,
  'Operational' AS status,
  'online' AS status_type,
  99.9 AS health_score,
  'Central gateway & resource directory. Connected to live Supabase portal database.' AS summary,
  (SELECT COUNT(*) FROM public.portal_resources WHERE status = 'approved') AS live_resources_count,
  (SELECT COUNT(*) FROM public.stars) AS total_stars_count,
  (SELECT COUNT(*) FROM public.profiles WHERE 'portal' = ANY(project_tags)) AS active_members_count;

-- 4. Grant access to anonymous & authenticated roles
GRANT SELECT ON public.portal_telemetry_view TO anon, authenticated;
