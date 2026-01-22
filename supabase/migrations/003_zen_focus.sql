-- Zen Focus Feature Migration
-- This migration adds columns needed for Zen Focus feature

-- Add color and icon to projects table for Zen visualization
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#00d4ff',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'folder',
ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_minutes INTEGER DEFAULT 0;

-- Add zen-specific columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS actual_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create zen_stats table for tracking daily/weekly statistics
CREATE TABLE IF NOT EXISTS zen_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  today_minutes INTEGER DEFAULT 0,
  week_minutes INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  flow_sessions INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  projects_active INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add RLS policies for zen_stats
ALTER TABLE zen_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own zen stats"
ON zen_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own zen stats"
ON zen_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own zen stats"
ON zen_stats FOR UPDATE
USING (auth.uid() = user_id);

-- Create or replace function to upsert zen stats
CREATE OR REPLACE FUNCTION upsert_zen_stats(
  p_user_id UUID,
  p_today_minutes INTEGER DEFAULT 0,
  p_flow_sessions INTEGER DEFAULT 0,
  p_tasks_completed INTEGER DEFAULT 0
)
RETURNS zen_stats
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_zen_stats_user_date ON zen_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, started_at DESC);
