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
          role: 'user' | 'admin' | 'super_admin'
          subscription: 'free' | 'pro'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          subscription?: 'free' | 'pro'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          subscription?: 'free' | 'pro'
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
      ai_provider_settings: {
        Row: {
          id: string
          provider: 'openai' | 'anthropic' | 'google' | 'xai'
          display_name: string
          api_key_encrypted: string | null
          is_enabled: boolean
          is_configured: boolean
          total_requests: number
          total_tokens: number
          total_cost: number
          last_used_at: string | null
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          provider: 'openai' | 'anthropic' | 'google' | 'xai'
          display_name: string
          api_key_encrypted?: string | null
          is_enabled?: boolean
          is_configured?: boolean
          total_requests?: number
          total_tokens?: number
          total_cost?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          provider?: 'openai' | 'anthropic' | 'google' | 'xai'
          display_name?: string
          api_key_encrypted?: string | null
          is_enabled?: boolean
          is_configured?: boolean
          total_requests?: number
          total_tokens?: number
          total_cost?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
      ai_usage_logs: {
        Row: {
          id: string
          provider: string
          user_id: string | null
          session_id: string | null
          round_id: string | null
          model: string | null
          tokens_input: number
          tokens_output: number
          cost: number
          duration_ms: number
          status: 'success' | 'error' | 'timeout'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          user_id?: string | null
          session_id?: string | null
          round_id?: string | null
          model?: string | null
          tokens_input?: number
          tokens_output?: number
          cost?: number
          duration_ms?: number
          status?: 'success' | 'error' | 'timeout'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          user_id?: string | null
          session_id?: string | null
          round_id?: string | null
          model?: string | null
          tokens_input?: number
          tokens_output?: number
          cost?: number
          duration_ms?: number
          status?: 'success' | 'error' | 'timeout'
          error_message?: string | null
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

// AI Provider types
export type AIProviderSettings = Database['public']['Tables']['ai_provider_settings']['Row']
export type AIProviderSettingsInsert = Database['public']['Tables']['ai_provider_settings']['Insert']
export type AIProviderSettingsUpdate = Database['public']['Tables']['ai_provider_settings']['Update']
export type AIUsageLog = Database['public']['Tables']['ai_usage_logs']['Row']
export type AIUsageLogInsert = Database['public']['Tables']['ai_usage_logs']['Insert']
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'xai'
export type UserRole = 'user' | 'admin' | 'super_admin'
export type Subscription = 'free' | 'pro'
