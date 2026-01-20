-- =============================================
-- Migration: Idea Graph Tables
-- Description: Create tables for idea graph feature
-- =============================================

-- =============================================
-- 1. CREATE GRAPHS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.graphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Ý tưởng của tôi',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_graphs_user_id ON public.graphs(user_id);

-- =============================================
-- 2. CREATE NODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id UUID NOT NULL REFERENCES public.graphs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Ý tưởng mới',
    description TEXT,
    color TEXT NOT NULL DEFAULT '#a882ff',
    position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_nodes_graph_id ON public.nodes(graph_id);
CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON public.nodes(user_id);

-- =============================================
-- 3. CREATE LINKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id UUID NOT NULL REFERENCES public.graphs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate links
    UNIQUE(graph_id, source_id, target_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_links_graph_id ON public.links(graph_id);
CREATE INDEX IF NOT EXISTS idx_links_source_id ON public.links(source_id);
CREATE INDEX IF NOT EXISTS idx_links_target_id ON public.links(target_id);

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. CREATE RLS POLICIES FOR GRAPHS
-- =============================================

-- Policy: Users can view their own graphs
CREATE POLICY "Users can view own graphs"
    ON public.graphs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own graphs
CREATE POLICY "Users can insert own graphs"
    ON public.graphs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own graphs
CREATE POLICY "Users can update own graphs"
    ON public.graphs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own graphs
CREATE POLICY "Users can delete own graphs"
    ON public.graphs
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- 6. CREATE RLS POLICIES FOR NODES
-- =============================================

-- Policy: Users can view their own nodes
CREATE POLICY "Users can view own nodes"
    ON public.nodes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own nodes
CREATE POLICY "Users can insert own nodes"
    ON public.nodes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own nodes
CREATE POLICY "Users can update own nodes"
    ON public.nodes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own nodes
CREATE POLICY "Users can delete own nodes"
    ON public.nodes
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- 7. CREATE RLS POLICIES FOR LINKS
-- =============================================

-- Policy: Users can view their own links
CREATE POLICY "Users can view own links"
    ON public.links
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own links
CREATE POLICY "Users can insert own links"
    ON public.links
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own links
CREATE POLICY "Users can update own links"
    ON public.links
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own links
CREATE POLICY "Users can delete own links"
    ON public.links
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- 8. CREATE UPDATED_AT TRIGGERS
-- =============================================

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for graphs table
DROP TRIGGER IF EXISTS update_graphs_updated_at ON public.graphs;
CREATE TRIGGER update_graphs_updated_at
    BEFORE UPDATE ON public.graphs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for nodes table
DROP TRIGGER IF EXISTS update_nodes_updated_at ON public.nodes;
CREATE TRIGGER update_nodes_updated_at
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
