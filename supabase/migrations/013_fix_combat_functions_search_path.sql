-- ═══════════════════════════════════════════════════════════════════════════════
--                         FIX COMBAT FUNCTIONS SEARCH PATH
--                            1nguoi.com Security Fix
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration fixes the "function_search_path_mutable" warning for combat functions
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Fix update_combat_session_timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_combat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Fix update_combat_message_count
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_combat_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.combat_sessions
    SET message_count = message_count + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done - Combat functions now have SET search_path = ''
-- ═══════════════════════════════════════════════════════════════════════════════
