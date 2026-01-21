"use client";

import { useState, useEffect } from "react";

export function Footer() {
  const [year, setYear] = useState(2024);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 text-center text-text-secondary text-sm border-t border-border">
      <p>1NGUOI Ecosystem • Vibecode Kit v4.0</p>
      <p className="mt-1">Created by Nguyễn Huy Chiến</p>
      <p className="mt-2 text-text-muted">&copy; {year} 1nguoi.com</p>
    </footer>
  );
}
