import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-be-vietnam",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-jetbrains",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "1nguoi - Framework cho Solopreneur Việt Nam",
  description: "Nền tảng giúp solopreneur Việt Nam xây dựng business một mình với Idea Graph, Project Hub và Time Tracking.",
  keywords: ["solopreneur", "startup", "vietnam", "productivity", "idea management", "project management"],
  authors: [{ name: "1nguoi.com" }],
  openGraph: {
    title: "1nguoi - Framework cho Solopreneur Việt Nam",
    description: "Nền tảng giúp solopreneur Việt Nam xây dựng business một mình",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
