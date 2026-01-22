-- ═══════════════════════════════════════════════════════════════════════════════
--                         BRAINSTORM4 SCHEMA
--                    AI-Powered Idea Validation System
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Brainstorm Sessions
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

    -- Session info
    title VARCHAR(200) NOT NULL,
    original_idea TEXT NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'running', 'completed', 'error')),

    -- Progress
    total_rounds INTEGER DEFAULT 5,
    current_round INTEGER DEFAULT 0,

    -- Cost tracking
    total_cost DECIMAL(10, 6) DEFAULT 0,

    -- Final verdict (JSON)
    final_verdict JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brainstorm_sessions_user ON public.brainstorm_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_brainstorm_sessions_project ON public.brainstorm_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_brainstorm_sessions_status ON public.brainstorm_sessions(status);
CREATE INDEX IF NOT EXISTS idx_brainstorm_sessions_created ON public.brainstorm_sessions(created_at DESC);

-- RLS
ALTER TABLE public.brainstorm_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.brainstorm_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions" ON public.brainstorm_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON public.brainstorm_sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON public.brainstorm_sessions
    FOR DELETE USING (user_id = auth.uid());

-- 2. Brainstorm Rounds
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.brainstorm_sessions(id) ON DELETE CASCADE,

    -- Round info
    round_number INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('ideation', 'research', 'analysis', 'challenge', 'synthesis')),
    agent_id VARCHAR(20) NOT NULL
        CHECK (agent_id IN ('spark', 'lens', 'radar', 'devil')),

    -- Status
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'error')),

    -- Content
    prompt TEXT,
    output TEXT,

    -- Metrics
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,

    -- Error handling
    error TEXT,

    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint
    UNIQUE (session_id, round_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brainstorm_rounds_session ON public.brainstorm_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_brainstorm_rounds_status ON public.brainstorm_rounds(status);

-- RLS
ALTER TABLE public.brainstorm_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rounds of own sessions" ON public.brainstorm_rounds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.brainstorm_sessions
            WHERE id = brainstorm_rounds.session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rounds for own sessions" ON public.brainstorm_rounds
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brainstorm_sessions
            WHERE id = brainstorm_rounds.session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update rounds of own sessions" ON public.brainstorm_rounds
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.brainstorm_sessions
            WHERE id = brainstorm_rounds.session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete rounds of own sessions" ON public.brainstorm_rounds
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.brainstorm_sessions
            WHERE id = brainstorm_rounds.session_id AND user_id = auth.uid()
        )
    );

-- 3. Update timestamp trigger
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_brainstorm_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

DROP TRIGGER IF EXISTS trigger_update_brainstorm_session_timestamp ON public.brainstorm_sessions;
CREATE TRIGGER trigger_update_brainstorm_session_timestamp
    BEFORE UPDATE ON public.brainstorm_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_brainstorm_session_timestamp();

-- 4. Function to increment provider stats
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_ai_provider_stats(
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
