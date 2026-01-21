export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'active' | 'completed' | 'archived'
          lifecycle: 'idea' | 'designing' | 'building' | 'testing' | 'shipped' | 'paused'
          health: 'on-track' | 'at-risk' | 'blocked'
          is_focus: boolean
          progress: number
          deadline: string | null
          last_task: string | null
          current_task: string | null
          color: string
          icon: string
          total_minutes: number
          completed_minutes: number
          created_at: string
          updated_at: string
          // Template fields
          template_id: string | null
          current_phase: number | null
          total_tasks: number | null
          completed_tasks: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
          lifecycle?: 'idea' | 'designing' | 'building' | 'testing' | 'shipped' | 'paused'
          health?: 'on-track' | 'at-risk' | 'blocked'
          is_focus?: boolean
          progress?: number
          deadline?: string | null
          last_task?: string | null
          current_task?: string | null
          color?: string
          icon?: string
          total_minutes?: number
          completed_minutes?: number
          created_at?: string
          updated_at?: string
          // Template fields
          template_id?: string | null
          current_phase?: number | null
          total_tasks?: number | null
          completed_tasks?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
          lifecycle?: 'idea' | 'designing' | 'building' | 'testing' | 'shipped' | 'paused'
          health?: 'on-track' | 'at-risk' | 'blocked'
          is_focus?: boolean
          progress?: number
          deadline?: string | null
          last_task?: string | null
          current_task?: string | null
          color?: string
          icon?: string
          total_minutes?: number
          completed_minutes?: number
          created_at?: string
          updated_at?: string
          // Template fields
          template_id?: string | null
          current_phase?: number | null
          total_tasks?: number | null
          completed_tasks?: number | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          description: string | null
          completed: boolean
          is_daily_focus: boolean
          due_date: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          estimated_minutes: number
          actual_minutes: number
          priority: number
          completed_at: string | null
          created_at: string
          updated_at: string
          // Template task fields
          emoji: string | null
          zone: 'designing' | 'building' | null
          phase: number | null
          is_template: boolean
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          description?: string | null
          completed?: boolean
          is_daily_focus?: boolean
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          estimated_minutes?: number
          actual_minutes?: number
          priority?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          // Template task fields
          emoji?: string | null
          zone?: 'designing' | 'building' | null
          phase?: number | null
          is_template?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          completed?: boolean
          is_daily_focus?: boolean
          due_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
          estimated_minutes?: number
          actual_minutes?: number
          priority?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          // Template task fields
          emoji?: string | null
          zone?: 'designing' | 'building' | null
          phase?: number | null
          is_template?: boolean
        }
      }
      graphs: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      nodes: {
        Row: {
          id: string
          graph_id: string
          user_id: string
          title: string
          description: string | null
          color: string
          position_x: number
          position_y: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          graph_id: string
          user_id: string
          title: string
          description?: string | null
          color?: string
          position_x: number
          position_y: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          graph_id?: string
          user_id?: string
          title?: string
          description?: string | null
          color?: string
          position_x?: number
          position_y?: number
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          graph_id: string
          user_id: string
          source_id: string
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          graph_id: string
          user_id: string
          source_id: string
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          graph_id?: string
          user_id?: string
          source_id?: string
          target_id?: string
          created_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          task_id: string | null
          duration: number
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          task_id?: string | null
          duration: number
          started_at: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          task_id?: string | null
          duration?: number
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
      }
      zen_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          today_minutes: number
          week_minutes: number
          streak: number
          flow_sessions: number
          tasks_completed: number
          projects_active: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          today_minutes?: number
          week_minutes?: number
          streak?: number
          flow_sessions?: number
          tasks_completed?: number
          projects_active?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          today_minutes?: number
          week_minutes?: number
          streak?: number
          flow_sessions?: number
          tasks_completed?: number
          projects_active?: number
          created_at?: string
          updated_at?: string
        }
      }
      brainstorm_sessions: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          original_idea: string
          mode: 'quick' | 'deep'
          quick_mode_agent: 'spark' | 'lens' | 'radar' | 'devil' | null
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          current_round: number
          total_rounds: number
          final_verdict: Json | null
          duration_seconds: number
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          original_idea: string
          mode?: 'quick' | 'deep'
          quick_mode_agent?: 'spark' | 'lens' | 'radar' | 'devil' | null
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          current_round?: number
          total_rounds?: number
          final_verdict?: Json | null
          duration_seconds?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          original_idea?: string
          mode?: 'quick' | 'deep'
          quick_mode_agent?: 'spark' | 'lens' | 'radar' | 'devil' | null
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          current_round?: number
          total_rounds?: number
          final_verdict?: Json | null
          duration_seconds?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      brainstorm_rounds: {
        Row: {
          id: string
          session_id: string
          round_number: number
          agent: 'spark' | 'lens' | 'radar' | 'devil'
          role: string
          status: 'pending' | 'running' | 'completed' | 'failed'
          input_context: string | null
          output_content: string | null
          output_structured: Json | null
          tokens_used: number
          duration_ms: number
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          round_number: number
          agent: 'spark' | 'lens' | 'radar' | 'devil'
          role: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          input_context?: string | null
          output_content?: string | null
          output_structured?: Json | null
          tokens_used?: number
          duration_ms?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          round_number?: number
          agent?: 'spark' | 'lens' | 'radar' | 'devil'
          role?: string
          status?: 'pending' | 'running' | 'completed' | 'failed'
          input_context?: string | null
          output_content?: string | null
          output_structured?: Json | null
          tokens_used?: number
          duration_ms?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      brainstorm_insights: {
        Row: {
          id: string
          session_id: string
          round_id: string | null
          type: 'idea' | 'strength' | 'weakness' | 'opportunity' | 'threat' | 'risk' | 'question'
          title: string
          content: string | null
          importance: number
          source_agent: 'spark' | 'lens' | 'radar' | 'devil' | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          round_id?: string | null
          type: 'idea' | 'strength' | 'weakness' | 'opportunity' | 'threat' | 'risk' | 'question'
          title: string
          content?: string | null
          importance?: number
          source_agent?: 'spark' | 'lens' | 'radar' | 'devil' | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          round_id?: string | null
          type?: 'idea' | 'strength' | 'weakness' | 'opportunity' | 'threat' | 'risk' | 'question'
          title?: string
          content?: string | null
          importance?: number
          source_agent?: 'spark' | 'lens' | 'radar' | 'devil' | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: 'active' | 'completed' | 'archived'
      project_lifecycle: 'idea' | 'designing' | 'building' | 'testing' | 'shipped' | 'paused'
      project_health: 'on-track' | 'at-risk' | 'blocked'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Graph = Database['public']['Tables']['graphs']['Row']
export type Node = Database['public']['Tables']['nodes']['Row']
export type Link = Database['public']['Tables']['links']['Row']
export type TimeEntry = Database['public']['Tables']['time_entries']['Row']
export type ZenStatsRow = Database['public']['Tables']['zen_stats']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type GraphInsert = Database['public']['Tables']['graphs']['Insert']
export type NodeInsert = Database['public']['Tables']['nodes']['Insert']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']
export type ZenStatsInsert = Database['public']['Tables']['zen_stats']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type GraphUpdate = Database['public']['Tables']['graphs']['Update']
export type NodeUpdate = Database['public']['Tables']['nodes']['Update']
export type LinkUpdate = Database['public']['Tables']['links']['Update']
export type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update']
export type ZenStatsUpdate = Database['public']['Tables']['zen_stats']['Update']

// Brainstorm types
export type BrainstormSessionRow = Database['public']['Tables']['brainstorm_sessions']['Row']
export type BrainstormSessionInsert = Database['public']['Tables']['brainstorm_sessions']['Insert']
export type BrainstormSessionUpdate = Database['public']['Tables']['brainstorm_sessions']['Update']
export type BrainstormRoundRow = Database['public']['Tables']['brainstorm_rounds']['Row']
export type BrainstormRoundInsert = Database['public']['Tables']['brainstorm_rounds']['Insert']
export type BrainstormRoundUpdate = Database['public']['Tables']['brainstorm_rounds']['Update']
export type BrainstormInsightRow = Database['public']['Tables']['brainstorm_insights']['Row']
export type BrainstormInsightInsert = Database['public']['Tables']['brainstorm_insights']['Insert']
export type BrainstormInsightUpdate = Database['public']['Tables']['brainstorm_insights']['Update']
