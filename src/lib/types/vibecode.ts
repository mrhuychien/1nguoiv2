// ═══════════════════════════════════════════════════════════════════════════
// VIBECODE KIT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type VibeCodeStep = 1 | 2 | 3 | 4 | 5 | 6

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export type ArtifactType = 'blueprint' | 'contract' | 'coder_pack'

export type ArtifactStatus = 'draft' | 'approved' | 'archived'

export type MessageRole = 'user' | 'assistant' | 'system'

// Step metadata
export const VIBECODE_STEPS = [
  { step: 1, name: 'Vision', icon: '👁️', description: 'Mô tả ý tưởng sản phẩm' },
  { step: 2, name: 'Context', icon: '📋', description: 'Thu thập thông tin chi tiết' },
  { step: 3, name: 'Blueprint', icon: '📐', description: 'Xem và duyệt bản thiết kế' },
  { step: 4, name: 'Contract', icon: '📜', description: 'Xác nhận scope & deliverables' },
  { step: 5, name: 'Build', icon: '🔧', description: 'Tạo Coder Pack' },
  { step: 6, name: 'Refine', icon: '✨', description: 'Review và tinh chỉnh' },
] as const

// Database types
export interface VibeCodeSession {
  id: string
  project_id: string
  user_id: string
  current_step: VibeCodeStep
  status: SessionStatus
  vision_text: string | null
  context_data: ContextData
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface VibeCodeArtifact {
  id: string
  session_id: string
  project_id: string
  type: ArtifactType
  version: number
  title: string
  content: string
  metadata: ArtifactMetadata
  status: ArtifactStatus
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface VibeCodeMessage {
  id: string
  session_id: string
  step: VibeCodeStep
  role: MessageRole
  content: string
  metadata?: MessageMetadata
  created_at: string
}

// JSON types
export interface ContextData {
  tech_stack?: string[]
  deadline?: string
  references?: string[]
  constraints?: string[]
  target_users?: string
  features?: string[]
  [key: string]: unknown
}

export interface ArtifactMetadata {
  files?: string[]
  word_count?: number
  estimated_time?: string
  tech_stack?: string[]
  [key: string]: unknown
}

export interface MessageMetadata {
  artifact_id?: string
  tool_call?: string
  [key: string]: unknown
}

// API types
export interface ChatRequest {
  session_id: string
  step: VibeCodeStep
  message: string
  context?: Record<string, unknown>
}

export interface ChatResponse {
  message: string
  artifact?: Partial<VibeCodeArtifact>
  next_step?: VibeCodeStep
  completed?: boolean
}

export interface GenerateRequest {
  session_id: string
  type: ArtifactType
  context: Record<string, unknown>
}

// UI State types
export interface VibeCodeState {
  session: VibeCodeSession | null
  artifacts: VibeCodeArtifact[]
  messages: VibeCodeMessage[]
  currentStep: VibeCodeStep
  isLoading: boolean
  isGenerating: boolean
  error: string | null
}
