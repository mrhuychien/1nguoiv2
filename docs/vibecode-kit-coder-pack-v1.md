# ═══════════════════════════════════════════════════════════════════════════════
#                              🔧 CODER PACK
#                         VIBECODE KIT MODULE
#                      1NGUOI.COM Framework Integration
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 HƯỚNG DẪN SỬ DỤNG:
#
#  1. Copy TOÀN BỘ file này → Paste vào Claude Code / Cursor
#  2. AI sẽ hỏi nơi lưu project → Trả lời đường dẫn existing project
#  3. AI sẽ tích hợp vào project 1nguoi.com đã có
#
#  ⚠️ QUAN TRỌNG:
#  - File này TÍCH HỢP vào project 1nguoi.com đã có sẵn
#  - KHÔNG tạo project mới
#  - Đảm bảo đã có: Supabase setup, Project Hub, Auth system
#
# ═══════════════════════════════════════════════════════════════════════════════

---

## 🎯 MODULE INFO

```yaml
Module: Vibecode Kit
Version: 1.0.0
Description: AI-powered product design tool với 6-step wizard
Entry Point: /projects/[id]/vibecode
Dependencies: Claude API (shared với Brainstorm4)
Parent: Project Hub
```

---

## 📁 FILE STRUCTURE

```
app/
├── projects/
│   └── [id]/
│       └── vibecode/
│           ├── page.tsx                 # Main Vibecode page
│           └── layout.tsx               # Layout với breadcrumb
│
├── api/
│   └── vibecode/
│       ├── chat/route.ts                # AI chat streaming
│       ├── generate/route.ts            # Generate artifacts
│       └── artifacts/route.ts           # CRUD artifacts
│
components/
├── vibecode/
│   ├── vibecode-wizard.tsx              # Main wizard container
│   ├── step-indicator.tsx               # Progress steps UI
│   ├── steps/
│   │   ├── vision-step.tsx              # Step 1: Vision input
│   │   ├── context-step.tsx             # Step 2: Context chat
│   │   ├── blueprint-step.tsx           # Step 3: Blueprint review
│   │   ├── contract-step.tsx            # Step 4: Contract confirm
│   │   ├── build-step.tsx               # Step 5: Coder Pack
│   │   └── refine-step.tsx              # Step 6: Refine
│   ├── chat/
│   │   ├── chat-interface.tsx           # Chat UI
│   │   ├── chat-message.tsx             # Single message
│   │   └── chat-input.tsx               # Input with send
│   ├── artifacts/
│   │   ├── artifact-viewer.tsx          # Markdown/code viewer
│   │   ├── artifact-list.tsx            # List of artifacts
│   │   └── artifact-actions.tsx         # Download/copy buttons
│   └── index.ts                         # Exports
│
lib/
├── stores/
│   └── vibecode-store.ts                # Zustand store
├── services/
│   └── vibecode-ai.ts                   # AI service functions
└── types/
    └── vibecode.ts                      # TypeScript types
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 1: DATABASE MIGRATION
# ═══════════════════════════════════════════════════════════════════════════════

## 1.1 Supabase Migration SQL

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- VIBECODE KIT TABLES
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Vibecode Sessions (mỗi lần dùng Vibecode Kit cho 1 project)
CREATE TABLE public.vibecode_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 6),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    vision_text TEXT,
    context_data JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id) -- Mỗi project chỉ có 1 active session
);

-- Vibecode Artifacts (Blueprint, Contract, Coder Pack)
CREATE TABLE public.vibecode_artifacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.vibecode_sessions(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('blueprint', 'contract', 'coder_pack')),
    version INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    metadata JSONB DEFAULT '{}', -- Extra data like file list, etc
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibecode Chat Messages
CREATE TABLE public.vibecode_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.vibecode_sessions(id) ON DELETE CASCADE NOT NULL,
    step INTEGER NOT NULL CHECK (step >= 1 AND step <= 6),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For tool calls, artifacts, etc
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vibecode_sessions_project ON public.vibecode_sessions(project_id);
CREATE INDEX idx_vibecode_sessions_user ON public.vibecode_sessions(user_id);
CREATE INDEX idx_vibecode_artifacts_session ON public.vibecode_artifacts(session_id);
CREATE INDEX idx_vibecode_artifacts_project ON public.vibecode_artifacts(project_id);
CREATE INDEX idx_vibecode_artifacts_type ON public.vibecode_artifacts(type);
CREATE INDEX idx_vibecode_messages_session ON public.vibecode_messages(session_id);
CREATE INDEX idx_vibecode_messages_step ON public.vibecode_messages(step);

-- RLS Policies
ALTER TABLE public.vibecode_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibecode_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibecode_messages ENABLE ROW LEVEL SECURITY;

-- Sessions: User can only access their own
CREATE POLICY "Users can view own sessions" ON public.vibecode_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.vibecode_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.vibecode_sessions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.vibecode_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Artifacts: Access through session ownership
CREATE POLICY "Users can view own artifacts" ON public.vibecode_artifacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vibecode_sessions 
            WHERE id = vibecode_artifacts.session_id 
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own artifacts" ON public.vibecode_artifacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vibecode_sessions 
            WHERE id = vibecode_artifacts.session_id 
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own artifacts" ON public.vibecode_artifacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vibecode_sessions 
            WHERE id = vibecode_artifacts.session_id 
            AND user_id = auth.uid()
        )
    );

-- Messages: Access through session ownership
CREATE POLICY "Users can view own messages" ON public.vibecode_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vibecode_sessions 
            WHERE id = vibecode_messages.session_id 
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert own messages" ON public.vibecode_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vibecode_sessions 
            WHERE id = vibecode_messages.session_id 
            AND user_id = auth.uid()
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_vibecode_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vibecode_sessions_updated_at
    BEFORE UPDATE ON public.vibecode_sessions
    FOR EACH ROW EXECUTE FUNCTION update_vibecode_updated_at();

CREATE TRIGGER vibecode_artifacts_updated_at
    BEFORE UPDATE ON public.vibecode_artifacts
    FOR EACH ROW EXECUTE FUNCTION update_vibecode_updated_at();
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 2: TYPESCRIPT TYPES
# ═══════════════════════════════════════════════════════════════════════════════

## 2.1 File: lib/types/vibecode.ts

```typescript
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
  metadata: MessageMetadata
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
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 3: ZUSTAND STORE
# ═══════════════════════════════════════════════════════════════════════════════

## 3.1 File: lib/stores/vibecode-store.ts

```typescript
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type {
  VibeCodeSession,
  VibeCodeArtifact,
  VibeCodeMessage,
  VibeCodeStep,
  ArtifactType,
  ContextData,
} from '@/lib/types/vibecode'

interface VibeCodeStore {
  // State
  session: VibeCodeSession | null
  artifacts: VibeCodeArtifact[]
  messages: VibeCodeMessage[]
  currentStep: VibeCodeStep
  isLoading: boolean
  isGenerating: boolean
  error: string | null

  // Session actions
  initSession: (projectId: string, userId: string) => Promise<void>
  loadSession: (projectId: string) => Promise<void>
  updateSession: (data: Partial<VibeCodeSession>) => Promise<void>
  
  // Step actions
  setStep: (step: VibeCodeStep) => void
  nextStep: () => Promise<void>
  prevStep: () => void

  // Message actions
  addMessage: (message: Omit<VibeCodeMessage, 'id' | 'created_at'>) => Promise<void>
  loadMessages: (step?: VibeCodeStep) => Promise<void>

  // Artifact actions
  loadArtifacts: () => Promise<void>
  saveArtifact: (artifact: Omit<VibeCodeArtifact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  approveArtifact: (id: string) => Promise<void>
  getArtifactByType: (type: ArtifactType) => VibeCodeArtifact | undefined

  // Context actions
  updateContext: (data: Partial<ContextData>) => Promise<void>
  setVision: (text: string) => Promise<void>

  // UI actions
  setLoading: (loading: boolean) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  session: null,
  artifacts: [],
  messages: [],
  currentStep: 1 as VibeCodeStep,
  isLoading: false,
  isGenerating: false,
  error: null,
}

export const useVibeCodeStore = create<VibeCodeStore>((set, get) => ({
  ...initialState,

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  initSession: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    try {
      // Check if session already exists
      const { data: existing } = await supabase
        .from('vibecode_sessions')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (existing) {
        set({ 
          session: existing, 
          currentStep: existing.current_step,
          isLoading: false 
        })
        await get().loadArtifacts()
        await get().loadMessages()
        return
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('vibecode_sessions')
        .insert({
          project_id: projectId,
          user_id: userId,
          current_step: 1,
          status: 'in_progress',
          context_data: {},
        })
        .select()
        .single()

      if (error) throw error

      set({ session: newSession, currentStep: 1, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadSession: async (projectId: string) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('vibecode_sessions')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        set({ 
          session: data, 
          currentStep: data.current_step,
          isLoading: false 
        })
        await get().loadArtifacts()
        await get().loadMessages()
      } else {
        set({ session: null, isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateSession: async (data: Partial<VibeCodeSession>) => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('vibecode_sessions')
        .update(data)
        .eq('id', session.id)

      if (error) throw error

      set({ session: { ...session, ...data } })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setStep: (step: VibeCodeStep) => {
    set({ currentStep: step })
  },

  nextStep: async () => {
    const { currentStep, session } = get()
    if (currentStep >= 6 || !session) return

    const nextStep = (currentStep + 1) as VibeCodeStep
    
    await get().updateSession({ current_step: nextStep })
    set({ currentStep: nextStep })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep <= 1) return
    
    set({ currentStep: (currentStep - 1) as VibeCodeStep })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  addMessage: async (message) => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('vibecode_messages')
        .insert({
          session_id: session.id,
          ...message,
        })
        .select()
        .single()

      if (error) throw error

      set({ messages: [...get().messages, data] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  loadMessages: async (step?: VibeCodeStep) => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      let query = supabase
        .from('vibecode_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })

      if (step) {
        query = query.eq('step', step)
      }

      const { data, error } = await query

      if (error) throw error

      set({ messages: data || [] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARTIFACT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  loadArtifacts: async () => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('vibecode_artifacts')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ artifacts: data || [] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  saveArtifact: async (artifact) => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('vibecode_artifacts')
        .insert(artifact)
        .select()
        .single()

      if (error) throw error

      set({ artifacts: [data, ...get().artifacts] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  approveArtifact: async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('vibecode_artifacts')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString() 
        })
        .eq('id', id)

      if (error) throw error

      set({
        artifacts: get().artifacts.map((a) =>
          a.id === id ? { ...a, status: 'approved', approved_at: new Date().toISOString() } : a
        ),
      })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  getArtifactByType: (type: ArtifactType) => {
    return get().artifacts.find((a) => a.type === type && a.status !== 'archived')
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  updateContext: async (data: Partial<ContextData>) => {
    const { session } = get()
    if (!session) return

    const newContext = { ...session.context_data, ...data }
    await get().updateSession({ context_data: newContext })
  },

  setVision: async (text: string) => {
    await get().updateSession({ vision_text: text })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UI ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setGenerating: (generating: boolean) => set({ isGenerating: generating }),
  setError: (error: string | null) => set({ error }),
  reset: () => set(initialState),
}))
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 4: AI SERVICE
# ═══════════════════════════════════════════════════════════════════════════════

## 4.1 File: lib/services/vibecode-ai.ts

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// VIBECODE AI SERVICE
// Shared with Brainstorm4 module
// ═══════════════════════════════════════════════════════════════════════════

import type { 
  VibeCodeStep, 
  ArtifactType, 
  ContextData,
  VibeCodeMessage 
} from '@/lib/types/vibecode'

// System prompts for each step
export const STEP_PROMPTS: Record<VibeCodeStep, string> = {
  1: `Bạn là Kiến trúc sư AI trong hệ thống Vibecode Kit v4.0.

BƯỚC HIỆN TẠI: Vision (Bước 1/6)

MỤC TIÊU: Hiểu rõ vision của người dùng về sản phẩm họ muốn xây dựng.

HƯỚNG DẪN:
- Đọc kỹ vision của người dùng
- Xác nhận lại những điểm quan trọng
- Hỏi thêm nếu còn mơ hồ về: mục tiêu, đối tượng users, vấn đề cần giải quyết
- Khi đã rõ ràng, tổng kết vision và hỏi người dùng xác nhận để chuyển sang bước tiếp theo

TONE: Chuyên nghiệp, thân thiện, hỗ trợ. Dùng tiếng Việt.`,

  2: `Bạn là Kiến trúc sư AI trong hệ thống Vibecode Kit v4.0.

BƯỚC HIỆN TẠI: Context (Bước 2/6)

MỤC TIÊU: Thu thập đầy đủ thông tin để thiết kế sản phẩm.

CẦN THU THẬP:
1. Tech stack mong muốn (hoặc đề xuất phù hợp)
2. Timeline/deadline
3. Constraints (ngân sách, kỹ năng, resources)
4. Reference/inspiration (apps, websites tương tự)
5. Features ưu tiên cho MVP
6. Target users chi tiết

HƯỚNG DẪN:
- Hỏi từng nhóm thông tin một cách tự nhiên
- Đề xuất nếu người dùng không chắc chắn
- Tổng kết context khi đã đủ thông tin
- Output JSON context_data khi hoàn thành

TONE: Chuyên nghiệp, hỗ trợ ra quyết định. Dùng tiếng Việt.`,

  3: `Bạn là Kiến trúc sư AI trong hệ thống Vibecode Kit v4.0.

BƯỚC HIỆN TẠI: Blueprint (Bước 3/6)

MỤC TIÊU: Tạo bản thiết kế chi tiết cho sản phẩm.

BLUEPRINT BAO GỒM:
1. Project Overview
2. Tech Stack & Architecture
3. Database Schema
4. File Structure
5. UI/UX Wireframes (mô tả text)
6. API Routes
7. Components Breakdown
8. Design System (colors, typography)
9. Timeline & Milestones

FORMAT: Markdown với headers rõ ràng, code blocks cho schemas/structures.

HƯỚNG DẪN:
- Dựa vào Vision và Context đã thu thập
- Thiết kế phù hợp với constraints
- Giải thích các quyết định thiết kế
- Sẵn sàng điều chỉnh theo feedback

TONE: Chi tiết, kỹ thuật nhưng dễ hiểu. Dùng tiếng Việt.`,

  4: `Bạn là Kiến trúc sư AI trong hệ thống Vibecode Kit v4.0.

BƯỚC HIỆN TẠI: Contract (Bước 4/6)

MỤC TIÊU: Tạo hợp đồng rõ ràng về scope và deliverables.

CONTRACT BAO GỒM:
1. Các bên tham gia (Chủ nhà, Kiến trúc sư, Thợ xây)
2. Mục tiêu dự án
3. Deliverables chi tiết
4. Timeline
5. NOT INCLUDED (những gì không làm)
6. Acceptance Criteria
7. Constraints & Rules
8. Thỏa thuận cam kết

FORMAT: Markdown với checkboxes, tables, và visual boxes.

HƯỚNG DẪN:
- Dựa vào Blueprint đã approve
- Liệt kê rõ ràng scope
- Đặt kỳ vọng đúng
- Yêu cầu CONFIRM trước khi tiếp tục

TONE: Chính thức, rõ ràng, chuyên nghiệp. Dùng tiếng Việt.`,

  5: `Bạn là Kiến trúc sư AI trong hệ thống Vibecode Kit v4.0.

BƯỚC HIỆN TẠI: Build - Coder Pack (Bước 5/6)

MỤC TIÊU: Tạo Coder Pack hoàn chỉnh để Thợ xây implement.

CODER PACK BAO GỒM:
1. Header với hướng dẫn sử dụng
2. Vai trò của Thợ xây
3. Project Info
4. Tech Stack
5. Design System
6. File Structure
7. Từng file code chi tiết với comments
8. Database migrations
9. Hướng dẫn chạy project

FORMAT: Markdown với code blocks đầy đủ, copy-paste ready.

HƯỚNG DẪN:
- Code hoàn chỉnh, chạy được
- Comments giải thích
- Follow best practices
- Modular, maintainable

TONE: Kỹ thuật, chi tiết, chuẩn mực. Code tiếng Anh, comments tiếng Việt.`,

  6: `Bạn là Kiến trúc sư AI trong hệ thống Vibecode Kit v4.0.

BƯỚC HIỆN TẠI: Refine (Bước 6/6)

MỤC TIÊU: Hỗ trợ review, test, và tinh chỉnh sản phẩm.

HƯỚNG DẪN:
- Lắng nghe feedback từ người dùng
- Giải đáp thắc mắc về code
- Đề xuất fixes cho bugs
- Hỗ trợ minor adjustments
- KHÔNG thay đổi lớn (quay lại Blueprint nếu cần)

PHẠM VI REFINE:
- Bug fixes
- UI tweaks
- Copy/text changes
- Small feature adjustments
- Performance tips

TONE: Hỗ trợ, kiên nhẫn, giải quyết vấn đề. Dùng tiếng Việt.`,
}

// Build context string for AI
export function buildContextString(
  vision: string | null,
  contextData: ContextData,
  messages: VibeCodeMessage[]
): string {
  let context = ''

  if (vision) {
    context += `## Vision\n${vision}\n\n`
  }

  if (Object.keys(contextData).length > 0) {
    context += `## Context Data\n${JSON.stringify(contextData, null, 2)}\n\n`
  }

  if (messages.length > 0) {
    context += `## Conversation History\n`
    messages.forEach((m) => {
      context += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n\n`
    })
  }

  return context
}

// Format messages for Claude API
export function formatMessagesForAPI(
  systemPrompt: string,
  context: string,
  messages: VibeCodeMessage[],
  newMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const formattedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  // Add context as first user message if exists
  if (context) {
    formattedMessages.push({
      role: 'user',
      content: `[CONTEXT]\n${context}\n[/CONTEXT]`,
    })
    formattedMessages.push({
      role: 'assistant',
      content: 'Tôi đã đọc context. Hãy tiếp tục.',
    })
  }

  // Add conversation history
  messages.forEach((m) => {
    if (m.role === 'user' || m.role === 'assistant') {
      formattedMessages.push({
        role: m.role,
        content: m.content,
      })
    }
  })

  // Add new message
  formattedMessages.push({
    role: 'user',
    content: newMessage,
  })

  return formattedMessages
}

// Extract artifact from AI response
export function extractArtifactFromResponse(
  response: string,
  type: ArtifactType
): { title: string; content: string } | null {
  // Look for artifact markers
  const artifactRegex = /```(?:markdown|md)?\n([\s\S]*?)```/g
  const matches = response.matchAll(artifactRegex)

  for (const match of matches) {
    const content = match[1].trim()
    
    // Check if this looks like the artifact type we want
    if (type === 'blueprint' && content.includes('# ') && content.includes('Tech Stack')) {
      return {
        title: `Blueprint v1`,
        content,
      }
    }
    
    if (type === 'contract' && content.includes('CONTRACT') || content.includes('DELIVERABLES')) {
      return {
        title: `Contract v1`,
        content,
      }
    }
    
    if (type === 'coder_pack' && content.includes('CODER PACK')) {
      return {
        title: `Coder Pack v1`,
        content,
      }
    }
  }

  // If no specific artifact found, return the whole response for manual review
  return null
}

// Detect if response contains actionable artifact
export function detectArtifactInResponse(response: string): ArtifactType | null {
  const lower = response.toLowerCase()
  
  if (lower.includes('blueprint') && lower.includes('```')) {
    return 'blueprint'
  }
  
  if (lower.includes('contract') && lower.includes('deliverables')) {
    return 'contract'
  }
  
  if (lower.includes('coder pack') || lower.includes('coderpack')) {
    return 'coder_pack'
  }
  
  return null
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 5: API ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

## 5.1 File: app/api/vibecode/chat/route.ts

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  STEP_PROMPTS, 
  buildContextString, 
  formatMessagesForAPI 
} from '@/lib/services/vibecode-ai'
import type { VibeCodeStep } from '@/lib/types/vibecode'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { session_id, step, message } = await request.json()

    if (!session_id || !step || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient()

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('vibecode_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get previous messages for this session
    const { data: messages } = await supabase
      .from('vibecode_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    // Build context
    const context = buildContextString(
      session.vision_text,
      session.context_data,
      messages || []
    )

    // Format messages for API
    const systemPrompt = STEP_PROMPTS[step as VibeCodeStep]
    const apiMessages = formatMessagesForAPI(
      systemPrompt,
      context,
      messages || [],
      message
    )

    // Call Claude API (streaming)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        messages: apiMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

## 5.2 File: app/api/vibecode/generate/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { STEP_PROMPTS, buildContextString } from '@/lib/services/vibecode-ai'
import type { ArtifactType } from '@/lib/types/vibecode'

const GENERATE_PROMPTS: Record<ArtifactType, string> = {
  blueprint: `Dựa trên Vision và Context đã thu thập, hãy tạo một BLUEPRINT hoàn chỉnh bao gồm:

1. ## Project Overview
2. ## Tech Stack & Architecture  
3. ## Database Schema (với SQL)
4. ## File Structure (tree format)
5. ## UI/UX Description
6. ## API Routes
7. ## Components Breakdown
8. ## Design System
9. ## Timeline & Milestones

Output dưới dạng Markdown hoàn chỉnh, chuyên nghiệp.`,

  contract: `Dựa trên Blueprint đã được approve, hãy tạo CONTRACT hoàn chỉnh bao gồm:

1. ## CÁC BÊN THAM GIA
2. ## MỤC TIÊU DỰ ÁN
3. ## DELIVERABLES (chi tiết từng item)
4. ## TIMELINE
5. ## NOT INCLUDED (quan trọng!)
6. ## ACCEPTANCE CRITERIA
7. ## CONSTRAINTS & RULES
8. ## THỎA THUẬN

Kết thúc bằng box yêu cầu CONFIRM.`,

  coder_pack: `Dựa trên Blueprint và Contract đã approve, hãy tạo CODER PACK hoàn chỉnh:

1. Header với hướng dẫn sử dụng
2. Vai trò THỢ XÂY và QUY TẮC
3. Project Info (yaml)
4. Tech Stack (yaml)
5. Design System (colors, typography)
6. TỪNG FILE CODE đầy đủ với:
   - File path
   - Code hoàn chỉnh trong code block
   - Comments giải thích
7. Database migrations
8. Hướng dẫn chạy

Code phải CHẠY ĐƯỢC, copy-paste ready.`,
}

export async function POST(request: NextRequest) {
  try {
    const { session_id, type } = await request.json()

    if (!session_id || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('vibecode_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get existing artifacts for context
    const { data: artifacts } = await supabase
      .from('vibecode_artifacts')
      .select('*')
      .eq('session_id', session_id)
      .in('status', ['draft', 'approved'])

    // Get messages
    const { data: messages } = await supabase
      .from('vibecode_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    // Build full context
    let context = buildContextString(session.vision_text, session.context_data, messages || [])

    // Add existing artifacts to context
    if (artifacts && artifacts.length > 0) {
      context += '\n## Existing Artifacts\n'
      artifacts.forEach((a) => {
        context += `### ${a.type} (${a.status})\n${a.content}\n\n`
      })
    }

    // Generate artifact
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16384, // Larger for coder pack
        system: STEP_PROMPTS[type === 'blueprint' ? 3 : type === 'contract' ? 4 : 5],
        messages: [
          {
            role: 'user',
            content: `${context}\n\n---\n\n${GENERATE_PROMPTS[type as ArtifactType]}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0]?.text || ''

    // Get version number
    const existingOfType = artifacts?.filter((a) => a.type === type) || []
    const version = existingOfType.length + 1

    // Save artifact
    const { data: artifact, error: artifactError } = await supabase
      .from('vibecode_artifacts')
      .insert({
        session_id,
        project_id: session.project_id,
        type,
        version,
        title: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} v${version}`,
        content,
        status: 'draft',
        metadata: {
          generated_at: new Date().toISOString(),
          model: 'claude-sonnet-4-20250514',
        },
      })
      .select()
      .single()

    if (artifactError) {
      console.error('Save artifact error:', artifactError)
      return NextResponse.json({ error: 'Failed to save artifact' }, { status: 500 })
    }

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 5.3 File: app/api/vibecode/artifacts/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: List artifacts for a session
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const session_id = searchParams.get('session_id')
  const project_id = searchParams.get('project_id')

  if (!session_id && !project_id) {
    return NextResponse.json({ error: 'Missing session_id or project_id' }, { status: 400 })
  }

  const supabase = createClient()

  let query = supabase.from('vibecode_artifacts').select('*')

  if (session_id) {
    query = query.eq('session_id', session_id)
  } else if (project_id) {
    query = query.eq('project_id', project_id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ artifacts: data })
}

// PATCH: Update artifact (approve, archive, etc)
export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing artifact id' }, { status: 400 })
  }

  const supabase = createClient()

  // If approving, set approved_at
  if (updates.status === 'approved') {
    updates.approved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('vibecode_artifacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ artifact: data })
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 6: UI COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 6.1 File: components/vibecode/step-indicator.tsx

```typescript
'use client'

import { cn } from '@/lib/utils'
import { VIBECODE_STEPS, type VibeCodeStep } from '@/lib/types/vibecode'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: VibeCodeStep
  onStepClick?: (step: VibeCodeStep) => void
  completedSteps?: VibeCodeStep[]
}

export function StepIndicator({ 
  currentStep, 
  onStepClick,
  completedSteps = [] 
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
      {VIBECODE_STEPS.map((step, index) => {
        const isActive = step.step === currentStep
        const isCompleted = completedSteps.includes(step.step as VibeCodeStep)
        const isPast = step.step < currentStep

        return (
          <div key={step.step} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              onClick={() => onStepClick?.(step.step as VibeCodeStep)}
              disabled={!onStepClick || step.step > currentStep}
              className={cn(
                'relative flex flex-col items-center group',
                onStepClick && step.step <= currentStep && 'cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                  isActive && 'bg-cyan text-background ring-4 ring-cyan/30',
                  isCompleted && 'bg-green text-white',
                  isPast && !isCompleted && 'bg-white/20 text-white',
                  !isActive && !isCompleted && !isPast && 'bg-white/10 text-gray-500'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              
              {/* Label */}
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    'text-xs font-medium',
                    isActive && 'text-cyan',
                    isCompleted && 'text-green',
                    !isActive && !isCompleted && 'text-gray-500'
                  )}
                >
                  {step.name}
                </div>
                <div className="text-[10px] text-gray-600 hidden md:block max-w-[80px]">
                  {step.description}
                </div>
              </div>
            </button>

            {/* Connector line */}
            {index < VIBECODE_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  step.step < currentStep ? 'bg-cyan/50' : 'bg-white/10'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

## 6.2 File: components/vibecode/chat/chat-message.tsx

```typescript
'use client'

import { cn } from '@/lib/utils'
import type { VibeCodeMessage } from '@/lib/types/vibecode'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ChatMessageProps {
  message: VibeCodeMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-white/5 rounded-full text-xs text-gray-400">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3', isUser && 'justify-end')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-sm shrink-0">
          🤖
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl p-4',
          isUser
            ? 'bg-cyan/20 rounded-tr-none'
            : 'bg-white/5 rounded-tl-none'
        )}
      >
        <ReactMarkdown
          className="prose prose-invert prose-sm max-w-none"
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={cn('bg-white/10 px-1 rounded', className)} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center text-sm shrink-0">
          👤
        </div>
      )}
    </div>
  )
}
```

## 6.3 File: components/vibecode/chat/chat-input.tsx

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ 
  onSend, 
  isLoading = false, 
  placeholder = 'Nhập tin nhắn...',
  disabled = false 
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim() || isLoading || disabled) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all disabled:opacity-50"
        />
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading || disabled}
        className="shrink-0"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </div>
  )
}
```

## 6.4 File: components/vibecode/chat/chat-interface.tsx

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import type { VibeCodeStep } from '@/lib/types/vibecode'
import { Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  step: VibeCodeStep
  onSendMessage: (message: string) => Promise<void>
}

export function ChatInterface({ step, onSendMessage }: ChatInterfaceProps) {
  const { messages, isLoading, isGenerating } = useVibeCodeStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter messages for current step
  const stepMessages = messages.filter((m) => m.step === step)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [stepMessages])

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {stepMessages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Bắt đầu cuộc trò chuyện...</p>
          </div>
        )}
        
        {stepMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {(isLoading || isGenerating) && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-none p-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {isGenerating ? 'Đang tạo artifact...' : 'Đang suy nghĩ...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/10">
        <ChatInput
          onSend={onSendMessage}
          isLoading={isLoading || isGenerating}
          placeholder={`Nhập tin nhắn (Step ${step})...`}
        />
      </div>
    </div>
  )
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#              TIẾP TỤC TRONG CODER PACK V2...
# ═══════════════════════════════════════════════════════════════════════════════

**File này đã dài, các phần còn lại sẽ trong Coder Pack v2:**

## CÒN LẠI:
- 6.5: artifact-viewer.tsx
- 6.6: artifact-list.tsx  
- 6.7: artifact-actions.tsx
- 6.8-6.13: Các step components (vision, context, blueprint, contract, build, refine)
- 6.14: vibecode-wizard.tsx (main container)
- 6.15: index.ts exports

## STEP 7: PAGE & LAYOUT
- 7.1: app/projects/[id]/vibecode/page.tsx
- 7.2: app/projects/[id]/vibecode/layout.tsx

## STEP 8: INTEGRATION
- 8.1: Update Project Hub dropdown
- 8.2: Update project types
- 8.3: Add menu item "Sử dụng Vibecode Kit"

---

**Reply "tiếp" để nhận CODER PACK v2!**

---

# END OF CODER PACK v1
## VIBECODE KIT MODULE
## 1NGUOI.COM Framework
