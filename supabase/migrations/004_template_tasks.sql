-- Add template support to projects and tasks

-- Add template fields to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_phase INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_tasks INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_tasks INTEGER DEFAULT NULL;

-- Add template fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS zone TEXT DEFAULT NULL CHECK (zone IS NULL OR zone IN ('designing', 'building')),
ADD COLUMN IF NOT EXISTS phase INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

-- Update status enum to include 'skipped'
-- Note: This requires recreating the constraint if it exists
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped'));

-- Create index for faster template task queries
CREATE INDEX IF NOT EXISTS idx_tasks_project_template ON tasks(project_id, is_template);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(project_id, phase);
