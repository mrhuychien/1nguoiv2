"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Bắt đầu hành trình solopreneur",
    features: [
      "3 dự án active",
      "50 nodes trong Idea Graph",
      "Time tracking cơ bản",
      "7 ngày lịch sử data",
    ],
    cta: "Bắt đầu miễn phí",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "9",
    description: "Cho solopreneur nghiêm túc",
    features: [
      "10 dự án active",
      "500 nodes trong Idea Graph",
      "Time tracking nâng cao",
      "30 ngày lịch sử data",
      "Export PDF/CSV",
      "Priority support",
    ],
    cta: "Nâng cấp Pro",
    highlighted: true,
    badge: "Phổ biến",
  },
  {
    name: "Builder",
    price: "19",
    description: "Xây dựng nhiều dự án cùng lúc",
    features: [
      "Unlimited dự án",
      "Unlimited nodes",
      "Time tracking nâng cao",
      "Unlimited lịch sử data",
      "Export PDF/CSV",
      "API access",
      "1-on-1 onboarding",
    ],
    cta: "Liên hệ",
    highlighted: false,
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Giá đơn giản, không ẩn phí
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Bắt đầu miễn phí, nâng cấp khi bạn sẵn sàng. Không cần thẻ tín dụng.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-6 rounded-xl border ${
                plan.highlighted
                  ? "border-cyan bg-gradient-to-b from-cyan/10 to-transparent shadow-glow-cyan"
                  : "border-border bg-background-secondary"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan text-background">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-text-secondary">/tháng</span>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full ${
                      plan.highlighted ? "bg-cyan/20" : "bg-success/20"
                    } flex items-center justify-center`}>
                      <Check className={`h-3 w-3 ${
                        plan.highlighted ? "text-cyan" : "text-success"
                      }`} />
                    </div>
                    <span className="text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
