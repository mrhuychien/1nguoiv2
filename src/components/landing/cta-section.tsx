"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" ref={ref}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan/20 via-purple/20 to-pink-500/20 border border-border p-8 md:p-12"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4">
              <span className="text-gradient">1 NGƯỜI</span> = Đủ để tạo ra sản phẩm
            </h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Hệ sinh thái 1NGUOI cung cấp đầy đủ công cụ và quy trình để một cá nhân
              đi từ ý tưởng → sản phẩm → thị trường, với sự hỗ trợ của AI tại mỗi bước.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
              <span className="bg-cyan/20 text-cyan px-4 py-2 rounded-full">🧠 Think with AI</span>
              <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full">⚙️ Build with AI</span>
              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full">🚀 Launch with Strategy</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="xl" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Đi tới Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="xl" asChild>
                  <Link href="/signup">
                    Bắt đầu miễn phí
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
