"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Swords, ArrowRight, Sparkles, MessageSquare, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquare,
    title: "Multi-Agent Chat",
    description: "Chat với nhiều AI cùng lúc, nhận đa góc nhìn cho mỗi câu hỏi",
  },
  {
    icon: Users,
    title: "Hội đồng 4 AI",
    description: "4 AI với vai trò khác nhau: Ideator, Analyst, Researcher, Challenger",
  },
  {
    icon: Zap,
    title: "Streaming Real-time",
    description: "Nhận câu trả lời ngay lập tức với streaming technology",
  },
];

const agents = [
  { emoji: "⚡", name: "Spark", role: "Ideator", color: "from-yellow-500 to-amber-500" },
  { emoji: "🔍", name: "Lens", role: "Analyst", color: "from-cyan-500 to-blue-500" },
  { emoji: "📡", name: "Radar", role: "Researcher", color: "from-green-500 to-emerald-500" },
  { emoji: "😈", name: "Devil", role: "Challenger", color: "from-red-500 to-orange-500" },
];

export function CombatSection() {
  return (
    <section id="combat" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
            <Swords className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Combat - AI Council</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Phòng họp AI - Đa góc nhìn cho mỗi vấn đề
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Tập hợp 4 AI với những vai trò khác nhau để phân tích vấn đề của bạn từ nhiều góc độ.
            Brainstorm ý tưởng, phản biện giải pháp, và đưa ra quyết định sáng suốt hơn.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Demo Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Swords className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">Combat Free</div>
                  <div className="text-xs text-slate-400">4 AI Miễn phí</div>
                </div>
              </div>

              {/* Agent selector */}
              <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2 overflow-x-auto">
                {agents.map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm whitespace-nowrap"
                  >
                    <span>{agent.emoji}</span>
                    <span>{agent.name}</span>
                  </div>
                ))}
              </div>

              {/* Chat preview */}
              <div className="p-4 space-y-4 min-h-[200px]">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-cyan-500/20 text-cyan-100 px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[80%]">
                    Tôi muốn tạo app học tiếng Anh, có nên dùng AI không?
                  </div>
                </div>

                {/* AI responses */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-sm shrink-0">
                    ⚡
                  </div>
                  <div className="bg-slate-800/50 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-slate-200">
                    <span className="text-yellow-400 font-medium">Spark:</span> Tuyệt vời! AI có thể personalize bài học, tạo conversation practice...
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm shrink-0">
                    😈
                  </div>
                  <div className="bg-slate-800/50 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-slate-200">
                    <span className="text-red-400 font-medium">Devil:</span> Nhưng thị trường đã có Duolingo, Elsa... Điểm khác biệt là gì?
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Features & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl bg-background-secondary border border-border hover:border-cyan/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-cyan" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
                    <p className="text-sm text-text-secondary">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Link href="/combatfree">
                  Dùng thử miễn phí
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup">
                  <Sparkles className="mr-2 w-4 h-4" />
                  Đăng ký Combat Pro
                </Link>
              </Button>
            </div>

            {/* Note */}
            <p className="text-sm text-text-muted">
              Combat Free sử dụng API miễn phí, không cần đăng nhập.
              Đăng ký để truy cập Combat Pro với AI mạnh hơn.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
