import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, ListTodo, Wallet } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task & Budget Manager",
  description: "Quản lý công việc và ngân sách hiệu quả",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-background text-text-main flex min-h-screen`}>
        {/* Sidebar */}
        <aside className="w-64 glass-panel border-r border-border flex flex-col h-screen sticky top-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              TaskManager
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span>Tổng quan</span>
            </Link>
            <Link href="/tasks" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors">
              <ListTodo className="w-5 h-5 text-secondary" />
              <span>Công việc</span>
            </Link>
            <Link href="/categories" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface transition-colors">
              <Wallet className="w-5 h-5 text-accent" />
              <span>Hạng mục & Ngân sách</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
