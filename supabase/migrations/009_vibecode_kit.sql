-- ═══════════════════════════════════════════════════════════════════════════════
--                         VIBECODE KIT DATABASE SCHEMA
--                            1nguoi.com Module
-- ═══════════════════════════════════════════════════════════════════════════════
-- AI-powered product design wizard with 6-step flow:
-- Vision → Context → Blueprint → Contract → Build → Refine

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Vibecode Sessions table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vibecode_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

    -- Progress tracking
    current_step SMALLINT DEFAULT 1 CHECK (current_step BETWEEN 1 AND 6),
    status VARCHAR(20) DEFAULT 'in_progress'
      CHECK (status IN ('in_progress', 'completed', 'abandoned')),

    -- Content
    vision_text TEXT,
    context_data JSONB DEFAULT '{}',

    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vibecode_sessions_project ON public.vibecode_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_vibecode_sessions_user ON public.vibecode_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vibecode_sessions_status ON public.vibecode_sessions(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vibecode_sessions_project_unique ON public.vibecode_sessions(project_id);

-- RLS (optimized with select)
ALTER TABLE public.vibecode_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vibecode sessions" ON public.vibecode_sessions
    FOR ALL USING (user_id = (select auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. Vibecode Artifacts table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vibecode_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.vibecode_sessions(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

    -- Artifact info
    type VARCHAR(20) NOT NULL CHECK (type IN ('blueprint', 'contract', 'coder_pack')),
    version SMALLINT DEFAULT 1,
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
    approved_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vibecode_artifacts_session ON public.vibecode_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_vibecode_artifacts_project ON public.vibecode_artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_vibecode_artifacts_type ON public.vibecode_artifacts(type);
CREATE INDEX IF NOT EXISTS idx_vibecode_artifacts_status ON public.vibecode_artifacts(status);

-- RLS (optimized with select)
ALTER TABLE public.vibecode_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vibecode artifacts" ON public.vibecode_artifacts
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.vibecode_sessions WHERE user_id = (select auth.uid())
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. Vibecode Messages table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vibecode_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.vibecode_sessions(id) ON DELETE CASCADE NOT NULL,

    -- Message info
    step SMALLINT NOT NULL CHECK (step BETWEEN 1 AND 6),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vibecode_messages_session ON public.vibecode_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_vibecode_messages_step ON public.vibecode_messages(step);
CREATE INDEX IF NOT EXISTS idx_vibecode_messages_created ON public.vibecode_messages(created_at);

-- RLS (optimized with select)
ALTER TABLE public.vibecode_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vibecode messages" ON public.vibecode_messages
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.vibecode_sessions WHERE user_id = (select auth.uid())
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. Update triggers
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_vibecode_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vibecode_session_timestamp ON public.vibecode_sessions;
CREATE TRIGGER trigger_update_vibecode_session_timestamp
    BEFORE UPDATE ON public.vibecode_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_vibecode_session_timestamp();

CREATE OR REPLACE FUNCTION update_vibecode_artifact_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vibecode_artifact_timestamp ON public.vibecode_artifacts;
CREATE TRIGGER trigger_update_vibecode_artifact_timestamp
    BEFORE UPDATE ON public.vibecode_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION update_vibecode_artifact_timestamp();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. Helper view for sessions with stats
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing view first to recreate with security_invoker
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
-- Done - Vibecode Kit tables created
-- ═══════════════════════════════════════════════════════════════════════════════
