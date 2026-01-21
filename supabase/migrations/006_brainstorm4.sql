-- ═══════════════════════════════════════════════════════════════════════════════
--                         BRAINSTORM4 DATABASE SCHEMA
--                            1nguoi.com Module
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Update projects table: Add 'idea' status
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('idea', 'focus', 'active', 'backlog', 'archived'));

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);

-- 2. Brainstorm Sessions table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

    -- Input
    title TEXT NOT NULL,
    original_idea TEXT NOT NULL,
    mode VARCHAR(20) DEFAULT 'deep' CHECK (mode IN ('quick', 'deep')),
    quick_mode_agent VARCHAR(20) CHECK (quick_mode_agent IN ('spark', 'lens', 'radar', 'devil')),

    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    current_round INTEGER DEFAULT 0,
    total_rounds INTEGER DEFAULT 5,

    -- Results
    final_verdict JSONB DEFAULT NULL,

    -- Metadata
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 4) DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brainstorm_sessions_user ON public.brainstorm_sessions(user_id);
CREATE INDEX idx_brainstorm_sessions_status ON public.brainstorm_sessions(status);
CREATE INDEX idx_brainstorm_sessions_project ON public.brainstorm_sessions(project_id);

-- RLS
ALTER TABLE public.brainstorm_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON public.brainstorm_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 3. Brainstorm Rounds table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.brainstorm_sessions(id) ON DELETE CASCADE NOT NULL,

    -- Round info
    round_number INTEGER NOT NULL,
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('spark', 'lens', 'radar', 'devil')),
    role VARCHAR(50) NOT NULL,

    -- Input/Output
    input_prompt TEXT,
    output_content TEXT,
    parsed_output JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'pending'
      CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    error_message TEXT,

    -- Metrics
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost DECIMAL(10, 4) DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_brainstorm_rounds_session ON public.brainstorm_rounds(session_id);
CREATE INDEX idx_brainstorm_rounds_status ON public.brainstorm_rounds(status);

-- RLS
ALTER TABLE public.brainstorm_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rounds" ON public.brainstorm_rounds
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage rounds" ON public.brainstorm_rounds
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

-- 4. Brainstorm Insights table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.brainstorm_sessions(id) ON DELETE CASCADE NOT NULL,
    round_id UUID REFERENCES public.brainstorm_rounds(id) ON DELETE CASCADE,

    -- Insight content
    type VARCHAR(30) NOT NULL
      CHECK (type IN (
        'idea',
        'market_data',
        'competitor',
        'strength',
        'weakness',
        'opportunity',
        'threat',
        'risk',
        'question',
        'recommendation',
        'next_step'
      )),
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('spark', 'lens', 'radar', 'devil')),

    title TEXT NOT NULL,
    content TEXT,

    -- Scoring
    score DECIMAL(3, 1) CHECK (score >= 0 AND score <= 10),
    confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),

    -- Relationships
    parent_insight_id UUID REFERENCES public.brainstorm_insights(id) ON DELETE SET NULL,
    related_idea_index INTEGER,

    -- Extra data
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brainstorm_insights_session ON public.brainstorm_insights(session_id);
CREATE INDEX idx_brainstorm_insights_round ON public.brainstorm_insights(round_id);
CREATE INDEX idx_brainstorm_insights_type ON public.brainstorm_insights(type);
CREATE INDEX idx_brainstorm_insights_agent ON public.brainstorm_insights(agent);

-- RLS
ALTER TABLE public.brainstorm_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.brainstorm_insights
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage insights" ON public.brainstorm_insights
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

-- 5. Update triggers
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_brainstorm_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_brainstorm_session_timestamp ON public.brainstorm_sessions;
CREATE TRIGGER trigger_update_brainstorm_session_timestamp
    BEFORE UPDATE ON public.brainstorm_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_brainstorm_session_timestamp();

-- 6. Helper views
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.brainstorm_sessions_with_stats AS
SELECT
    bs.*,
    COUNT(DISTINCT br.id) AS total_rounds_completed,
    COUNT(DISTINCT bi.id) AS total_insights,
    COUNT(DISTINCT CASE WHEN bi.type = 'idea' THEN bi.id END) AS ideas_count,
    COUNT(DISTINCT CASE WHEN bi.type = 'risk' THEN bi.id END) AS risks_count,
    COUNT(DISTINCT CASE WHEN bi.type = 'question' THEN bi.id END) AS questions_count
FROM public.brainstorm_sessions bs
LEFT JOIN public.brainstorm_rounds br ON br.session_id = bs.id AND br.status = 'completed'
LEFT JOIN public.brainstorm_insights bi ON bi.session_id = bs.id
GROUP BY bs.id;
