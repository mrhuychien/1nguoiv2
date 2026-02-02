import type {
  ProjectTemplate,
  TaskTemplate,
  TemplateId,
  ProjectTask,
} from "@/types/zen";

// ============================================
// WEB APP / SAAS TEMPLATE
// ============================================
const webAppTasks: TaskTemplate[] = [
  {
    id: "wa-1",
    phase: 1,
    title: "Nghiên cứu & Xác định vấn đề",
    emoji: "🔍",
    zone: "designing",
    estimatedMinutes: 90,
  },
  {
    id: "wa-2",
    phase: 2,
    title: "Liệt kê tính năng chính (Tối đa 3)",
    emoji: "📝",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "wa-3",
    phase: 3,
    title: "Vẽ wireframe các màn hình chính",
    emoji: "🎨",
    zone: "designing",
    estimatedMinutes: 90,
  },
  {
    id: "wa-4",
    phase: 4,
    title: "Khởi tạo dự án & Tech Stack",
    emoji: "⚙️",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "wa-5",
    phase: 5,
    title: "Thiết kế cấu trúc Database",
    emoji: "🗄️",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "wa-6",
    phase: 6,
    title: "Xây dựng Auth & Hệ thống User",
    emoji: "🔐",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "wa-7",
    phase: 7,
    title: "Xây dựng Tính năng #1 (Core)",
    emoji: "⭐",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "wa-8",
    phase: 8,
    title: "Xây dựng Tính năng #2",
    emoji: "⭐",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "wa-9",
    phase: 9,
    title: "Xây dựng Tính năng #3",
    emoji: "⭐",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "wa-10",
    phase: 10,
    title: "Hoàn thiện UI & UX",
    emoji: "🎨",
    zone: "building",
    estimatedMinutes: 90,
  },
  {
    id: "wa-11",
    phase: 11,
    title: "Test & Sửa lỗi",
    emoji: "🧪",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "wa-12",
    phase: 12,
    title: "Triển khai MVP",
    emoji: "🚀",
    zone: "building",
    estimatedMinutes: 60,
  },
];

// ============================================
// LANDING PAGE TEMPLATE
// ============================================
const landingPageTasks: TaskTemplate[] = [
  {
    id: "lp-1",
    phase: 1,
    title: "Xác định Mục tiêu & CTA",
    emoji: "🎯",
    zone: "designing",
    estimatedMinutes: 45,
  },
  {
    id: "lp-2",
    phase: 2,
    title: "Viết nội dung & Tiêu đề",
    emoji: "📝",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "lp-3",
    phase: 3,
    title: "Thiết kế Layout & Sections",
    emoji: "🎨",
    zone: "designing",
    estimatedMinutes: 90,
  },
  {
    id: "lp-4",
    phase: 4,
    title: "Khởi tạo dự án",
    emoji: "⚙️",
    zone: "building",
    estimatedMinutes: 30,
  },
  {
    id: "lp-5",
    phase: 5,
    title: "Xây dựng phần Hero",
    emoji: "🏗️",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "lp-6",
    phase: 6,
    title: "Xây dựng phần Tính năng/Lợi ích",
    emoji: "🏗️",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "lp-7",
    phase: 7,
    title: "Xây dựng phần Social Proof",
    emoji: "🏗️",
    zone: "building",
    estimatedMinutes: 45,
  },
  {
    id: "lp-8",
    phase: 8,
    title: "Xây dựng CTA & Footer",
    emoji: "🏗️",
    zone: "building",
    estimatedMinutes: 45,
  },
  {
    id: "lp-9",
    phase: 9,
    title: "Tối ưu Mobile Responsive",
    emoji: "📱",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "lp-10",
    phase: 10,
    title: "Triển khai & Cài Analytics",
    emoji: "🚀",
    zone: "building",
    estimatedMinutes: 30,
  },
];

// ============================================
// API / BACKEND SERVICE TEMPLATE
// ============================================
const apiServiceTasks: TaskTemplate[] = [
  {
    id: "api-1",
    phase: 1,
    title: "Định nghĩa Endpoints & Luồng dữ liệu",
    emoji: "📋",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "api-2",
    phase: 2,
    title: "Thiết kế Data Models",
    emoji: "📊",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "api-3",
    phase: 3,
    title: "Khởi tạo dự án & Config",
    emoji: "⚙️",
    zone: "building",
    estimatedMinutes: 45,
  },
  {
    id: "api-4",
    phase: 4,
    title: "Cài đặt Database",
    emoji: "🗄️",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "api-5",
    phase: 5,
    title: "Xây dựng Auth & Middleware",
    emoji: "🔐",
    zone: "building",
    estimatedMinutes: 90,
  },
  {
    id: "api-6",
    phase: 6,
    title: "Xây dựng CRUD Endpoints",
    emoji: "🛠️",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "api-7",
    phase: 7,
    title: "Xây dựng Business Logic",
    emoji: "🛠️",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "api-8",
    phase: 8,
    title: "Viết tài liệu API",
    emoji: "📝",
    zone: "building",
    estimatedMinutes: 45,
  },
  {
    id: "api-9",
    phase: 9,
    title: "Testing & Validation",
    emoji: "🧪",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "api-10",
    phase: 10,
    title: "Triển khai & Giám sát",
    emoji: "🚀",
    zone: "building",
    estimatedMinutes: 45,
  },
];

// ============================================
// MOBILE APP TEMPLATE
// ============================================
const mobileAppTasks: TaskTemplate[] = [
  {
    id: "ma-1",
    phase: 1,
    title: "Định nghĩa User Flow",
    emoji: "🔍",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "ma-2",
    phase: 2,
    title: "Thiết kế các màn hình chính",
    emoji: "🎨",
    zone: "designing",
    estimatedMinutes: 90,
  },
  {
    id: "ma-3",
    phase: 3,
    title: "Kiến trúc Component",
    emoji: "📐",
    zone: "designing",
    estimatedMinutes: 45,
  },
  {
    id: "ma-4",
    phase: 4,
    title: "Khởi tạo dự án & Navigation",
    emoji: "⚙️",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "ma-5",
    phase: 5,
    title: "Xây dựng Auth Flow",
    emoji: "🔐",
    zone: "building",
    estimatedMinutes: 90,
  },
  {
    id: "ma-6",
    phase: 6,
    title: "Xây dựng các màn hình chính",
    emoji: "📱",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "ma-7",
    phase: 7,
    title: "Tích hợp API",
    emoji: "🔗",
    zone: "building",
    estimatedMinutes: 90,
  },
  {
    id: "ma-8",
    phase: 8,
    title: "Local Storage & Chế độ Offline",
    emoji: "💾",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "ma-9",
    phase: 9,
    title: "Hoàn thiện & Animation",
    emoji: "✨",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "ma-10",
    phase: 10,
    title: "Build & Submit lên Store",
    emoji: "🚀",
    zone: "building",
    estimatedMinutes: 60,
  },
];

// ============================================
// CONTENT PROJECT TEMPLATE
// ============================================
const contentProjectTasks: TaskTemplate[] = [
  {
    id: "cp-1",
    phase: 1,
    title: "Xác định Đối tượng & Mục tiêu",
    emoji: "🎯",
    zone: "designing",
    estimatedMinutes: 45,
  },
  {
    id: "cp-2",
    phase: 2,
    title: "Tạo Outline nội dung",
    emoji: "📋",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "cp-3",
    phase: 3,
    title: "Nghiên cứu & Thu thập tài liệu",
    emoji: "🔍",
    zone: "designing",
    estimatedMinutes: 90,
  },
  {
    id: "cp-4",
    phase: 4,
    title: "Viết bản nháp - Phần 1",
    emoji: "✍️",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "cp-5",
    phase: 5,
    title: "Viết bản nháp - Phần 2",
    emoji: "✍️",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "cp-6",
    phase: 6,
    title: "Viết bản nháp - Phần 3",
    emoji: "✍️",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "cp-7",
    phase: 7,
    title: "Chỉnh sửa & Hoàn thiện",
    emoji: "✏️",
    zone: "building",
    estimatedMinutes: 90,
  },
  {
    id: "cp-8",
    phase: 8,
    title: "Thêm hình ảnh/Media",
    emoji: "🎨",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "cp-9",
    phase: 9,
    title: "Review lần cuối",
    emoji: "📝",
    zone: "building",
    estimatedMinutes: 45,
  },
  {
    id: "cp-10",
    phase: 10,
    title: "Xuất bản & Quảng bá",
    emoji: "🚀",
    zone: "building",
    estimatedMinutes: 30,
  },
];

// ============================================
// AI / AUTOMATION TOOL TEMPLATE
// ============================================
const aiAutomationTasks: TaskTemplate[] = [
  {
    id: "ai-1",
    phase: 1,
    title: "Xác định Use Case & Input/Output",
    emoji: "🎯",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "ai-2",
    phase: 2,
    title: "Thiết kế Prompt Templates",
    emoji: "📝",
    zone: "designing",
    estimatedMinutes: 60,
  },
  {
    id: "ai-3",
    phase: 3,
    title: "Vẽ Workflow & Xử lý Edge Cases",
    emoji: "🔄",
    zone: "designing",
    estimatedMinutes: 45,
  },
  {
    id: "ai-4",
    phase: 4,
    title: "Khởi tạo dự án & API Keys",
    emoji: "⚙️",
    zone: "building",
    estimatedMinutes: 30,
  },
  {
    id: "ai-5",
    phase: 5,
    title: "Xây dựng Core AI Logic",
    emoji: "🤖",
    zone: "building",
    estimatedMinutes: 120,
  },
  {
    id: "ai-6",
    phase: 6,
    title: "Xử lý Input",
    emoji: "🔗",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "ai-7",
    phase: 7,
    title: "Format Output",
    emoji: "📤",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "ai-8",
    phase: 8,
    title: "Xây dựng UI đơn giản",
    emoji: "🎨",
    zone: "building",
    estimatedMinutes: 90,
  },
  {
    id: "ai-9",
    phase: 9,
    title: "Test & Tối ưu Prompts",
    emoji: "🧪",
    zone: "building",
    estimatedMinutes: 60,
  },
  {
    id: "ai-10",
    phase: 10,
    title: "Triển khai",
    emoji: "🚀",
    zone: "building",
    estimatedMinutes: 30,
  },
];

// ============================================
// ALL TEMPLATES EXPORT
// ============================================
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "web-app",
    name: "Ứng dụng Web / SaaS",
    emoji: "🌐",
    description:
      "Ứng dụng web full-stack với auth, database và các tính năng chính",
    tasks: webAppTasks,
  },
  {
    id: "landing-page",
    name: "Landing Page",
    emoji: "📄",
    description: "Trang marketing với hero, tính năng, social proof và CTA",
    tasks: landingPageTasks,
  },
  {
    id: "api-service",
    name: "API / Backend",
    emoji: "🔌",
    description: "REST API với endpoints, auth và tài liệu",
    tasks: apiServiceTasks,
  },
  {
    id: "mobile-app",
    name: "Ứng dụng Mobile",
    emoji: "📱",
    description: "App iOS/Android với navigation, màn hình và tích hợp API",
    tasks: mobileAppTasks,
  },
  {
    id: "content-project",
    name: "Dự án Nội dung",
    emoji: "📚",
    description: "Blog, khóa học, tài liệu hoặc ebook",
    tasks: contentProjectTasks,
  },
  {
    id: "ai-automation",
    name: "AI / Tự động hóa",
    emoji: "🤖",
    description: "AI wrapper, script tự động hoặc chatbot",
    tasks: aiAutomationTasks,
  },
  {
    id: "blank",
    name: "Dự án Trống",
    emoji: "✨",
    description: "Bắt đầu từ đầu, không có tasks sẵn",
    tasks: [],
  },
];

// Helper function to get template by ID
export function getTemplateById(id: TemplateId): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}

// Helper to generate tasks for a project
export function generateTasksFromTemplate(
  projectId: string,
  templateId: TemplateId
): ProjectTask[] {
  const template = getTemplateById(templateId);
  if (!template) return [];

  return template.tasks.map((t) => ({
    id: `${projectId}-${t.id}`,
    projectId,
    phase: t.phase,
    title: t.title,
    emoji: t.emoji,
    zone: t.zone,
    estimatedMinutes: t.estimatedMinutes,
    status: "pending" as const,
    completedAt: null,
    timeSpentMinutes: 0,
    notes: "",
  }));
}

// Calculate total estimated time
export function getTemplateEstimatedTime(templateId: TemplateId): number {
  const template = getTemplateById(templateId);
  if (!template) return 0;
  return template.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
}

// Format minutes to hours
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
