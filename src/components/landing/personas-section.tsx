"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Code, Palette } from "lucide-react";

const personas = [
  {
    icon: Briefcase,
    title: "Domain Expert",
    subtitle: "Chuyên gia chuyển nghề",
    description: "Bạn có kiến thức chuyên môn sâu và muốn biến nó thành sản phẩm số. Có thể là course, ebook, hoặc SaaS.",
    painPoints: [
      "Không biết bắt đầu từ đâu",
      "Quá nhiều ý tưởng, thiếu focus",
      "Cần framework để tổ chức",
    ],
    color: "cyan",
  },
  {
    icon: Code,
    title: "Developer",
    subtitle: "Lập trình viên khởi nghiệp",
    description: "Bạn code giỏi nhưng làm side project một mình rất khó quản lý. Cần công cụ đơn giản, không overkill.",
    painPoints: [
      "Side project không bao giờ ship",
      "Scope creep liên tục",
      "Không track được thời gian",
    ],
    color: "purple",
  },
  {
    icon: Palette,
    title: "Freelancer",
    subtitle: "Người làm tự do",
    description: "Bạn làm nhiều dự án cùng lúc cho nhiều khách hàng. Cần công cụ để không bỏ sót task nào.",
    painPoints: [
      "Juggle nhiều dự án",
      "Không biết dành bao lâu cho ai",
      "Thiếu overview tổng thể",
    ],
    color: "success",
  },
];

export function PersonasSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return {
          bg: "bg-cyan/10",
          border: "border-cyan/20",
          text: "text-cyan",
          dot: "bg-cyan",
        };
      case "purple":
        return {
          bg: "bg-purple/10",
          border: "border-purple/20",
          text: "text-purple",
          dot: "bg-purple",
        };
      case "success":
        return {
          bg: "bg-success/10",
          border: "border-success/20",
          text: "text-success",
          dot: "bg-success",
        };
      default:
        return {
          bg: "bg-cyan/10",
          border: "border-cyan/20",
          text: "text-cyan",
          dot: "bg-cyan",
        };
    }
  };

  return (
    <section className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Ai nên dùng 1nguoi?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            3 nhóm người dùng chính mà chúng tôi thiết kế sản phẩm cho.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            const colors = getColorClasses(persona.color);
            return (
              <motion.div
                key={persona.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-6 rounded-xl border ${colors.border} bg-background-secondary card-hover`}
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {persona.title}
                    </h3>
                    <p className={`text-sm ${colors.text}`}>
                      {persona.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary mb-4">
                  {persona.description}
                </p>

                {/* Pain points */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                    Vấn đề thường gặp
                  </p>
                  <ul className="space-y-2">
                    {persona.painPoints.map((point, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
