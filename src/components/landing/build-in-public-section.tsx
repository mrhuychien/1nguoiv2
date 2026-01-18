"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Rocket, BookOpen, Trophy, MessageCircle } from "lucide-react";

const posts = [
  {
    type: "milestone",
    icon: Trophy,
    author: "Minh",
    avatar: "M",
    content: "Vừa launch MVP sau 3 tuần build! 100 users đầu tiên.",
    time: "2 giờ trước",
    color: "warning",
  },
  {
    type: "lesson",
    icon: BookOpen,
    author: "Linh",
    avatar: "L",
    content: "Bài học: Không nên build tính năng chưa ai yêu cầu. Lãng phí 2 tuần.",
    time: "5 giờ trước",
    color: "purple",
  },
  {
    type: "progress",
    icon: Rocket,
    author: "Hùng",
    avatar: "H",
    content: "Tuần này focus vào landing page. Đã hoàn thành 70%, còn copy cần polish.",
    time: "1 ngày trước",
    color: "cyan",
  },
];

export function BuildInPublicSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getColorClasses = (color: string) => {
    switch (color) {
      case "warning":
        return "bg-warning/10 text-warning";
      case "purple":
        return "bg-purple/10 text-purple";
      case "cyan":
        return "bg-cyan/10 text-cyan";
      default:
        return "bg-cyan/10 text-cyan";
    }
  };

  return (
    <section className="py-24 bg-background-secondary" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning/10 text-warning border border-warning/20 mb-4">
            Coming Soon
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Build in Public
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Chia sẻ hành trình, học từ cộng đồng. Solopreneur không có nghĩa là cô đơn.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {posts.map((post, index) => {
            const Icon = post.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-5 rounded-xl border border-border bg-background hover:border-border-hover transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-white font-medium">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{post.author}</p>
                      <p className="text-xs text-text-muted">{post.time}</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${getColorClasses(post.color)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Content */}
                <p className="text-text-secondary">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <button className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>Bình luận</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
