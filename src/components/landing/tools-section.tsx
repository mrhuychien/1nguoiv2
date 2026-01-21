"use client";

import { motion } from "framer-motion";

const tools = [
  { icon: "💡", name: "Idea Graph", status: "done", color: "cyan" },
  { icon: "🤖", name: "Brainstorm4", status: "done", color: "purple" },
  { icon: "📐", name: "Vibecode Kit", status: "done", version: "v4.0", color: "orange" },
  { icon: "📊", name: "Project Hub", status: "done", color: "cyan" },
  { icon: "🧘", name: "Zen Focus", status: "planning", color: "yellow" },
  { icon: "✅", name: "Daily Focus", status: "done", color: "green" },
  { icon: "📢", name: "Marketing41", status: "planning", color: "green" },
];

const colorClasses: Record<string, string> = {
  cyan: "border-cyan/30",
  purple: "border-purple/30",
  orange: "border-orange-500/30",
  yellow: "border-yellow-500/30",
  green: "border-green-500/30",
};

const statusDisplay: Record<string, { text: string; color: string }> = {
  done: { text: "✅ Done", color: "text-green-400" },
  planning: { text: "⏳ Planning", color: "text-yellow-400" },
};

export function ToolsSection() {
  return (
    <section id="tools" className="py-16 px-4 sm:px-6 lg:px-8 bg-background-secondary">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold mb-6 text-center text-text-primary"
        >
          🛠️ Công cụ trong hệ sinh thái
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {tools.map((tool, index) => {
            const status = statusDisplay[tool.status];
            return (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`bg-background border ${colorClasses[tool.color]} rounded-xl p-4 text-center hover:scale-105 transition-transform`}
              >
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="text-sm font-medium text-text-primary">{tool.name}</div>
                <div className={`text-xs mt-1 ${status.color}`}>
                  {tool.version ? `${status.text.split(" ")[0]} ${tool.version}` : status.text}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
