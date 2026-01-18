# ═══════════════════════════════════════════════════════════════════════════════
#                              🔧 CODER PACK
#                         1NGUOI.COM - PHASE 1 MVP
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 HƯỚNG DẪN SỬ DỤNG:
#
#  1. Copy TOÀN BỘ file này → Paste vào Claude Code / Cursor
#  2. AI sẽ hỏi nơi lưu project → Trả lời đường dẫn
#  3. Ngồi chờ code được tạo
#  4. Chạy: npm install → npm run dev → Mở http://localhost:3000
#
#  ⚠️ QUAN TRỌNG:
#  - KHÔNG thay đổi kiến trúc đã định
#  - KHÔNG thêm features ngoài scope
#  - Gặp conflict → BÁO CÁO, không tự quyết định
#
# ═══════════════════════════════════════════════════════════════════════════════

---

## 🎭 VAI TRÒ CỦA BẠN

Bạn là **THỢ XÂY** trong hệ thống Vibecode Kit v4.0.

**Kiến trúc sư** và **Chủ nhà** đã THỐNG NHẤT bản vẽ dưới đây. Nhiệm vụ của bạn là implement CHÍNH XÁC theo Blueprint.

### QUY TẮC TUYỆT ĐỐI:
1. ❌ KHÔNG thay đổi kiến trúc / layout
2. ❌ KHÔNG thêm features không có trong Blueprint
3. ❌ KHÔNG đổi tech stack
4. ❌ KHÔNG tự ý quyết định khi gặp conflict
5. ✅ Gặp vấn đề → BÁO CÁO và hỏi trước khi làm

---

## 🚀 BẮT ĐẦU

Hỏi DUY NHẤT một câu:

> "Bạn muốn lưu dự án ở đâu? (VD: ~/projects/1nguoi-app)"

Sau khi nhận được đường dẫn → **TIẾN HÀNH NGAY** theo thứ tự trong Coder Pack này.

---

# ═══════════════════════════════════════════════════════════════════════════════
#                            📋 PROJECT INFO
# ═══════════════════════════════════════════════════════════════════════════════

```yaml
Project: 1nguoi.com
Description: Framework platform để một người có thể phát triển doanh nghiệp
Phase: 1 - MVP
Author: Nguyễn Huy Chiến
Date: 18/01/2025
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                            🛠️ TECH STACK
# ═══════════════════════════════════════════════════════════════════════════════

```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x
Styling: Tailwind CSS 3.x
UI Components: Radix UI
State Management: Zustand 4.x
Canvas: React Flow 11.x
Animation: Framer Motion 10.x
Icons: Lucide React
Forms: React Hook Form + Zod
Date: date-fns
Backend: Supabase
Database: PostgreSQL (via Supabase)
Auth: Supabase Auth (Email + Google)
Hosting: Vercel
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                            🎨 DESIGN SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

## Colors (Tailwind Config)

```typescript
// tailwind.config.ts - colors
const colors = {
  // Primary
  cyan: {
    DEFAULT: '#00d4ff',
    50: '#e6faff',
    100: '#b3f0ff',
    200: '#80e6ff',
    300: '#4ddbff',
    400: '#1ad1ff',
    500: '#00d4ff',
    600: '#00a8cc',
    700: '#007d99',
    800: '#005266',
    900: '#002633',
  },
  purple: {
    DEFAULT: '#a855f7',
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // Status
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  
  // Backgrounds
  background: {
    DEFAULT: '#0a0a0f',
    secondary: '#12121a',
    tertiary: '#1a1a25',
    card: '#16161e',
    hover: '#1e1e2a',
  },
  
  // Text
  foreground: {
    DEFAULT: '#e8e8ed',
    secondary: '#8888a0',
    muted: '#555566',
  },
  
  // Border
  border: {
    DEFAULT: 'rgba(255,255,255,0.08)',
    hover: 'rgba(255,255,255,0.15)',
  },
}
```

## Typography

```typescript
// Google Fonts to import
// Be Vietnam Pro: 400, 500, 600, 700
// JetBrains Mono: 400, 500

const fontFamily = {
  sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}

const fontSize = {
  'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
  'h1': ['36px', { lineHeight: '44px', fontWeight: '700' }],
  'h2': ['30px', { lineHeight: '38px', fontWeight: '600' }],
  'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
  'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
  'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
  'small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
  'tiny': ['12px', { lineHeight: '16px', fontWeight: '400' }],
}
```

## Spacing

```typescript
// Use Tailwind default + custom
const spacing = {
  // ... tailwind defaults
  '18': '4.5rem',
  '88': '22rem',
  '128': '32rem',
}
```

## Border Radius

```typescript
const borderRadius = {
  'sm': '6px',
  'DEFAULT': '8px',
  'md': '10px',
  'lg': '12px',
  'xl': '16px',
  '2xl': '20px',
  '3xl': '24px',
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                            📁 FILE STRUCTURE
# ═══════════════════════════════════════════════════════════════════════════════

```
1nguoi-app/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── ideas/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (marketing)/
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   │
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
│
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── dropdown.tsx
│   │   ├── tooltip.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── checkbox.tsx
│   │   └── index.ts
│   │
│   ├── landing/
│   │   ├── navbar.tsx
│   │   ├── hero.tsx
│   │   ├── problem-section.tsx
│   │   ├── pillars-section.tsx
│   │   ├── tools-section.tsx
│   │   ├── personas-section.tsx
│   │   ├── bip-section.tsx
│   │   ├── pricing-section.tsx
│   │   ├── faq-section.tsx
│   │   ├── cta-section.tsx
│   │   ├── footer.tsx
│   │   └── index.ts
│   │
│   ├── idea-graph/
│   │   ├── canvas.tsx
│   │   ├── custom-node.tsx
│   │   ├── toolbar.tsx
│   │   ├── node-panel.tsx
│   │   ├── color-picker.tsx
│   │   ├── zoom-controls.tsx
│   │   └── index.ts
│   │
│   ├── project-hub/
│   │   ├── dashboard-header.tsx
│   │   ├── focus-project.tsx
│   │   ├── project-card.tsx
│   │   ├── project-grid.tsx
│   │   ├── daily-focus.tsx
│   │   ├── task-item.tsx
│   │   ├── new-project-modal.tsx
│   │   ├── timer.tsx
│   │   ├── timer-mini.tsx
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── social-buttons.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── index.ts
│   │
│   └── layout/
│       ├── dashboard-sidebar.tsx
│       ├── dashboard-navbar.tsx
│       └── index.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── types.ts
│   │
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-projects.ts
│   │   ├── use-project.ts
│   │   ├── use-tasks.ts
│   │   ├── use-graph.ts
│   │   ├── use-nodes.ts
│   │   ├── use-timer.ts
│   │   └── index.ts
│   │
│   ├── stores/
│   │   ├── project-store.ts
│   │   ├── idea-store.ts
│   │   ├── timer-store.ts
│   │   ├── ui-store.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format-date.ts
│   │   ├── format-time.ts
│   │   └── index.ts
│   │
│   └── types/
│       ├── database.ts
│       ├── project.ts
│       ├── idea.ts
│       └── index.ts
│
├── public/
│   ├── images/
│   │   └── logo.svg
│   └── fonts/
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── .env.local.example
├── .gitignore
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 1: PROJECT SETUP
# ═══════════════════════════════════════════════════════════════════════════════

## 1.1 Khởi tạo Project

```bash
# Tạo Next.js project
npx create-next-app@latest 1nguoi-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd 1nguoi-app

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install zustand
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-checkbox @radix-ui/react-accordion @radix-ui/react-avatar
npm install reactflow
npm install framer-motion
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
npm install clsx tailwind-merge
npm install -D @types/node
```

## 1.2 File: package.json

```json
{
  "name": "1nguoi-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.3",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "framer-motion": "^11.0.3",
    "lucide-react": "^0.316.0",
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.49.3",
    "reactflow": "^11.10.3",
    "tailwind-merge": "^2.2.1",
    "zod": "^3.22.4",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

## 1.3 File: tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#00d4ff',
          50: '#e6faff',
          100: '#b3f0ff',
          200: '#80e6ff',
          300: '#4ddbff',
          400: '#1ad1ff',
          500: '#00d4ff',
          600: '#00a8cc',
          700: '#007d99',
          800: '#005266',
          900: '#002633',
        },
        purple: {
          DEFAULT: '#a855f7',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        background: {
          DEFAULT: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a25',
          card: '#16161e',
          hover: '#1e1e2a',
        },
        foreground: {
          DEFAULT: '#e8e8ed',
          secondary: '#8888a0',
          muted: '#555566',
        },
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'h1': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'h2': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

## 1.4 File: app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #0a0a0f;
    --foreground: #e8e8ed;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-background-secondary;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-foreground-muted rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-foreground-secondary;
  }
}

@layer components {
  /* Glass effect */
  .glass {
    @apply bg-white/5 backdrop-blur-sm border border-white/10;
  }

  .glass-hover {
    @apply hover:bg-white/10 hover:border-white/20 transition-all duration-200;
  }

  /* Gradient text */
  .gradient-text {
    @apply bg-gradient-primary bg-clip-text text-transparent;
  }

  /* Button gradient */
  .btn-primary {
    @apply bg-gradient-primary text-white font-semibold rounded-xl px-6 py-3;
    @apply hover:brightness-110 hover:shadow-glow transition-all duration-200;
  }

  .btn-secondary {
    @apply bg-white/10 text-white border border-white/20 rounded-xl px-6 py-3;
    @apply hover:bg-white/15 transition-all duration-200;
  }

  .btn-ghost {
    @apply bg-transparent text-foreground-secondary rounded-xl px-4 py-2;
    @apply hover:bg-white/5 transition-all duration-200;
  }

  /* Card */
  .card {
    @apply bg-background-card border border-white/[0.08] rounded-2xl;
    @apply hover:border-white/[0.15] transition-all duration-200;
  }

  /* Input */
  .input {
    @apply bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground;
    @apply placeholder:text-foreground-muted;
    @apply focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20;
    @apply transition-all duration-200;
  }

  /* Status colors */
  .status-on-track {
    @apply text-success;
  }

  .status-at-risk {
    @apply text-warning;
  }

  .status-blocked {
    @apply text-danger;
  }
}

@layer utilities {
  /* Hide scrollbar but allow scrolling */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

## 1.5 File: app/layout.tsx

```typescript
import type { Metadata } from 'next'
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: '1nguoi.com - Framework để một người xây dựng doanh nghiệp',
  description: 'Nền tảng all-in-one cho solo entrepreneur Việt Nam. Từ ý tưởng đến sản phẩm, một mình nhưng không cô đơn.',
  keywords: ['solo entrepreneur', 'startup', 'vietnam', 'productivity', 'project management'],
  authors: [{ name: 'Nguyễn Huy Chiến' }],
  openGraph: {
    title: '1nguoi.com - Framework để một người xây dựng doanh nghiệp',
    description: 'Nền tảng all-in-one cho solo entrepreneur Việt Nam.',
    url: 'https://1nguoi.com',
    siteName: '1nguoi.com',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${jetbrains.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## 1.6 File: app/providers.tsx

```typescript
'use client'

import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
    </>
  )
}
```

## 1.7 File: lib/utils/cn.ts

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 1.8 File: .env.local.example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (for OAuth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 2: UI COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 2.1 File: components/ui/button.tsx

```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-primary text-white hover:brightness-110 hover:shadow-glow',
      secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15',
      ghost: 'bg-transparent text-foreground-secondary hover:bg-white/5',
      danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 rounded-xl',
      lg: 'px-6 py-3 text-lg rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang xử lý...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

## 2.2 File: components/ui/card.tsx

```typescript
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outlined'
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, ...props }, ref) => {
    const variants = {
      default: 'bg-background-card border border-white/[0.08]',
      glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
      outlined: 'bg-transparent border border-white/[0.08]',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6',
          variants[variant],
          hover && 'hover:border-white/[0.15] transition-all duration-200',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-h4 font-semibold text-foreground', className)} {...props} />
  )
)

CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-foreground-secondary', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'
```

## 2.3 File: components/ui/input.tsx

```typescript
import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-foreground',
            'placeholder:text-foreground-muted',
            'focus:outline-none focus:ring-2 transition-all duration-200',
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-white/10 focus:border-cyan focus:ring-cyan/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {hint && !error && <p className="text-sm text-foreground-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

## 2.4 File: components/ui/modal.tsx

```typescript
'use client'

import { Fragment, ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-lg max-h-[85vh] overflow-y-auto',
            'bg-background-secondary border border-white/10 rounded-2xl p-6',
            'shadow-xl data-[state=open]:animate-slide-up',
            className
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && (
                <Dialog.Title className="text-h4 font-semibold text-foreground">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-foreground-secondary mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-foreground-secondary" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

## 2.5 File: components/ui/progress.tsx

```typescript
import { cn } from '@/lib/utils/cn'

interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  color = 'cyan',
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const colors = {
    cyan: 'bg-cyan',
    purple: 'bg-purple',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-white/10 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-foreground-secondary mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
```

## 2.6 File: components/ui/badge.tsx

```typescript
import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-foreground-secondary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-danger',
    purple: 'bg-purple/20 text-purple',
    cyan: 'bg-cyan/20 text-cyan',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-tiny',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
```

## 2.7 File: components/ui/index.ts

```typescript
export * from './button'
export * from './card'
export * from './input'
export * from './modal'
export * from './progress'
export * from './badge'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 3: SUPABASE SETUP
# ═══════════════════════════════════════════════════════════════════════════════

## 3.1 File: lib/supabase/client.ts

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 3.2 File: lib/supabase/server.ts

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies in Server Components
          }
        },
      },
    }
  )
}
```

## 3.3 File: lib/supabase/middleware.ts

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

## 3.4 File: middleware.ts (root)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 3.5 File: supabase/migrations/001_initial_schema.sql

```sql
-- ═══════════════════════════════════════════════════════════════════
--                         DATABASE SCHEMA
--                        1nguoi.com Phase 1
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    persona TEXT CHECK (persona IN ('expert', 'maker', 'freelancer', 'explorer')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#00d4ff',
    status TEXT DEFAULT 'active' CHECK (status IN ('focus', 'active', 'backlog', 'archived')),
    health TEXT DEFAULT 'on_track' CHECK (health IN ('on_track', 'at_risk', 'blocked')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_phase TEXT,
    deadline TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT FALSE,
    idea_node_id UUID,
    time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT PHASES
CREATE TABLE public.phases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    phase_id UUID REFERENCES public.phases(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    done BOOLEAN DEFAULT FALSE,
    done_at TIMESTAMPTZ,
    is_daily_focus BOOLEAN DEFAULT FALSE,
    daily_focus_date DATE,
    order_index INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IDEA GRAPHS
CREATE TABLE public.graphs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'My Ideas',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IDEA NODES
CREATE TABLE public.nodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    graph_id UUID REFERENCES public.graphs(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#00d4ff',
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    linked_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- IDEA LINKS
CREATE TABLE public.links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    graph_id UUID REFERENCES public.graphs(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
    target_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, target_id)
);

-- TIME ENTRIES
CREATE TABLE public.time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL,
    description TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
--                         INDEXES
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_daily_focus ON public.tasks(is_daily_focus, daily_focus_date);
CREATE INDEX idx_nodes_graph_id ON public.nodes(graph_id);
CREATE INDEX idx_links_graph_id ON public.links(graph_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(started_at);

-- ═══════════════════════════════════════════════════════════════════
--                         ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Phases policies
CREATE POLICY "Users can manage phases of own projects" ON public.phases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = phases.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Tasks policies
CREATE POLICY "Users can manage tasks of own projects" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Graphs policies
CREATE POLICY "Users can manage own graphs" ON public.graphs
    FOR ALL USING (auth.uid() = user_id);

-- Nodes policies
CREATE POLICY "Users can manage nodes of own graphs" ON public.nodes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.graphs 
            WHERE graphs.id = nodes.graph_id 
            AND graphs.user_id = auth.uid()
        )
    );

-- Links policies
CREATE POLICY "Users can manage links of own graphs" ON public.links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.graphs 
            WHERE graphs.id = links.graph_id 
            AND graphs.user_id = auth.uid()
        )
    );

-- Time entries policies
CREATE POLICY "Users can manage own time entries" ON public.time_entries
    FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
--                         FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default graph for new user
    INSERT INTO public.graphs (user_id, title)
    VALUES (NEW.id, 'My Ideas');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_graphs_updated_at
    BEFORE UPDATE ON public.graphs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_nodes_updated_at
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

## 3.6 File: lib/types/database.ts

```typescript
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
          persona: 'expert' | 'maker' | 'freelancer' | 'explorer' | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          persona?: 'expert' | 'maker' | 'freelancer' | 'explorer' | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          persona?: 'expert' | 'maker' | 'freelancer' | 'explorer' | null
          settings?: Json
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
          color: string
          status: 'focus' | 'active' | 'backlog' | 'archived'
          health: 'on_track' | 'at_risk' | 'blocked'
          progress: number
          current_phase: string | null
          deadline: string | null
          is_public: boolean
          idea_node_id: string | null
          time_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          color?: string
          status?: 'focus' | 'active' | 'backlog' | 'archived'
          health?: 'on_track' | 'at_risk' | 'blocked'
          progress?: number
          current_phase?: string | null
          deadline?: string | null
          is_public?: boolean
          idea_node_id?: string | null
          time_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          color?: string
          status?: 'focus' | 'active' | 'backlog' | 'archived'
          health?: 'on_track' | 'at_risk' | 'blocked'
          progress?: number
          current_phase?: string | null
          deadline?: string | null
          is_public?: boolean
          idea_node_id?: string | null
          time_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          phase_id: string | null
          title: string
          description: string | null
          done: boolean
          done_at: string | null
          is_daily_focus: boolean
          daily_focus_date: string | null
          order_index: number
          time_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          phase_id?: string | null
          title: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          is_daily_focus?: boolean
          daily_focus_date?: string | null
          order_index?: number
          time_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          phase_id?: string | null
          title?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          is_daily_focus?: boolean
          daily_focus_date?: string | null
          order_index?: number
          time_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      graphs: {
        Row: {
          id: string
          user_id: string
          title: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      nodes: {
        Row: {
          id: string
          graph_id: string
          title: string
          description: string | null
          color: string
          x: number
          y: number
          tags: string[]
          linked_project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          graph_id: string
          title: string
          description?: string | null
          color?: string
          x: number
          y: number
          tags?: string[]
          linked_project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          graph_id?: string
          title?: string
          description?: string | null
          color?: string
          x?: number
          y?: number
          tags?: string[]
          linked_project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          graph_id: string
          source_id: string
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          graph_id: string
          source_id: string
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          graph_id?: string
          source_id?: string
          target_id?: string
          created_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string
          task_id: string | null
          duration: number
          description: string | null
          started_at: string
          ended_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          task_id?: string | null
          duration: number
          description?: string | null
          started_at: string
          ended_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          task_id?: string | null
          duration?: number
          description?: string | null
          started_at?: string
          ended_at?: string
          created_at?: string
        }
      }
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
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 4: LANDING PAGE
# ═══════════════════════════════════════════════════════════════════════════════

## 4.1 File: app/(marketing)/layout.tsx

```typescript
import { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
```

## 4.2 File: app/(marketing)/page.tsx

```typescript
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { ProblemSection } from '@/components/landing/problem-section'
import { PillarsSection } from '@/components/landing/pillars-section'
import { ToolsSection } from '@/components/landing/tools-section'
import { PersonasSection } from '@/components/landing/personas-section'
import { BipSection } from '@/components/landing/bip-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { CtaSection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <PillarsSection />
        <ToolsSection />
        <PersonasSection />
        <BipSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
```

## 4.3 File: components/landing/navbar.tsx

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#features', label: 'Tính năng' },
    { href: '#pricing', label: 'Bảng giá' },
    { href: '#community', label: 'Cộng đồng' },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
            <span className="text-xl font-bold text-foreground">nguoi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground-secondary hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/signup">
              <Button>Bắt đầu miễn phí</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background-secondary border-t border-white/10">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-foreground-secondary hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link href="/login" className="block">
                <Button variant="secondary" className="w-full">Đăng nhập</Button>
              </Link>
              <Link href="/signup" className="block">
                <Button className="w-full">Bắt đầu miễn phí</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
```

## 4.4 File: components/landing/hero.tsx

```typescript
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm text-foreground-secondary">
            Dành cho Solo Entrepreneur Việt Nam
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
        >
          <span className="text-foreground">Framework để </span>
          <span className="gradient-text">MỘT NGƯỜI</span>
          <br />
          <span className="text-foreground">xây dựng doanh nghiệp</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto mb-10"
        >
          Nền tảng all-in-one cho solo entrepreneur Việt Nam.
          <br />
          Từ ý tưởng đến sản phẩm, một mình nhưng không cô đơn.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup">
            <Button size="lg" className="group">
              🚀 Bắt đầu miễn phí
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="secondary" size="lg">
            <Play className="mr-2 w-5 h-5" />
            Xem demo
          </Button>
        </motion.div>

        {/* Hero Image/Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Browser Frame */}
            <div className="bg-background-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-background rounded-lg text-sm text-foreground-muted">
                    1nguoi.com/dashboard
                  </div>
                </div>
              </div>
              {/* Screenshot Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-background-secondary to-background flex items-center justify-center">
                <p className="text-foreground-muted">Dashboard Preview</p>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -left-4 lg:-left-8 top-1/4 bg-background-card border border-white/10 rounded-xl p-4 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan/20 rounded-lg flex items-center justify-center">
                  <span className="text-cyan">🎯</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Focus Mode</p>
                  <p className="text-xs text-foreground-muted">3 tasks today</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -right-4 lg:-right-8 top-1/3 bg-background-card border border-white/10 rounded-xl p-4 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple">⏱️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Time Tracked</p>
                  <p className="text-xs text-foreground-muted">4h 32m today</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

## 4.5 File: components/landing/problem-section.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Brain, Wrench, DollarSign, Heart, BookOpen, Rocket } from 'lucide-react'
import { Card } from '@/components/ui'

const problems = [
  {
    icon: Brain,
    title: 'FOCUS',
    emoji: '😵',
    description: 'Làm nhiều thứ cùng lúc, không biết ưu tiên gì, dễ bị phân tán',
  },
  {
    icon: Wrench,
    title: 'TOOLS',
    emoji: '🔧',
    description: 'Mỗi việc một tool khác nhau, data rải rác khắp nơi',
  },
  {
    icon: DollarSign,
    title: 'RESOURCES',
    emoji: '💰',
    description: 'Không có vốn để bắt đầu, sợ rủi ro tài chính',
  },
  {
    icon: Heart,
    title: 'EMOTIONAL',
    emoji: '😔',
    description: 'Cô đơn khi làm một mình, thiếu động lực và accountability',
  },
  {
    icon: BookOpen,
    title: 'KNOWLEDGE',
    emoji: '📚',
    description: 'Không biết bắt đầu từ đâu, không có mentor',
  },
  {
    icon: Rocket,
    title: 'EXECUTION',
    emoji: '🚀',
    description: 'Ý tưởng nhiều nhưng thực thi ít, không ship được sản phẩm',
  },
]

export function ProblemSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Bạn có đang gặp những vấn đề này?
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Đây là những thử thách phổ biến của solo entrepreneur
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:scale-[1.02] transition-transform">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{problem.emoji}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-foreground-secondary">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## 4.6 Các components còn lại của Landing Page

**Tiếp tục tạo các files sau với pattern tương tự:**

- `components/landing/pillars-section.tsx` - 3 Pillars: Focus, Tools, Free Tier
- `components/landing/tools-section.tsx` - Idea Graph → Project Hub → Daily Focus flow
- `components/landing/personas-section.tsx` - 3 personas: Người ngoại đạo, Maker, Freelancer
- `components/landing/bip-section.tsx` - Build in Public preview
- `components/landing/pricing-section.tsx` - 3 tiers: Free, Pro, Builder
- `components/landing/faq-section.tsx` - Accordion FAQ
- `components/landing/cta-section.tsx` - Final CTA
- `components/landing/footer.tsx` - Footer với links
- `components/landing/index.ts` - Export all

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    TIẾP TỤC TRONG PHẦN 2...
# ═══════════════════════════════════════════════════════════════════════════════

**Do file quá dài, các phần sau sẽ được implement tiếp:**

## STEP 5: AUTH SYSTEM
- Login page
- Signup page
- Auth forms
- OAuth callback

## STEP 6: IDEA GRAPH
- React Flow setup
- Custom node component
- Toolbar
- Node panel
- CRUD operations

## STEP 7: PROJECT HUB
- Dashboard layout
- Focus project
- Project cards
- Daily focus
- Task management

## STEP 8: TIME TRACKING
- Timer component
- Time entries
- Daily summary

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         ✅ SAU KHI HOÀN THÀNH
# ═══════════════════════════════════════════════════════════════════════════════

```
✅ Đã tạo xong project structure
📁 Location: [đường dẫn bạn chọn]

Để chạy:
1. cd [path]
2. cp .env.local.example .env.local
3. Điền Supabase credentials vào .env.local
4. npm install
5. npm run dev
6. Mở http://localhost:3000

Để setup Supabase:
1. Tạo project mới tại supabase.com
2. Copy URL và anon key vào .env.local
3. Chạy migration SQL trong Supabase SQL Editor
4. Enable Google OAuth trong Authentication > Providers
```

---

# END OF CODER PACK - PART 1
## 1NGUOI.COM - PHASE 1 MVP
## Vibecode Kit v4.0
