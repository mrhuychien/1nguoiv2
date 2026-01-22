-- ═══════════════════════════════════════════════════════════════════════════════
--                         FIX SECURITY DEFINER VIEWS v2
--                            1nguoi.com Security Fix
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration ensures views use security_invoker = true
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view
--
-- Problem: Views with SECURITY DEFINER execute with the permissions of the view
-- creator, bypassing RLS policies. This is a security risk.
--
-- Solution: Use security_invoker = true to enforce RLS of the querying user.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Fix vibecode_sessions_with_stats view
-- ═══════════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.vibecode_sessions_with_stats;

CREATE VIEW public.vibecode_sessions_with_stats
WITH (security_invoker = true)
AS
SELECT
    vs.*,
    COUNT(DISTINCT va.id) AS total_artifacts,
    COUNT(DISTINCT CASE WHEN va.type = 'blueprint' AND va.status != 'archived' THEN va.id END) AS blueprints_count,
    COUNT(DISTINCT CASE WHEN va.type = 'contract' AND va.status != 'archived' THEN va.id END) AS contracts_count,
    COUNT(DISTINCT CASE WHEN va.type = 'coder_pack' AND va.status != 'archived' THEN va.id END) AS coder_packs_count,
    COUNT(DISTINCT vm.id) AS total_messages,
    BOOL_OR(va.type = 'blueprint' AND va.status = 'approved') AS has_approved_blueprint,
    BOOL_OR(va.type = 'contract' AND va.status = 'approved') AS has_approved_contract,
    BOOL_OR(va.type = 'coder_pack' AND va.status = 'approved') AS has_approved_coder_pack
FROM public.vibecode_sessions vs
LEFT JOIN public.vibecode_artifacts va ON va.session_id = vs.id
LEFT JOIN public.vibecode_messages vm ON vm.session_id = vs.id
GROUP BY vs.id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Fix ai_provider_status view
-- ═══════════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.ai_provider_status;

CREATE VIEW public.ai_provider_status
WITH (security_invoker = true)
AS
SELECT
    provider,
    display_name,
    is_enabled,
    is_configured,
    total_requests,
    total_tokens,
    total_cost,
    last_used_at,
    updated_at
FROM public.ai_provider_settings;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.ai_provider_status TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done - All views now use security_invoker = true
-- RLS policies of the querying user will be enforced
-- ═══════════════════════════════════════════════════════════════════════════════
