"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WorkReport } from "@/components/zen";

export default function ZenReportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          <Link
            href="/zen"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Quay lại Zen</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <WorkReport />
        </div>
      </main>
    </div>
  );
}
