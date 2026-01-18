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
          health: 'on-track' | 'at-risk' | 'blocked'
          is_focus: boolean
          progress: number
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
          health?: 'on-track' | 'at-risk' | 'blocked'
          is_focus?: boolean
          progress?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
          health?: 'on-track' | 'at-risk' | 'blocked'
          is_focus?: boolean
          progress?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
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
          created_at: string
          updated_at: string
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
          created_at?: string
          updated_at?: string
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
          created_at?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: 'active' | 'completed' | 'archived'
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

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type GraphInsert = Database['public']['Tables']['graphs']['Insert']
export type NodeInsert = Database['public']['Tables']['nodes']['Insert']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type GraphUpdate = Database['public']['Tables']['graphs']['Update']
export type NodeUpdate = Database['public']['Tables']['nodes']['Update']
export type LinkUpdate = Database['public']['Tables']['links']['Update']
export type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update']
