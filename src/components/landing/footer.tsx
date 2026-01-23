"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Footer() {
  const [year, setYear] = useState(2024);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-12 border-t border-border bg-background-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="font-semibold text-lg text-text-primary">1nguoi</span>
            </div>
            <p className="text-text-secondary text-sm max-w-md">
              Nền tảng hỗ trợ solopreneur xây dựng và phát triển business với sức mạnh của AI.
              Từ ý tưởng đến sản phẩm, từ một mình đến thành công.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/combatfree" className="text-text-secondary hover:text-cyan transition-colors">
                  AI Free Chat
                </Link>
              </li>
              <li>
                <Link href="/combat" className="text-text-secondary hover:text-cyan transition-colors">
                  Combat AI
                </Link>
              </li>
              <li>
                <Link href="/brainstorm" className="text-text-secondary hover:text-cyan transition-colors">
                  Brainstorm
                </Link>
              </li>
              <li>
                <Link href="/zen" className="text-text-secondary hover:text-cyan transition-colors">
                  Zen Focus
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-cyan transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-cyan transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          {/* Credits */}
          <div className="text-center space-y-2">
            <p className="text-text-secondary text-sm">
              <span className="font-medium text-text-primary">1NGUOI Ecosystem</span> • Vibecode Kit v4.0
            </p>
            <p className="text-text-muted text-sm">
              Bộ công cụ Vibecode Kit 4.0 và phương pháp làm việc Zen Focus được chia sẻ và đồng ý sử dụng bởi{" "}
              <a
                href="https://www.facebook.com/nclamvn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan hover:underline"
              >
                Lâm Nguyễn
              </a>
            </p>
            <p className="text-text-secondary text-sm">
              Created by{" "}
              <a
                href="https://www.facebook.com/mrhuychien"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-cyan hover:underline"
              >
                Nguyễn Huy Chiến
              </a>
            </p>
            <p className="text-text-muted text-xs mt-4">
              &copy; {year} 1nguoi.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
