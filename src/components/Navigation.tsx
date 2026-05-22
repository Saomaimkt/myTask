"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, Wallet } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
    colorClass: "text-primary",
    activeClass: "bg-primary/10 text-primary border-primary",
  },
  {
    href: "/tasks",
    label: "Công việc",
    icon: ListTodo,
    colorClass: "text-secondary",
    activeClass: "bg-secondary/10 text-secondary border-secondary",
  },
  {
    href: "/categories",
    label: "Hạng mục",
    icon: Wallet,
    colorClass: "text-accent",
    activeClass: "bg-accent/10 text-accent border-accent",
  },
];

export default function Navigation() {
  const pathname = usePathname();

  // Helper to check if item is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-border flex-col h-screen sticky top-0">
        <div className="p-6">
          <Link href="/">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary cursor-pointer">
              TaskManager
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border border-transparent transition-all duration-200 ${
                  active
                    ? `${item.activeClass} font-semibold shadow-sm`
                    : "hover:bg-surface/50 text-text-muted hover:text-text-main"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "" : item.colorClass}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Top Header - Mobile */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-border fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md">
        <Link href="/">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            TaskManager
          </h1>
        </Link>
      </header>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden flex items-center justify-around fixed bottom-0 left-0 w-full h-16 glass-panel border-t border-border z-40 bg-background/85 backdrop-blur-lg px-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
                active
                  ? `${item.colorClass} font-semibold scale-105`
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
