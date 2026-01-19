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
    <section className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan/20 via-purple/10 to-transparent border border-border p-8 md:p-12 lg:p-16"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Sẵn sàng xây dựng
              <br />
              <span className="text-gradient">một mình, không cô đơn?</span>
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              {user
                ? "Tiếp tục hành trình xây dựng business của bạn."
                : "Tham gia cùng những solopreneur khác đang sử dụng 1nguoi để biến ý tưởng thành hiện thực."}
            </p>
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
              <Button size="xl" variant="outline" asChild>
                <a href="mailto:hello@1nguoi.com">
                  Liên hệ team
                </a>
              </Button>
            </div>
            {!user && (
              <p className="text-sm text-text-muted mt-6">
                Không cần thẻ tín dụng. Bắt đầu trong 30 giây.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
