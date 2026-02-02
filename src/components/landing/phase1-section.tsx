"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "VẤN ĐỀ",
    icon: "💡",
    toolName: "Idea Graph",
    toolDesc: "Visual mind-map",
    color: "cyan",
    features: ["Nodes + Links kết nối", "6 màu phân loại", "Zoom, pan, search"],
    glow: true,
  },
  {
    number: 2,
    title: "Ý TƯỞNG GỐC",
    icon: "🌱",
    toolName: "Seed Idea",
    toolDesc: "Từ Idea Graph",
    color: "purple",
    features: ["Chọn node tiềm năng", "Định hình ban đầu", "Chuẩn bị brainstorm"],
    glow: false,
  },
  {
    number: 3,
    title: "BRAINSTORM",
    icon: "🤖",
    toolName: "Hội đồng 4 AI",
    toolDesc: "Brainstorm4",
    color: "pink",
    features: null,
    agents: [
      { name: "SPARK", icon: "⚡", color: "yellow" },
      { name: "LENS", icon: "🔍", color: "cyan" },
      { name: "RADAR", icon: "📡", color: "green" },
      { name: "DEVIL", icon: "😈", color: "red" },
    ],
    glow: true,
  },
  {
    number: 4,
    title: "GIẢI PHÁP",
    icon: "✨",
    toolName: "Synthesis",
    toolDesc: "Tổng hợp & Lọc",
    color: "green",
    features: ["Đánh giá các góc nhìn", "Chọn hướng đi tối ưu", "Sẵn sàng → Build"],
    glow: false,
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
  cyan: { bg: "bg-cyan/20", text: "text-cyan", border: "border-cyan/50", bgLight: "bg-cyan/10" },
  purple: { bg: "bg-purple/20", text: "text-purple", border: "border-purple/50", bgLight: "bg-purple/10" },
  pink: { bg: "bg-pink-500/20", text: "text-pink-500", border: "border-pink-500/50", bgLight: "bg-pink-500/10" },
  green: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/50", bgLight: "bg-green-500/10" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/50", bgLight: "bg-yellow-500/10" },
  red: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50", bgLight: "bg-red-500/10" },
};

export function Phase1Section() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan/20 flex items-center justify-center text-2xl">
            🧠
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cyan">PHASE 1: Ý TƯỞNG</h2>
            <p className="text-text-secondary">Khám phá vấn đề, brainstorm giải pháp</p>
          </div>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-background-secondary border border-border rounded-2xl p-6 hover:${colors.border} transition-all ${
                  step.glow ? `shadow-[0_0_30px_rgba(0,212,255,0.2)]` : ""
                }`}
              >
                {/* Step Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-sm`}>
                    {step.number}
                  </span>
                  <h3 className="font-semibold text-lg text-text-primary">{step.title}</h3>
                </div>

                {/* Tool Card */}
                <div className={`${colors.bgLight} rounded-xl p-4 mb-4`}>
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className={`font-medium ${colors.text}`}>{step.toolName}</div>
                  <div className="text-sm text-text-secondary">{step.toolDesc}</div>
                </div>

                {/* Features or Agents */}
                {step.features && (
                  <ul className="text-sm text-text-secondary space-y-1">
                    {step.features.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                )}

                {step.agents && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {step.agents.map((agent) => {
                      const agentColors = colorClasses[agent.color];
                      return (
                        <div key={agent.name} className={`${agentColors.bgLight} ${agentColors.text} px-2 py-1 rounded text-center`}>
                          {agent.icon} {agent.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Flow Arrows (desktop only) */}
        <div className="hidden lg:flex justify-center mt-6">
          <svg width="100%" height="40" className="max-w-4xl">
            <defs>
              <marker id="arrow-cyan" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#00d4ff" />
              </marker>
              <marker id="arrow-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#a855f7" />
              </marker>
              <marker id="arrow-pink" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#ec4899" />
              </marker>
            </defs>
            <line x1="12%" y1="20" x2="30%" y2="20" stroke="#00d4ff" strokeWidth="2" markerEnd="url(#arrow-cyan)" strokeDasharray="8 4" className="animate-pulse" />
            <line x1="37%" y1="20" x2="55%" y2="20" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow-purple)" strokeDasharray="8 4" className="animate-pulse" />
            <line x1="62%" y1="20" x2="80%" y2="20" stroke="#ec4899" strokeWidth="2" markerEnd="url(#arrow-pink)" strokeDasharray="8 4" className="animate-pulse" />
          </svg>
        </div>
      </div>
    </section>
  );
}
