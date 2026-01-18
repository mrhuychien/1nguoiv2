# 📜 CONTRACT: 1NGUOI.COM - PHASE 1 MVP
## Vibecode Kit v4.0 - The Partnership Edition

---

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                         HỢP ĐỒNG DỰ ÁN                                   ║
║                      1NGUOI.COM - PHASE 1 MVP                            ║
║                                                                           ║
║                     Ngày: 18/01/2025                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 👥 CÁC BÊN THAM GIA

| Vai trò | Tên | Trách nhiệm |
|---------|-----|-------------|
| **Chủ nhà** | Nguyễn Huy Chiến | Quyết định business, review, approve |
| **Kiến trúc sư** | Claude (AI) | Thiết kế, đề xuất, tạo Blueprint |
| **Thợ xây** | Claude Code / Cursor | Implement code theo Blueprint |

---

## 🎯 MỤC TIÊU DỰ ÁN

> Xây dựng MVP cho nền tảng **1nguoi.com** - Framework platform để một người có thể phát triển doanh nghiệp của mình.

### Mục tiêu cụ thể:
1. Có mặt online với Landing Page chuyên nghiệp
2. Cung cấp công cụ Idea Graph để brainstorm
3. Cung cấp Project Hub để quản lý dự án
4. User có thể đăng ký/đăng nhập và lưu data
5. Theo dõi thời gian làm việc cơ bản

---

## ✅ DELIVERABLES

### Deliverable 1: Landing Page

| Item | Chi tiết |
|------|----------|
| **Mô tả** | Trang giới thiệu 1nguoi.com, thu hút users |
| **Sections** | 9 sections: Hero, Problem, Pillars, Tools, Personas, Build in Public, Pricing, FAQ, Final CTA |
| **Features** | Responsive, Dark theme, Animations on scroll, CTA buttons |
| **Output** | Single page tại route `/` |

### Deliverable 2: Idea Graph

| Item | Chi tiết |
|------|----------|
| **Mô tả** | Tool brainstorm visual kiểu mind-map |
| **Features** | Tạo/sửa/xóa nodes, Tạo links, 6 màu sắc, Zoom/Pan, Search, Keyboard shortcuts |
| **Data** | Sync với Supabase realtime |
| **Output** | Page tại route `/ideas` |

### Deliverable 3: Project Hub

| Item | Chi tiết |
|------|----------|
| **Mô tả** | Dashboard quản lý tất cả projects |
| **Features** | Focus Project (1), Active Projects (max 3), Daily Focus (3 tasks), Project CRUD, Task management, Progress tracking |
| **Views** | Dashboard overview, Project detail |
| **Output** | Pages tại `/dashboard`, `/projects/[id]` |

### Deliverable 4: Auth System

| Item | Chi tiết |
|------|----------|
| **Mô tả** | Hệ thống đăng ký/đăng nhập |
| **Methods** | Email + Password, Google OAuth |
| **Features** | Remember me, Forgot password, Email verification |
| **Output** | Pages tại `/login`, `/signup`, `/forgot-password` |

### Deliverable 5: Cloud Sync

| Item | Chi tiết |
|------|----------|
| **Mô tả** | Lưu trữ và đồng bộ data trên cloud |
| **Provider** | Supabase (PostgreSQL) |
| **Tables** | profiles, projects, phases, tasks, graphs, nodes, links, time_entries |
| **Security** | Row Level Security (RLS) |
| **Features** | Auto-save, Realtime sync |

### Deliverable 6: Time Tracking

| Item | Chi tiết |
|------|----------|
| **Mô tả** | Theo dõi thời gian làm việc cho projects |
| **Features** | Start/Stop/Pause timer, Track per project, Daily summary, Manual entry |
| **Output** | Component tích hợp trong Project Hub |

---

## 🛠️ TECH STACK

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CONFIRMED TECH STACK                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FRONTEND                                                               │
│  ├── Framework:      Next.js 14 (App Router)                           │
│  ├── Language:       TypeScript 5.x                                    │
│  ├── Styling:        Tailwind CSS 3.x                                  │
│  ├── UI Components:  Radix UI (primitives)                             │
│  ├── State:          Zustand 4.x                                       │
│  ├── Canvas:         React Flow 11.x (Idea Graph)                      │
│  ├── Animation:      Framer Motion 10.x                                │
│  ├── Icons:          Lucide React                                      │
│  ├── Forms:          React Hook Form + Zod                             │
│  └── Date:           date-fns                                          │
│                                                                         │
│  BACKEND                                                                │
│  ├── BaaS:           Supabase                                          │
│  ├── Database:       PostgreSQL 15.x (via Supabase)                    │
│  ├── Auth:           Supabase Auth (Email + Google OAuth)              │
│  ├── Storage:        Supabase Storage (if needed)                      │
│  └── Realtime:       Supabase Realtime                                 │
│                                                                         │
│  INFRASTRUCTURE                                                         │
│  ├── Hosting:        Vercel (Free tier)                                │
│  ├── Domain:         1nguoi.com (existing)                             │
│  └── Analytics:      Plausible (optional)                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN SPECIFICATIONS

### Colors

| Type | Name | Hex |
|------|------|-----|
| Primary | Cyan | `#00d4ff` |
| Secondary | Purple | `#a855f7` |
| Success | Green | `#22c55e` |
| Warning | Yellow | `#eab308` |
| Danger | Red | `#ef4444` |
| Background | Dark | `#0a0a0f` |
| Text Primary | Light | `#e8e8ed` |
| Text Secondary | Muted | `#8888a0` |

### Typography

| Type | Font | Weight |
|------|------|--------|
| Primary | Be Vietnam Pro | 400-700 |
| Monospace | JetBrains Mono | 400-500 |

### Design Style
- Dark theme (default)
- Glassmorphism effects
- Subtle animations
- Mobile-first responsive

---

## 📅 TIMELINE

| Week | Deliverable | Tasks |
|------|-------------|-------|
| **1-2** | Foundation | Setup project, Auth, Landing Page v1 |
| **3-4** | Idea Graph | Canvas, Nodes, Links, Save/Load |
| **5-6** | Project Hub | Dashboard, Projects, Daily Focus, Tasks |
| **7** | Time Tracking | Timer, Entries, Summary |
| **8** | Polish | Bug fixes, Mobile fixes, Launch |

**Tổng thời gian dự kiến: 8 tuần**

---

## ⚠️ KHÔNG BAO GỒM (Out of Scope)

Những tính năng sau **KHÔNG** nằm trong Phase 1:

| Feature | Lý do | Phase dự kiến |
|---------|-------|---------------|
| Build in Public | Cần community features | Phase 3 |
| Public profiles | Cần community features | Phase 3 |
| Project showcase | Cần community features | Phase 3 |
| Knowledge base | Cần content system | Phase 3 |
| Template library | Cần content system | Phase 3 |
| Advanced analytics | Cần data collection | Phase 4 |
| Export PDF/CSV | Nice to have | Phase 4 |
| AI features | Premium feature | Phase 5 |
| API access | Premium feature | Phase 5 |
| Mobile app (native) | Separate project | Future |
| Multi-language (i18n) | Scale feature | Phase 5 |
| Payment integration | Monetization | Phase 4 |
| Dark/Light toggle | Nice to have | Phase 2 |
| Onboarding tour | Nice to have | Phase 2 |

---

## 📋 ACCEPTANCE CRITERIA

### Landing Page
- [ ] Hiển thị đúng 9 sections theo Blueprint
- [ ] Responsive trên mobile/tablet/desktop
- [ ] CTA buttons hoạt động (link đến /signup)
- [ ] Animations smooth, không lag
- [ ] Load time < 3 seconds

### Idea Graph
- [ ] Tạo node bằng double-click hoặc toolbar
- [ ] Edit node title và description
- [ ] Delete node (với confirmation)
- [ ] Tạo link giữa 2 nodes bằng drag
- [ ] Chọn 1 trong 6 màu cho node
- [ ] Zoom in/out bằng scroll
- [ ] Pan canvas bằng drag
- [ ] Data auto-save mỗi 5 giây
- [ ] Data load khi mở page

### Project Hub
- [ ] Hiển thị Focus Project nổi bật
- [ ] Hiển thị tối đa 3 Active Projects
- [ ] Tạo project mới với modal
- [ ] Edit project details
- [ ] Thay đổi status (Focus/Active/Backlog/Archive)
- [ ] Thêm/sửa/xóa tasks
- [ ] Daily Focus: chọn 3 tasks cho hôm nay
- [ ] Check off tasks hoàn thành

### Auth System
- [ ] Đăng ký bằng email + password
- [ ] Đăng nhập bằng email + password
- [ ] Đăng nhập bằng Google
- [ ] Gửi email reset password
- [ ] Session persist (remember me)
- [ ] Redirect sau khi login thành công
- [ ] Protected routes (require auth)

### Cloud Sync
- [ ] Data save thành công vào Supabase
- [ ] Data load khi user login
- [ ] RLS hoạt động (user chỉ thấy data của mình)
- [ ] Không mất data khi refresh

### Time Tracking
- [ ] Start timer cho project
- [ ] Pause timer
- [ ] Stop timer (save entry)
- [ ] Hiển thị thời gian đang chạy
- [ ] Hiển thị tổng thời gian hôm nay
- [ ] Hiển thị breakdown theo project
- [ ] Thêm time entry thủ công

---

## 🔒 CONSTRAINTS & RULES

### Về Code
1. Sử dụng TypeScript strict mode
2. Follow Next.js 14 App Router conventions
3. Component-based architecture
4. Responsive design (mobile-first)
5. Accessibility cơ bản (semantic HTML, aria labels)

### Về Process
1. Blueprint được approve trước khi code
2. Không thêm features ngoài scope
3. Thay đổi lớn → quay lại Blueprint
4. Code theo file structure đã định

### Về Data
1. Tất cả data thuộc về user
2. User chỉ truy cập được data của mình (RLS)
3. Không collect data không cần thiết

---

## 🤝 THỎA THUẬN

### Chủ nhà (Nguyễn Huy Chiến) cam kết:
- [x] Cung cấp context và feedback kịp thời
- [x] Review deliverables theo timeline
- [x] Không thay đổi scope giữa chừng mà không thảo luận
- [x] Approve Blueprint trước khi build

### Kiến trúc sư & Thợ xây (Claude) cam kết:
- [x] Deliver theo đúng Blueprint đã approve
- [x] Code clean, maintainable
- [x] Không tự ý thêm features ngoài scope
- [x] Báo cáo nếu gặp blockers

---

## ✅ CONFIRMATION

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   Bằng việc reply "CONFIRM", Chủ nhà xác nhận:                           ║
║                                                                           ║
║   ✓ Đã đọc và hiểu toàn bộ Contract                                      ║
║   ✓ Đồng ý với Deliverables và Timeline                                  ║
║   ✓ Đồng ý với Tech Stack                                                ║
║   ✓ Hiểu rõ những gì KHÔNG bao gồm                                       ║
║   ✓ Sẵn sàng bắt đầu Phase 1 MVP                                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

**Reply "CONFIRM" để nhận CODER PACK và bắt đầu build.**

---

# END OF CONTRACT
## 1NGUOI.COM - PHASE 1 MVP
## Vibecode Kit v4.0
