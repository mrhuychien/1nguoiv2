"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Wrench, Gift, Users } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Focus",
    description: "Tập trung vào 1 dự án chính, 3 task hàng ngày. Không phân tán, không lạc lối.",
    color: "cyan",
  },
  {
    icon: Wrench,
    title: "Tools",
    description: "3 công cụ cốt lõi: Idea Graph, Project Hub, Time Tracking. Đơn giản nhưng đủ mạnh.",
    color: "purple",
  },
  {
    icon: Gift,
    title: "Free Tier",
    description: "Bắt đầu miễn phí với 3 dự án và 50 nodes. Không giới hạn thời gian dùng thử.",
    color: "success",
  },
];

const foundation = {
  icon: Users,
  title: "Community",
  description: "Cộng đồng solopreneur Việt Nam. Chia sẻ, học hỏi và cùng nhau phát triển.",
};

export function PillarsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return {
          bg: "bg-cyan/10",
          bgHover: "group-hover:bg-cyan/20",
          text: "text-cyan",
          border: "border-cyan/20",
        };
      case "purple":
        return {
          bg: "bg-purple/10",
          bgHover: "group-hover:bg-purple/20",
          text: "text-purple",
          border: "border-purple/20",
        };
      case "success":
        return {
          bg: "bg-success/10",
          bgHover: "group-hover:bg-success/20",
          text: "text-success",
          border: "border-success/20",
        };
      default:
        return {
          bg: "bg-cyan/10",
          bgHover: "group-hover:bg-cyan/20",
          text: "text-cyan",
          border: "border-cyan/20",
        };
    }
  };

  return (
    <section id="pillars" className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            3 trụ cột + 1 nền tảng
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Triết lý của 1nguoi dựa trên 3 trụ cột chính và 1 nền tảng cộng đồng.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const colors = getColorClasses(pillar.color);
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-xl border border-border bg-background-secondary hover:border-border-hover transition-all card-hover group"
              >
                <div className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.bgHover} flex items-center justify-center mb-4 transition-colors`}>
                  <Icon className={`h-7 w-7 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {pillar.title}
                </h3>
                <p className="text-text-secondary">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Foundation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6 rounded-xl border border-border bg-gradient-to-r from-background-secondary to-background-tertiary"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center flex-shrink-0">
              <Users className="h-8 w-8 text-gradient" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {foundation.title} - Nền tảng
              </h3>
              <p className="text-text-secondary">
                {foundation.description}
              </p>
            </div>
            <div className="md:ml-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning/10 text-warning border border-warning/20">
                Coming Soon
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
