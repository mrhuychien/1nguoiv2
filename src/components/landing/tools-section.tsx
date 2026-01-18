"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Lightbulb, LayoutDashboard, Timer, ArrowRight } from "lucide-react";

const tools = [
  {
    icon: Lightbulb,
    title: "Idea Graph",
    description: "Vẽ sơ đồ ý tưởng với nodes và links. Nhìn thấy bức tranh tổng thể của business.",
    features: ["Tạo node bằng double-click", "6 màu sắc cho phân loại", "Zoom & Pan tự do"],
    color: "cyan",
    step: 1,
  },
  {
    icon: LayoutDashboard,
    title: "Project Hub",
    description: "Dashboard quản lý dự án với Focus Mode. Chỉ 1 dự án chính, tối đa 3 active.",
    features: ["Focus Project nổi bật", "Daily Focus 3 tasks", "Progress tracking"],
    color: "purple",
    step: 2,
  },
  {
    icon: Timer,
    title: "Time Tracking",
    description: "Theo dõi thời gian làm việc cho từng dự án. Biết chính xác bạn đã làm gì.",
    features: ["Start/Stop timer", "Báo cáo theo ngày", "Gắn với project"],
    color: "success",
    step: 3,
  },
];

export function ToolsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return "from-cyan/20 to-cyan/5 border-cyan/30";
      case "purple":
        return "from-purple/20 to-purple/5 border-purple/30";
      case "success":
        return "from-success/20 to-success/5 border-success/30";
      default:
        return "from-cyan/20 to-cyan/5 border-cyan/30";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "cyan":
        return "text-cyan";
      case "purple":
        return "text-purple";
      case "success":
        return "text-success";
      default:
        return "text-cyan";
    }
  };

  return (
    <section id="tools" className="py-24 bg-background-secondary" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            3 công cụ, 1 workflow
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Từ ý tưởng đến thực thi, tất cả trong một quy trình mượt mà.
          </p>
        </motion.div>

        {/* Workflow visualization */}
        <div className="relative">
          {/* Connection lines (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan via-purple to-success transform -translate-y-1/2 z-0" />

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className={`relative p-6 rounded-xl border bg-gradient-to-b ${getColorClasses(tool.color)} bg-background card-hover`}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                    <span className="text-sm font-bold text-gradient">{tool.step}</span>
                  </div>

                  {/* Icon */}
                  <div className="mt-2 mb-4">
                    <Icon className={`h-10 w-10 ${getIconColor(tool.color)}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                        <div className={`w-1.5 h-1.5 rounded-full ${getIconColor(tool.color).replace('text-', 'bg-')}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Arrow (not on last item) */}
                  {index < tools.length - 1 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-background-secondary rounded-full items-center justify-center border border-border z-20">
                      <ArrowRight className="h-4 w-4 text-text-secondary" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
