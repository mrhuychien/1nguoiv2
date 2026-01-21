"use client";

import { motion } from "framer-motion";

const marketingItems = [
  { icon: "📢", name: "Launch Strategy", desc: "Chiến lược ra mắt", color: "green" },
  { icon: "🏗️", name: "Build in Public", desc: "Xây dựng trước công chúng", color: "purple" },
  { icon: "👥", name: "Community", desc: "Cộng đồng solopreneur", color: "cyan" },
  { icon: "📈", name: "Growth Hacks", desc: "Tăng trưởng thông minh", color: "orange" },
];

const colorClasses: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-green-500/10", text: "text-green-400" },
  purple: { bg: "bg-purple/10", text: "text-purple" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400" },
};

export function Phase3Section() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Connector */}
        <div className="flex justify-center mb-8">
          <div className="w-1 h-16 bg-gradient-to-b from-yellow-500 to-green-500 rounded-full" />
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
            🚀
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-400">PHASE 3: RA MẮT</h2>
            <p className="text-text-secondary">Launch sản phẩm, marketing với nguồn lực hạn chế</p>
          </div>
        </motion.div>

        {/* Marketing41 Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-background-secondary border border-border rounded-2xl p-6 hover:border-green-500/50 transition-all shadow-[0_0_30px_rgba(34,197,94,0.15)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-sm">
              7
            </span>
            <h3 className="font-semibold text-lg text-text-primary">MARKETING41</h3>
            <span className="text-sm text-text-secondary">Marketing for 1</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketingItems.map((item, index) => {
              const colors = colorClasses[item.color];
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`${colors.bg} rounded-xl p-4 text-center`}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className={`font-medium ${colors.text}`}>{item.name}</div>
                  <div className="text-xs text-text-secondary mt-1">{item.desc}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 bg-white/5 rounded-xl p-4 text-center">
            <p className="text-text-secondary text-sm">
              💡 Giải pháp marketing tổng thể cho{" "}
              <span className="text-green-400 font-medium">1 người</span> với{" "}
              <span className="text-green-400 font-medium">nguồn lực hạn chế</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
