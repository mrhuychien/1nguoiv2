"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, ListTodo, Clock, AlertCircle } from "lucide-react";

const problems = [
  {
    icon: Brain,
    title: "Ý tưởng rời rạc",
    description: "Ghi chú mọi nơi, từ Notes đến Notion, nhưng không bao giờ kết nối được chúng với nhau.",
  },
  {
    icon: ListTodo,
    title: "Quản lý dự án phức tạp",
    description: "Các công cụ như Jira quá nặng nề cho một người. Trello thì thiếu tính năng theo dõi tiến độ.",
  },
  {
    icon: Clock,
    title: "Không biết thời gian đi đâu",
    description: "Làm việc cả ngày nhưng không biết đã dành bao lâu cho từng dự án.",
  },
  {
    icon: AlertCircle,
    title: "Làm một mình rất khó",
    description: "Không có đồng đội để thảo luận, không có ai review, dễ mất phương hướng.",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-background-secondary" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Solopreneur đang gặp vấn đề gì?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Làm một mình đồng nghĩa với việc phải tự xử lý mọi thứ.
            Nhưng bạn không cần phải làm điều đó một cách lộn xộn.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-xl border border-border bg-background hover:border-border-hover transition-colors group"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
                      <Icon className="h-6 w-6 text-danger" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-text-secondary">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
