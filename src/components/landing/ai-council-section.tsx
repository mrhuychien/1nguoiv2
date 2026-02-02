"use client";

import { motion } from "framer-motion";

const agents = [
  {
    id: "spark",
    icon: "⚡",
    name: "SPARK",
    provider: "ChatGPT",
    role: "The Ideator",
    description: "Sáng tạo, đề xuất ý tưởng mới, mở rộng khả năng, brainstorm không giới hạn",
    color: "yellow",
  },
  {
    id: "lens",
    icon: "🔍",
    name: "LENS",
    provider: "Claude",
    role: "The Analyst",
    description: "Phân tích logic, đánh giá khả thi, cân nhắc pros/cons chi tiết",
    color: "cyan",
  },
  {
    id: "radar",
    icon: "📡",
    name: "RADAR",
    provider: "Gemini",
    role: "The Researcher",
    description: "Nghiên cứu thị trường, data-driven insights, xu hướng & case studies",
    color: "green",
  },
  {
    id: "devil",
    icon: "😈",
    name: "DEVIL",
    provider: "Grok",
    role: "The Challenger",
    description: "Phản biện, chỉ ra điểm yếu, stress-test ý tưởng, devil's advocate",
    color: "red",
  },
];

const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
  yellow: { border: "border-yellow-500/30", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  cyan: { border: "border-cyan/30", bg: "bg-cyan/20", text: "text-cyan" },
  green: { border: "border-green-500/30", bg: "bg-green-500/20", text: "text-green-400" },
  red: { border: "border-red-500/30", bg: "bg-red-500/20", text: "text-red-400" },
};

export function AICouncilSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-6 text-center text-text-primary"
        >
          🤖 Hội đồng 4 AI (Brainstorm4)
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent, index) => {
            const colors = colorClasses[agent.color];
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-background-secondary border ${colors.border} rounded-xl p-5 hover:scale-105 transition-transform`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-2xl`}>
                    {agent.icon}
                  </div>
                  <div>
                    <div className={`font-bold ${colors.text}`}>{agent.name}</div>
                    <div className="text-xs text-text-secondary">{agent.provider}</div>
                  </div>
                </div>
                <div className="text-sm text-text-primary mb-2 font-medium">&quot;{agent.role}&quot;</div>
                <p className="text-xs text-text-secondary">{agent.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
