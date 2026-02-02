// ═══════════════════════════════════════════════════════════════════════════
// VIBECODE AI SERVICE
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

// Generate prompts for artifacts
export const GENERATE_PROMPTS: Record<ArtifactType, string> = {
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

// Extract artifact from AI response
export function extractArtifactFromResponse(
  response: string,
  type: ArtifactType
): { title: string; content: string } | null {
  // Look for artifact markers
  const artifactRegex = /```(?:markdown|md)?\n([\s\S]*?)```/g
  const matches = Array.from(response.matchAll(artifactRegex))

  for (const match of matches) {
    const content = match[1].trim()

    // Check if this looks like the artifact type we want
    if (type === 'blueprint' && content.includes('# ') && content.includes('Tech Stack')) {
      return {
        title: `Blueprint v1`,
        content,
      }
    }

    if (type === 'contract' && (content.includes('CONTRACT') || content.includes('DELIVERABLES'))) {
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

  // If no specific artifact found, return null for manual review
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
