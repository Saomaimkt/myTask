import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskManager - Quản lý Công việc & Ngân sách",
  description: "Hệ thống quản lý công việc, danh sách công việc con và ngân sách dự án thông minh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-text-main flex flex-col md:flex-row min-h-screen`}>
        <Navigation />

        {/* Main Content */}
        <main className="flex-1 px-4 pt-20 pb-24 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
