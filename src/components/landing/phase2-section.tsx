"use client";

import { motion } from "framer-motion";

export function Phase2Section() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Connector */}
        <div className="flex justify-center mb-8">
          <div className="w-1 h-16 bg-gradient-to-b from-green-500 to-orange-500 rounded-full" />
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
            ⚙️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-orange-400">PHASE 2: XÂY DỰNG</h2>
            <p className="text-text-secondary">Thiết kế kiến trúc, code, ra sản phẩm</p>
          </div>
        </motion.div>

        {/* Two Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vibecode Kit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background-secondary border border-border rounded-2xl p-6 hover:border-orange-500/50 transition-all shadow-[0_0_30px_rgba(249,115,22,0.15)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                5
              </span>
              <h3 className="font-semibold text-lg text-text-primary">VIBECODE KIT v4.0</h3>
            </div>

            {/* 3 Roles */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🏠</div>
                <div className="text-xs font-medium text-text-primary">Chủ nhà</div>
                <div className="text-[10px] text-text-secondary">Bạn</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">📐</div>
                <div className="text-xs font-medium text-text-primary">Kiến trúc sư</div>
                <div className="text-[10px] text-text-secondary">Claude</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">👷</div>
                <div className="text-xs font-medium text-text-primary">Thợ xây</div>
                <div className="text-[10px] text-text-secondary">AI Code</div>
              </div>
            </div>

            {/* Process Flow */}
            <div className="flex flex-wrap items-center justify-between bg-orange-500/10 rounded-xl p-3 text-sm gap-1">
              {["Vision", "Context", "Blueprint", "Contract", "Build", "Refine"].map((step, index, arr) => (
                <span key={step} className="flex items-center">
                  <span className="text-orange-400 font-medium">{step}</span>
                  {index < arr.length - 1 && <span className="text-text-secondary mx-1">→</span>}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Thực thi & Quản lý Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-background-secondary border border-border rounded-2xl p-6 hover:border-yellow-500/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-sm">
                6
              </span>
              <h3 className="font-semibold text-lg text-text-primary">THỰC THI & QUẢN LÝ</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Zen Focus */}
              <div className="bg-yellow-500/10 rounded-xl p-4">
                <div className="text-2xl mb-2">🧘</div>
                <div className="font-medium text-yellow-400">Zen Focus</div>
                <div className="text-xs text-text-secondary mt-1">Quản lý năng lượng & tập trung</div>
              </div>

              {/* Project Hub */}
              <div className="bg-cyan/10 rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-cyan">Project Hub</div>
                <div className="text-xs text-text-secondary mt-1">Dashboard tổng quan</div>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs font-medium text-text-secondary mb-2">Ràng buộc thông minh:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-cyan/20 text-cyan px-2 py-1 rounded">3 Active Projects</span>
                <span className="bg-purple/20 text-purple px-2 py-1 rounded">1 Focus Project</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">3 Daily Tasks</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
