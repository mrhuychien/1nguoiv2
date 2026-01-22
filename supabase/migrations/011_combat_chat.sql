-- ═══════════════════════════════════════════════════════════════════════════════
--                         COMBAT - AI GROUP CHAT
--                            1nguoi.com Module
-- ═══════════════════════════════════════════════════════════════════════════════
-- Combat: Phòng họp với 4 AI agents, user làm moderator điều phối cuộc thảo luận

-- 1. Combat Sessions table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.combat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

    -- Session info
    title TEXT NOT NULL,
    topic TEXT, -- Chủ đề thảo luận

    -- Status
    status VARCHAR(20) DEFAULT 'active'
      CHECK (status IN ('active', 'paused', 'ended')),

    -- Metadata
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 4) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_combat_sessions_user ON public.combat_sessions(user_id);
CREATE INDEX idx_combat_sessions_project ON public.combat_sessions(project_id);
CREATE INDEX idx_combat_sessions_status ON public.combat_sessions(status);

-- RLS
ALTER TABLE public.combat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own combat sessions" ON public.combat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 2. Combat Messages table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.combat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.combat_sessions(id) ON DELETE CASCADE NOT NULL,

    -- Message info
    role VARCHAR(20) NOT NULL
      CHECK (role IN ('user', 'spark', 'lens', 'radar', 'devil', 'system')),
    content TEXT NOT NULL,

    -- For AI messages: which agent was mentioned/targeted
    mentioned_agents TEXT[] DEFAULT '{}',

    -- Metrics (for AI responses)
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost DECIMAL(10, 4) DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_combat_messages_session ON public.combat_messages(session_id);
CREATE INDEX idx_combat_messages_role ON public.combat_messages(role);
CREATE INDEX idx_combat_messages_created ON public.combat_messages(created_at);

-- RLS
ALTER TABLE public.combat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own combat messages" ON public.combat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.combat_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert combat messages" ON public.combat_messages
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM public.combat_sessions WHERE user_id = auth.uid()
        )
    );

-- 3. Update triggers
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_combat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_combat_session_timestamp ON public.combat_sessions;
CREATE TRIGGER trigger_update_combat_session_timestamp
    BEFORE UPDATE ON public.combat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_combat_session_timestamp();

-- Update message count on new message
CREATE OR REPLACE FUNCTION update_combat_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.combat_sessions
    SET total_messages = total_messages + 1
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_combat_message_count ON public.combat_messages;
CREATE TRIGGER trigger_update_combat_message_count
    AFTER INSERT ON public.combat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_combat_message_count();
