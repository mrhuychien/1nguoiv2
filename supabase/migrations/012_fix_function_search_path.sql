-- ═══════════════════════════════════════════════════════════════════════════════
--                         FIX FUNCTION SEARCH PATH
--                            1nguoi.com Security Fix
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration fixes the "function_search_path_mutable" warning
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
--
-- Problem: Functions without SET search_path can be exploited by attackers
-- who create malicious objects in other schemas that shadow system functions.
--
-- Solution: Set search_path = '' to ensure only fully qualified names are used.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Fix update_brainstorm_session_timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_brainstorm_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Fix update_vibecode_session_timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_vibecode_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Fix update_vibecode_artifact_timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_vibecode_artifact_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Fix upsert_zen_stats
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.upsert_zen_stats(
  p_user_id UUID,
  p_today_minutes INTEGER DEFAULT 0,
  p_flow_sessions INTEGER DEFAULT 0,
  p_tasks_completed INTEGER DEFAULT 0
)
RETURNS public.zen_stats
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  result public.zen_stats;
BEGIN
  INSERT INTO public.zen_stats (user_id, date, today_minutes, flow_sessions, tasks_completed)
  VALUES (p_user_id, CURRENT_DATE, p_today_minutes, p_flow_sessions, p_tasks_completed)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    today_minutes = public.zen_stats.today_minutes + p_today_minutes,
    flow_sessions = public.zen_stats.flow_sessions + p_flow_sessions,
    tasks_completed = public.zen_stats.tasks_completed + p_tasks_completed,
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Fix encrypt_api_key
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.encrypt_api_key(plain_key TEXT, encryption_secret TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(plain_key, encryption_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. Fix decrypt_api_key
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key BYTEA, encryption_secret TEXT)
RETURNS TEXT AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- Check if caller is admin
    SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

    IF caller_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can decrypt API keys';
    END IF;

    RETURN pgp_sym_decrypt(encrypted_key, encryption_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. Fix update_ai_provider_timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_ai_provider_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. Fix increment_ai_provider_stats
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_ai_provider_stats(
    p_provider VARCHAR,
    p_requests INTEGER,
    p_tokens INTEGER,
    p_cost DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.ai_provider_settings
    SET
        total_requests = total_requests + p_requests,
        total_tokens = total_tokens + p_tokens,
        total_cost = total_cost + p_cost,
        last_used_at = NOW()
    WHERE provider = p_provider;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done - All functions now have SET search_path = ''
-- ═══════════════════════════════════════════════════════════════════════════════
