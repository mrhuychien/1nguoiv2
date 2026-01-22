-- ═══════════════════════════════════════════════════════════════════════════════
--                         ADMIN & AI SETTINGS SCHEMA
--                            1nguoi.com - Security First
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Add admin role to profiles
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- Set mrhuychien@gmail.com as admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'mrhuychien@gmail.com';

-- Index for faster role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. AI Provider Settings table (encrypted keys stored here)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_provider_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Provider info
    provider VARCHAR(30) NOT NULL UNIQUE
      CHECK (provider IN ('openai', 'anthropic', 'google', 'xai')),
    display_name VARCHAR(50) NOT NULL,

    -- API Key (encrypted using pgcrypto)
    -- Key is encrypted with a secret stored in environment variable
    api_key_encrypted BYTEA,

    -- Status
    is_enabled BOOLEAN DEFAULT false,
    is_configured BOOLEAN DEFAULT false,

    -- Usage tracking
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 4) DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Insert default providers
INSERT INTO public.ai_provider_settings (provider, display_name) VALUES
    ('openai', 'OpenAI (GPT-4)'),
    ('anthropic', 'Anthropic (Claude)'),
    ('google', 'Google (Gemini)'),
    ('xai', 'xAI (Grok)')
ON CONFLICT (provider) DO NOTHING;

-- RLS - Only admins can access
ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view AI settings" ON public.ai_provider_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can update AI settings" ON public.ai_provider_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 3. AI Usage Logs (for tracking and billing)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Reference
    provider VARCHAR(30) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.brainstorm_sessions(id) ON DELETE SET NULL,
    round_id UUID REFERENCES public.brainstorm_rounds(id) ON DELETE SET NULL,

    -- Request details
    model VARCHAR(50),
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_usage_logs_provider ON public.ai_usage_logs(provider);
CREATE INDEX idx_ai_usage_logs_user ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_session ON public.ai_usage_logs(session_id);
CREATE INDEX idx_ai_usage_logs_created ON public.ai_usage_logs(created_at);

-- RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" ON public.ai_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can view own logs" ON public.ai_usage_logs
    FOR SELECT USING (user_id = auth.uid());

-- 4. Encryption helper functions (using pgcrypto)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt API key
CREATE OR REPLACE FUNCTION encrypt_api_key(plain_key TEXT, encryption_secret TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(plain_key, encryption_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- Function to decrypt API key (only callable by authenticated users with admin role)
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key BYTEA, encryption_secret TEXT)
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

-- 5. Update trigger for ai_provider_settings
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_ai_provider_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

DROP TRIGGER IF EXISTS trigger_update_ai_provider_timestamp ON public.ai_provider_settings;
CREATE TRIGGER trigger_update_ai_provider_timestamp
    BEFORE UPDATE ON public.ai_provider_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_provider_timestamp();

-- 6. View for admin dashboard
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing view first to recreate with security_invoker
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

-- Grant access to authenticated users (they still need to pass RLS)
GRANT SELECT ON public.ai_provider_status TO authenticated;
