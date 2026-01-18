# ═══════════════════════════════════════════════════════════════════════════════
#                              🔧 CODER PACK v2
#                         1NGUOI.COM - PHASE 1 MVP
#                    Landing Page + Auth System
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 FILE NÀY TIẾP NỐI TỪ CODER PACK v1
#
#  Nội dung:
#  • STEP 4 (tiếp): Landing Page - các sections còn lại
#  • STEP 5: Auth System hoàn chỉnh
#
# ═══════════════════════════════════════════════════════════════════════════════

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 4 (TIẾP): LANDING PAGE COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 4.7 File: components/landing/pillars-section.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Target, Wrench, Gift, Users } from 'lucide-react'
import { Card } from '@/components/ui'

const pillars = [
  {
    icon: Target,
    title: 'FOCUS',
    emoji: '🎯',
    color: 'cyan',
    description: 'Hệ thống giúp bạn tập trung vào điều quan trọng nhất',
    features: [
      'Tối đa 3 dự án active',
      '1 Focus Project ưu tiên',
      'Daily 3 tasks mỗi ngày',
      'Weekly Review đánh giá',
    ],
  },
  {
    icon: Wrench,
    title: 'TOOLS',
    emoji: '🛠️',
    color: 'purple',
    description: 'Công cụ tích hợp, không cần chuyển qua lại',
    features: [
      'Idea Graph brainstorm',
      'Project Hub quản lý',
      'Time Tracker theo dõi',
      'Data sync liền mạch',
    ],
  },
  {
    icon: Gift,
    title: 'FREE TIER',
    emoji: '💰',
    color: 'success',
    description: 'Tài nguyên miễn phí để khởi động với $0',
    features: [
      'Danh sách curated',
      'Hướng dẫn setup cụ thể',
      'Cost calculator',
      '$0 startup stack',
    ],
  },
]

export function PillarsSection() {
  return (
    <section className="py-20 lg:py-32 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Giải pháp: <span className="gradient-text">3 Pillars</span>
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            1nguoi.com được xây dựng trên 3 trụ cột chính
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full text-center">
                <div className="mb-4">
                  <span className="text-5xl">{pillar.emoji}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {pillar.title}
                </h3>
                <p className="text-foreground-secondary mb-6">
                  {pillar.description}
                </p>
                <ul className="space-y-3 text-left">
                  {pillar.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full bg-${pillar.color}`} />
                      <span className="text-foreground-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Community Foundation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card variant="glass" className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-8 h-8 text-cyan" />
              <h3 className="text-2xl font-bold text-foreground">
                👥 COMMUNITY - Nền tảng kết nối
              </h3>
            </div>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Build in Public, Knowledge Base, Showcase - 
              Cộng đồng solo entrepreneurs chia sẻ hành trình và học hỏi lẫn nhau
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
```

## 4.8 File: components/landing/tools-section.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Lightbulb, LayoutDashboard, CheckSquare, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui'

const tools = [
  {
    icon: Lightbulb,
    title: 'Idea Graph',
    emoji: '💡',
    description: 'Brainstorm và kết nối ý tưởng như mind-map. Visualize mọi thứ trong đầu bạn.',
    features: ['Tạo nodes bằng double-click', 'Kết nối ý tưởng liên quan', '6 màu phân loại', 'Convert thành Project'],
  },
  {
    icon: LayoutDashboard,
    title: 'Project Hub',
    emoji: '📊',
    description: 'Dashboard quản lý tất cả dự án trên 1 trang. Nhìn một lần biết tất cả.',
    features: ['Focus Project nổi bật', 'Tối đa 3 Active Projects', 'Progress tracking', 'Health status 🟢🟡🔴'],
  },
  {
    icon: CheckSquare,
    title: 'Daily Focus',
    emoji: '✅',
    description: 'Chọn 3 việc quan trọng nhất mỗi ngày. Giữ focus, tránh overwhelm.',
    features: ['Pick 3 tasks mỗi ngày', 'Link với Projects', 'Time tracking tích hợp', 'Streak motivation'],
  },
]

export function ToolsSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Bộ công cụ <span className="gradient-text">đủ dùng</span>
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Từ ý tưởng → Dự án → Thực thi. Một flow liền mạch.
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-16">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex items-center gap-4 lg:gap-8"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-3 shadow-glow">
                  <span className="text-3xl">{tool.emoji}</span>
                </div>
                <span className="font-semibold text-foreground">{tool.title}</span>
              </div>
              
              {index < tools.length - 1 && (
                <ArrowRight className="w-6 h-6 text-foreground-muted hidden lg:block" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Tool Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan/20 flex items-center justify-center">
                    <tool.icon className="w-6 h-6 text-cyan" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{tool.title}</h3>
                </div>
                <p className="text-foreground-secondary mb-4">{tool.description}</p>
                <ul className="space-y-2">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## 4.9 File: components/landing/personas-section.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui'

const personas = [
  {
    emoji: '👔',
    title: 'Người ngoại đạo',
    subtitle: 'Chuyên gia ngành muốn tạo tool',
    description: 'Bạn có 10 năm kinh nghiệm trong ngành, hiểu rõ pain points, nhưng không biết code.',
    painPoints: ['Không biết bắt đầu từ đâu', 'Sợ tốn tiền vào thứ không hiệu quả', 'Không có thời gian học công nghệ'],
    solution: 'Hướng dẫn từ A-Z, free tools, community hỗ trợ',
    percentage: '40%',
  },
  {
    emoji: '💻',
    title: 'Maker',
    subtitle: 'Developer muốn build side project',
    description: 'Bạn code được, có nhiều ý tưởng hay, nhưng không finish project nào.',
    painPoints: ['Quá nhiều ý tưởng, không focus', 'Bắt đầu nhiều, hoàn thành ít', 'Thiếu động lực khi làm một mình'],
    solution: 'Focus system, accountability qua Build in Public',
    percentage: '35%',
  },
  {
    emoji: '🎨',
    title: 'Freelancer',
    subtitle: 'Muốn có sản phẩm riêng',
    description: 'Bạn đang service client, thu nhập phụ thuộc, muốn passive income từ product.',
    painPoints: ['Không có thời gian (đang service)', 'Không biết validate ý tưởng', 'Sợ mất tiền hosting, tools'],
    solution: 'Time management, free tier directory, validation framework',
    percentage: '25%',
  },
]

export function PersonasSection() {
  return (
    <section className="py-20 lg:py-32 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Dành cho <span className="gradient-text">ai?</span>
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            1nguoi.com được thiết kế cho những người muốn xây dựng doanh nghiệp một mình
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full relative overflow-hidden">
                {/* Percentage Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-cyan/20 text-cyan text-sm font-semibold rounded-full">
                    {persona.percentage}
                  </span>
                </div>

                {/* Header */}
                <div className="mb-6">
                  <span className="text-5xl mb-4 block">{persona.emoji}</span>
                  <h3 className="text-xl font-bold text-foreground">{persona.title}</h3>
                  <p className="text-cyan font-medium">{persona.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-foreground-secondary mb-6">{persona.description}</p>

                {/* Pain Points */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-foreground mb-2">Pain points:</p>
                  <ul className="space-y-2">
                    {persona.painPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-foreground-secondary">
                        <span className="text-danger mt-0.5">✗</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solution */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm font-semibold text-foreground mb-1">1nguoi.com giúp:</p>
                  <p className="text-sm text-success">{persona.solution}</p>
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

## 4.10 File: components/landing/bip-section.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Card, Badge, Progress } from '@/components/ui'

const updates = [
  {
    author: 'Chien Nguyen',
    avatar: '🧑‍💻',
    project: 'EATBOOK',
    time: '2h ago',
    type: 'milestone',
    content: 'Milestone: Authentication hoàn thành!',
    progressBefore: 60,
    progressAfter: 70,
    likes: 45,
    comments: 12,
  },
  {
    author: 'Linh Tran',
    avatar: '👩‍💼',
    project: 'InvoiceTool',
    time: '5h ago',
    type: 'lesson',
    content: 'Lesson: Đừng build features không ai cần. Tôi đã tốn 2 tuần cho một tính năng mà 0 người dùng.',
    likes: 89,
    comments: 23,
  },
  {
    author: 'Minh Le',
    avatar: '👨‍🎨',
    project: 'DesignSystem',
    time: '1d ago',
    type: 'progress',
    content: 'Đã hoàn thành 50 components. Còn 20 nữa là xong!',
    progressBefore: 65,
    progressAfter: 71,
    likes: 32,
    comments: 8,
  },
]

export function BipSection() {
  return (
    <section id="community" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Build in <span className="gradient-text">Public</span>
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Xây dựng công khai, học hỏi cùng cộng đồng. 
            Accountability và motivation từ những người cùng chí hướng.
          </p>
        </motion.div>

        {/* Feed Preview */}
        <div className="max-w-2xl mx-auto space-y-6">
          {updates.map((update, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{update.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{update.author}</span>
                      <span className="text-foreground-muted">•</span>
                      <span className="text-cyan font-medium">{update.project}</span>
                    </div>
                    <span className="text-sm text-foreground-muted">{update.time}</span>
                  </div>
                  <Badge variant={update.type === 'milestone' ? 'success' : update.type === 'lesson' ? 'warning' : 'cyan'}>
                    {update.type === 'milestone' ? '🎯 Milestone' : update.type === 'lesson' ? '💡 Lesson' : '📈 Progress'}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-foreground mb-4">{update.content}</p>

                {/* Progress Bar (if applicable) */}
                {update.progressBefore !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-2">
                      <span>Progress:</span>
                      <span className="text-foreground-muted">{update.progressBefore}%</span>
                      <span>→</span>
                      <span className="text-success">{update.progressAfter}%</span>
                    </div>
                    <Progress value={update.progressAfter} />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <button className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors">
                    <span>❤️</span>
                    <span className="text-sm">{update.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors">
                    <span>💬</span>
                    <span className="text-sm">{update.comments} comments</span>
                  </button>
                  <button className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors">
                    <span>🔗</span>
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-foreground-secondary">
            Tham gia cộng đồng và bắt đầu Build in Public! 🚀
          </p>
        </motion.div>
      </div>
    </section>
  )
}
```

## 4.11 File: components/landing/pricing-section.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    emoji: '🆓',
    price: '$0',
    period: '/month',
    description: 'Đủ để bắt đầu',
    popular: false,
    features: [
      { text: '3 projects', included: true },
      { text: '50 Idea Graph nodes', included: true },
      { text: 'Idea Graph', included: true },
      { text: 'Project Hub', included: true },
      { text: 'Daily Focus', included: true },
      { text: 'Time tracking', included: true },
      { text: 'Cloud sync', included: true },
      { text: 'Community access', included: true },
      { text: 'Export JSON', included: true },
      { text: 'Export PDF/CSV', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'AI features', included: false },
    ],
    cta: 'Bắt đầu miễn phí',
    ctaVariant: 'secondary' as const,
  },
  {
    name: 'Pro',
    emoji: '⭐',
    price: '$9',
    period: '/month',
    description: 'Cho người nghiêm túc',
    popular: true,
    features: [
      { text: '10 projects', included: true },
      { text: '200 Idea Graph nodes', included: true },
      { text: 'All Free features', included: true },
      { text: 'Export PDF/CSV', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom templates', included: true },
      { text: 'Priority support', included: true },
      { text: 'AI features', included: false },
      { text: 'API access', included: false },
      { text: '1-on-1 call', included: false },
    ],
    cta: 'Nâng cấp Pro',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'Builder',
    emoji: '🚀',
    price: '$19',
    period: '/month',
    description: 'Cho builders thực thụ',
    popular: false,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Unlimited nodes', included: true },
      { text: 'All Pro features', included: true },
      { text: 'AI suggestions', included: true },
      { text: 'AI writing assistant', included: true },
      { text: 'API access', included: true },
      { text: 'White-label option', included: true },
      { text: '1-on-1 call (quarterly)', included: true },
    ],
    cta: 'Liên hệ',
    ctaVariant: 'secondary' as const,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Bảng <span className="gradient-text">giá</span>
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Bắt đầu miễn phí, nâng cấp khi cần. Không ép buộc.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={plan.popular ? 'lg:-mt-4' : ''}
            >
              <Card 
                className={`h-full relative ${plan.popular ? 'border-cyan shadow-glow' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="cyan">Phổ biến nhất</Badge>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <span className="text-4xl mb-2 block">{plan.emoji}</span>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-foreground-secondary text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground-muted">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-foreground' : 'text-foreground-muted'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/signup" className="block">
                  <Button variant={plan.ctaVariant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-foreground-muted text-sm mt-8"
        >
          * Giá yearly: Pro $90/năm, Builder $190/năm (tiết kiệm 2 tháng)
        </motion.p>
      </div>
    </section>
  )
}
```

## 4.12 File: components/landing/faq-section.tsx

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const faqs = [
  {
    question: '1nguoi.com khác gì Notion, Trello, Linear?',
    answer: 'Những tool đó được thiết kế cho teams hoặc general-purpose. 1nguoi.com được thiết kế riêng cho solo entrepreneurs với focus system (max 3 projects), Build in Public community, và Free Tier Directory. Chúng tôi optimize cho việc ship products một mình.',
  },
  {
    question: 'Tôi không biết code, có dùng được không?',
    answer: 'Hoàn toàn được! 1nguoi.com không yêu cầu bạn biết code. Chúng tôi cung cấp hướng dẫn step-by-step, templates có sẵn, và community để hỗ trợ bạn. Persona chính của chúng tôi là "Người ngoại đạo" - những chuyên gia ngành muốn tạo tool mà không cần technical background.',
  },
  {
    question: 'Data của tôi có an toàn không?',
    answer: 'Data được lưu trữ trên Supabase (PostgreSQL) với Row Level Security. Chỉ bạn mới có thể truy cập data của mình. Chúng tôi không bán hay chia sẻ data với bên thứ 3. Bạn có thể export data bất cứ lúc nào.',
  },
  {
    question: 'Build in Public là gì?',
    answer: 'Build in Public là phương pháp chia sẻ công khai quá trình xây dựng sản phẩm. Bạn có thể chọn public tiến độ, milestones, lessons learned để nhận feedback và tạo accountability. Tất nhiên, bạn có thể chọn private nếu muốn.',
  },
  {
    question: 'Free tier có giới hạn gì?',
    answer: 'Free tier cho phép: 3 projects, 50 Idea Graph nodes, full access Idea Graph + Project Hub + Daily Focus + Time Tracking, cloud sync, và community access. Đủ để bắt đầu và ship sản phẩm đầu tiên!',
  },
  {
    question: 'Tôi có thể cancel subscription bất cứ lúc nào không?',
    answer: 'Có, bạn có thể cancel bất cứ lúc nào. Không ràng buộc hợp đồng. Sau khi cancel, bạn vẫn giữ được data và có thể tiếp tục dùng Free tier.',
  },
  {
    question: 'Có mobile app không?',
    answer: 'Hiện tại 1nguoi.com là web app, được optimize cho mobile (PWA). Bạn có thể add to home screen để trải nghiệm như app native. Mobile app riêng nằm trong roadmap tương lai.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Câu hỏi <span className="gradient-text">thường gặp</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left bg-background-card border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown 
                    className={cn(
                      'w-5 h-5 text-foreground-muted transition-transform flex-shrink-0',
                      openIndex === index && 'rotate-180'
                    )} 
                  />
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-foreground-secondary">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## 4.13 File: components/landing/cta-section.tsx

```typescript
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui'

export function CtaSection() {
  return (
    <section className="py-20 lg:py-32 bg-background-secondary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan/10 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Rocket className="w-16 h-16 text-cyan mx-auto mb-6" />
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Sẵn sàng bắt đầu <span className="gradient-text">hành trình</span>?
          </h2>
          
          <p className="text-xl text-foreground-secondary mb-10 max-w-2xl mx-auto">
            Build alone, ship together. 🚀
            <br />
            Tham gia cùng hàng trăm solo entrepreneurs Việt Nam.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="group text-lg px-8">
                🚀 Bắt đầu miễn phí ngay
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-foreground-muted text-sm">
            Không cần credit card • Setup trong 2 phút • Cancel bất cứ lúc nào
          </p>
        </motion.div>
      </div>
    </section>
  )
}
```

## 4.14 File: components/landing/footer.tsx

```typescript
import Link from 'next/link'

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Tính năng', href: '#features' },
      { label: 'Bảng giá', href: '#pricing' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Templates', href: '/templates' },
      { label: 'Free Tier Directory', href: '/free-tier' },
    ],
  },
  community: {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.gg/1nguoi' },
      { label: 'Twitter', href: 'https://twitter.com/1nguoi_com' },
      { label: 'GitHub', href: 'https://github.com/1nguoi' },
      { label: 'Build in Public', href: '/community' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <span className="text-xl font-bold text-foreground">nguoi</span>
            </Link>
            <p className="text-foreground-secondary text-sm">
              Framework để một người xây dựng doanh nghiệp
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-foreground-secondary hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground-muted text-sm">
            © 2025 1nguoi.com. All rights reserved.
          </p>
          <p className="text-foreground-muted text-sm">
            Made with ❤️ by solo entrepreneurs, for solo entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  )
}
```

## 4.15 File: components/landing/index.ts

```typescript
export * from './navbar'
export * from './hero'
export * from './problem-section'
export * from './pillars-section'
export * from './tools-section'
export * from './personas-section'
export * from './bip-section'
export * from './pricing-section'
export * from './faq-section'
export * from './cta-section'
export * from './footer'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 5: AUTH SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

## 5.1 File: app/(auth)/layout.tsx

```typescript
import { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">1</span>
          </div>
          <span className="text-xl font-bold text-foreground">nguoi</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
```

## 5.2 File: app/(auth)/login/page.tsx

```typescript
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Đăng nhập - 1nguoi.com',
  description: 'Đăng nhập vào tài khoản 1nguoi.com của bạn',
}

export default function LoginPage() {
  return <LoginForm />
}
```

## 5.3 File: app/(auth)/signup/page.tsx

```typescript
import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Đăng ký - 1nguoi.com',
  description: 'Tạo tài khoản 1nguoi.com miễn phí',
}

export default function SignupPage() {
  return <SignupForm />
}
```

## 5.4 File: app/(auth)/forgot-password/page.tsx

```typescript
import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Quên mật khẩu - 1nguoi.com',
  description: 'Khôi phục mật khẩu tài khoản 1nguoi.com',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
```

## 5.5 File: app/api/auth/callback/route.ts

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login page with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

## 5.6 File: components/auth/social-buttons.tsx

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

interface SocialButtonsProps {
  mode: 'login' | 'signup'
}

export function SocialButtons({ mode }: SocialButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error with Google auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="secondary"
        className="w-full"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} với Google
      </Button>
    </div>
  )
}
```

## 5.7 File: components/auth/login-form.tsx

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card } from '@/components/ui'
import { SocialButtons } from './social-buttons'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email hoặc mật khẩu không đúng')
        } else {
          setError(error.message)
        }
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Chào mừng trở lại! 👋
        </h1>
        <p className="text-foreground-secondary">
          Đăng nhập để tiếp tục hành trình
        </p>
      </div>

      {/* Social Login */}
      <SocialButtons mode="login" />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-foreground-muted text-sm">hoặc</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan focus:ring-cyan/20"
            />
            <span className="text-sm text-foreground-secondary">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-cyan hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Đăng nhập
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-foreground-secondary text-sm mt-6">
        Chưa có tài khoản?{' '}
        <Link href="/signup" className="text-cyan hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </Card>
  )
}
```

## 5.8 File: components/auth/signup-form.tsx

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card } from '@/components/ui'
import { SocialButtons } from './social-buttons'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  persona: z.enum(['expert', 'maker', 'freelancer', 'explorer']),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần đồng ý với điều khoản sử dụng',
  }),
})

type SignupFormData = z.infer<typeof signupSchema>

const personas = [
  { value: 'expert', label: 'Người ngoại đạo - Chuyên gia ngành muốn tạo tool' },
  { value: 'maker', label: 'Maker - Developer muốn build side project' },
  { value: 'freelancer', label: 'Freelancer - Muốn có sản phẩm riêng' },
  { value: 'explorer', label: 'Đang khám phá' },
]

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      persona: 'explorer',
      terms: false,
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            persona: data.persona,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Email này đã được đăng ký')
        } else {
          setError(error.message)
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Kiểm tra email!
        </h1>
        <p className="text-foreground-secondary mb-6">
          Chúng tôi đã gửi link xác nhận đến email của bạn.
          Vui lòng click vào link để hoàn tất đăng ký.
        </p>
        <Link href="/login">
          <Button variant="secondary">Quay lại đăng nhập</Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Tạo tài khoản mới 🚀
        </h1>
        <p className="text-foreground-secondary">
          Bắt đầu hành trình solo entrepreneur
        </p>
      </div>

      {/* Social Login */}
      <SocialButtons mode="signup" />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-foreground-muted text-sm">hoặc</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Họ tên"
          type="text"
          placeholder="Nguyễn Văn A"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Persona Select */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Bạn là ai?
          </label>
          <select
            {...register('persona')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
          >
            {personas.map((persona) => (
              <option key={persona.value} value={persona.value} className="bg-background">
                {persona.label}
              </option>
            ))}
          </select>
          {errors.persona && (
            <p className="text-sm text-danger">{errors.persona.message}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('terms')}
            className="w-4 h-4 mt-1 rounded border-white/20 bg-white/5 text-cyan focus:ring-cyan/20"
          />
          <span className="text-sm text-foreground-secondary">
            Tôi đồng ý với{' '}
            <Link href="/terms" className="text-cyan hover:underline">
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="text-cyan hover:underline">
              Chính sách bảo mật
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="text-sm text-danger">{errors.terms.message}</p>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Đăng ký
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-foreground-secondary text-sm mt-6">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-cyan hover:underline">
          Đăng nhập
        </Link>
      </p>
    </Card>
  )
}
```

## 5.9 File: components/auth/forgot-password-form.tsx

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Kiểm tra email!
        </h1>
        <p className="text-foreground-secondary mb-6">
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link reset mật khẩu.
        </p>
        <Link href="/login">
          <Button variant="secondary">Quay lại đăng nhập</Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-8">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Quên mật khẩu? 🔑
        </h1>
        <p className="text-foreground-secondary">
          Nhập email để nhận link reset mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Gửi link reset
        </Button>
      </form>
    </Card>
  )
}
```

## 5.10 File: components/auth/index.ts

```typescript
export * from './login-form'
export * from './signup-form'
export * from './forgot-password-form'
export * from './social-buttons'
```

## 5.11 File: lib/hooks/use-user.ts

```typescript
'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }

      setIsLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    profile,
    isLoading,
    signOut,
  }
}
```

## 5.12 File: lib/hooks/index.ts

```typescript
export * from './use-user'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         ✅ CODER PACK v2 COMPLETE
# ═══════════════════════════════════════════════════════════════════════════════

## Tóm tắt files trong v2:

```
components/
├── landing/
│   ├── navbar.tsx              (v1)
│   ├── hero.tsx                (v1)
│   ├── problem-section.tsx     (v1)
│   ├── pillars-section.tsx     ✅ NEW
│   ├── tools-section.tsx       ✅ NEW
│   ├── personas-section.tsx    ✅ NEW
│   ├── bip-section.tsx         ✅ NEW
│   ├── pricing-section.tsx     ✅ NEW
│   ├── faq-section.tsx         ✅ NEW
│   ├── cta-section.tsx         ✅ NEW
│   ├── footer.tsx              ✅ NEW
│   └── index.ts                ✅ NEW
│
├── auth/
│   ├── login-form.tsx          ✅ NEW
│   ├── signup-form.tsx         ✅ NEW
│   ├── forgot-password-form.tsx ✅ NEW
│   ├── social-buttons.tsx      ✅ NEW
│   └── index.ts                ✅ NEW
│
app/
├── (auth)/
│   ├── layout.tsx              ✅ NEW
│   ├── login/page.tsx          ✅ NEW
│   ├── signup/page.tsx         ✅ NEW
│   └── forgot-password/page.tsx ✅ NEW
│
├── api/auth/callback/
│   └── route.ts                ✅ NEW
│
lib/
├── hooks/
│   ├── use-user.ts             ✅ NEW
│   └── index.ts                ✅ NEW
```

---

## Tiếp theo: CODER PACK v3

Nội dung:
- STEP 6: Idea Graph (React Flow canvas, nodes, links, CRUD)
- STEP 7: Project Hub (Dashboard, Projects, Tasks, Daily Focus)
- STEP 8: Time Tracking (Timer, Entries)

Reply "tiếp" để nhận CODER PACK v3!

---

# END OF CODER PACK v2
## 1NGUOI.COM - PHASE 1 MVP
## Vibecode Kit v4.0
