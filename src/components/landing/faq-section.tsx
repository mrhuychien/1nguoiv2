"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "1nguoi có phải là project management tool không?",
    answer: "Không hoàn toàn. 1nguoi là framework cho solopreneur, tập trung vào việc giúp bạn tổ chức ý tưởng, quản lý 1 dự án chính, và theo dõi thời gian. Chúng tôi không cố gắng thay thế Jira hay Asana - những công cụ đó được thiết kế cho team.",
  },
  {
    question: "Tại sao giới hạn chỉ 1 Focus Project?",
    answer: "Đây là triết lý cốt lõi của 1nguoi: làm một mình đồng nghĩa với việc bạn không có bandwidth để làm nhiều thứ cùng lúc. Giới hạn này giúp bạn focus vào điều quan trọng nhất, thay vì phân tán.",
  },
  {
    question: "Dữ liệu của tôi có an toàn không?",
    answer: "Có. Chúng tôi sử dụng Supabase với Row Level Security, nghĩa là chỉ bạn mới có thể truy cập dữ liệu của mình. Không ai khác, kể cả chúng tôi, có thể xem dữ liệu của bạn.",
  },
  {
    question: "Có thể export dữ liệu không?",
    answer: "Gói Pro và Builder hỗ trợ export PDF/CSV. Chúng tôi tin rằng dữ liệu của bạn thuộc về bạn, nên export là tính năng quan trọng.",
  },
  {
    question: "Có mobile app không?",
    answer: "Hiện tại chúng tôi tập trung vào web app responsive. Mobile app sẽ được phát triển trong tương lai khi có đủ nhu cầu từ cộng đồng.",
  },
  {
    question: "Build in Public là gì?",
    answer: "Đây là tính năng cộng đồng sắp ra mắt, cho phép bạn chia sẻ hành trình xây dựng business với những solopreneur khác. Bạn có thể post milestones, bài học, và nhận feedback từ cộng đồng.",
  },
];

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-border last:border-none">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left hover:bg-background-secondary/50 transition-colors rounded-lg px-4 -mx-4"
      >
        <span className="font-medium text-text-primary pr-4">{question}</span>
        <ChevronDown className={cn(
          "h-5 w-5 text-text-secondary flex-shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-text-secondary pb-5 px-4 -mx-4">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-background-secondary" ref={ref}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Câu hỏi thường gặp
          </h2>
          <p className="text-lg text-text-secondary">
            Những thắc mắc phổ biến về 1nguoi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-background rounded-xl border border-border p-6"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
