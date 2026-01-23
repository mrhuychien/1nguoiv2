import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";

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

// Script to prevent theme flash - default to dark
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('1nguoi-theme');
      if (!theme) {
        theme = 'dark';
      }
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.add('no-transitions');
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-text-primary`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
