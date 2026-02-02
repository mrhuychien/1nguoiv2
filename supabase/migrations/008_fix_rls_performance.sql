-- ═══════════════════════════════════════════════════════════════════════════════
--                         FIX RLS PERFORMANCE ISSUES
--                            1nguoi.com Optimization
-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix: Replace auth.uid() with (select auth.uid()) for better performance
-- This prevents re-evaluation of the function for each row
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Fix profiles table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Fix projects table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects" ON public.projects
    FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Fix tasks table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks" ON public.tasks
    FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Fix time_entries table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can manage own time entries" ON public.time_entries;
CREATE POLICY "Users can manage own time entries" ON public.time_entries
    FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Fix zen_stats table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own zen stats" ON public.zen_stats;
DROP POLICY IF EXISTS "Users can insert own zen stats" ON public.zen_stats;
DROP POLICY IF EXISTS "Users can update own zen stats" ON public.zen_stats;

CREATE POLICY "Users can view own zen stats" ON public.zen_stats
    FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own zen stats" ON public.zen_stats
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own zen stats" ON public.zen_stats
    FOR UPDATE USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Fix graphs table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own graphs" ON public.graphs;
DROP POLICY IF EXISTS "Users can insert own graphs" ON public.graphs;
DROP POLICY IF EXISTS "Users can update own graphs" ON public.graphs;
DROP POLICY IF EXISTS "Users can delete own graphs" ON public.graphs;

CREATE POLICY "Users can view own graphs" ON public.graphs
    FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own graphs" ON public.graphs
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own graphs" ON public.graphs
    FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own graphs" ON public.graphs
    FOR DELETE USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Fix nodes table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own nodes" ON public.nodes;
DROP POLICY IF EXISTS "Users can insert own nodes" ON public.nodes;
DROP POLICY IF EXISTS "Users can update own nodes" ON public.nodes;
DROP POLICY IF EXISTS "Users can delete own nodes" ON public.nodes;

CREATE POLICY "Users can view own nodes" ON public.nodes
    FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own nodes" ON public.nodes
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own nodes" ON public.nodes
    FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own nodes" ON public.nodes
    FOR DELETE USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Fix links table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own links" ON public.links;
DROP POLICY IF EXISTS "Users can insert own links" ON public.links;
DROP POLICY IF EXISTS "Users can update own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.links;

CREATE POLICY "Users can view own links" ON public.links
    FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own links" ON public.links
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own links" ON public.links
    FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own links" ON public.links
    FOR DELETE USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. Fix brainstorm_sessions table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own sessions" ON public.brainstorm_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.brainstorm_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.brainstorm_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.brainstorm_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.brainstorm_sessions;

CREATE POLICY "Users can manage own sessions" ON public.brainstorm_sessions
    FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. Fix brainstorm_rounds table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view rounds of own sessions" ON public.brainstorm_rounds;
DROP POLICY IF EXISTS "Users can create rounds for own sessions" ON public.brainstorm_rounds;
DROP POLICY IF EXISTS "Users can update rounds of own sessions" ON public.brainstorm_rounds;
DROP POLICY IF EXISTS "Users can delete rounds of own sessions" ON public.brainstorm_rounds;
DROP POLICY IF EXISTS "Users can view own rounds" ON public.brainstorm_rounds;
DROP POLICY IF EXISTS "System can manage rounds" ON public.brainstorm_rounds;

CREATE POLICY "Users can manage own rounds" ON public.brainstorm_rounds
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = (select auth.uid())
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. Fix ai_provider_settings table RLS
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Only admins can view AI settings" ON public.ai_provider_settings;
DROP POLICY IF EXISTS "Only admins can update AI settings" ON public.ai_provider_settings;

-- For ai_provider_settings, check admin role in profiles
CREATE POLICY "Admins can view AI settings" ON public.ai_provider_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update AI settings" ON public.ai_provider_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. Fix ai_usage_logs table RLS (also fix multiple permissive policies)
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Admins can view all logs" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.ai_usage_logs;

-- Combine into single policy with OR condition
CREATE POLICY "Users can view logs" ON public.ai_usage_logs
    FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role IN ('admin', 'super_admin')
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. Add missing indexes for foreign keys
-- ═══════════════════════════════════════════════════════════════════════════════

-- projects.user_id
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- tasks.user_id
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- time_entries.project_id and task_id
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON public.time_entries(task_id);

-- links.user_id
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);

-- ai_provider_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_ai_provider_settings_updated_by ON public.ai_provider_settings(updated_by);

-- ai_usage_logs.round_id
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_round_id ON public.ai_usage_logs(round_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done - All RLS policies optimized with (select auth.uid())
-- Done - All foreign key indexes added
-- ═══════════════════════════════════════════════════════════════════════════════
