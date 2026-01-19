"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const footerLinks = {
  product: {
    title: "Sản phẩm",
    links: [
      { label: "Tính năng", href: "#pillars" },
      { label: "Bảng giá", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  resources: {
    title: "Tài nguyên",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Hướng dẫn", href: "/guides" },
      { label: "API Docs", href: "/docs" },
      { label: "Cộng đồng", href: "/community" },
    ],
  },
  company: {
    title: "Công ty",
    links: [
      { label: "Về chúng tôi", href: "/about" },
      { label: "Liên hệ", href: "/contact" },
      { label: "Điều khoản", href: "/terms" },
      { label: "Bảo mật", href: "/privacy" },
    ],
  },
};

export function Footer() {
  const [year, setYear] = useState(2024); // Default year for SSR

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="font-semibold text-lg text-text-primary">
                1nguoi
              </span>
            </Link>
            <p className="text-sm text-text-secondary mb-4">
              Framework cho Solopreneur Việt Nam.
              Xây dựng business một mình, không cô đơn.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/1nguoicom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/1nguoicom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold text-text-primary mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            &copy; {year} 1nguoi.com. All rights reserved.
          </p>
          <p className="text-sm text-text-muted">
            Made with care for Solopreneurs in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
