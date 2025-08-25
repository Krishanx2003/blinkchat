"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Filter,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
// import { ModeToggle } from "@/components/mode-toggle";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const navigation: NavigationItem[] = [
  { name: "Chats", href: "/chat", icon: MessageCircle, count: 5 },
  { name: "Filtered", href: "/filtered-chat", icon: Filter, count: 2 },
  { name: "Stories", href: "/blog", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0  bg-background/80 backdrop-blur-xlz-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col h-screen transition-all duration-300 ease-in-out z-50",
          "bg-white dark:bg-[#0f1115] border-[#E5E7EB] dark:border-[#2b2f36]",
          isCollapsed ? "w-16" : "w-64",
          "fixed lg:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "border-r shadow-sm"
        )}
        style={{ fontFamily: '"Inter", sans-serif' }}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-[#E5E7EB] dark:border-[#2b2f36] bg-white/90 dark:bg-[#0f1115]">
          <div className="flex items-center gap-3">
            <Image
              src="/blinkchat.jpg"
              alt="TingleTalk Logo"
              width={36}
              height={36}
              className={cn("rounded-lg", isCollapsed ? "w-8 h-8" : "w-9 h-9")}
              priority
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg font-semibold text-[#111827] dark:text-white">
                  TingleTalk
                </h1>
                <p className="text-xs font-medium text-[#6B7280] dark:text-[#9ca3af]">
                  Anonymous & Free
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-[#FCE7F3] text-[#DB2777] dark:bg-[#3b1d2e] dark:text-[#ff70a6]"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] dark:text-[#9ca3af] dark:hover:bg-[#1f2937] dark:hover:text-white",
                  isCollapsed ? "justify-center px-2" : ""
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-[#DB2777] dark:text-[#ff70a6]"
                      : "text-[#6B7280] group-hover:text-[#111827] dark:text-[#9ca3af] dark:group-hover:text-white"
                  )}
                />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive
                          ? "text-[#DB2777] dark:text-[#ff70a6]"
                          : "dark:text-[#e5e7eb]"
                      )}
                    >
                      {item.name}
                    </span>
                    {item.count !== undefined && (
                      <div
                        className={cn(
                          "px-2 py-0.5 text-xs font-semibold rounded-full",
                          isActive
                            ? "bg-[#DB2777]/20 text-[#DB2777] dark:bg-[#ff70a6]/20 dark:text-[#ff70a6]"
                            : "bg-[#E5E7EB] text-[#6B7280] dark:bg-[#374151] dark:text-[#9ca3af]"
                        )}
                      >
                        {item.count}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#E5E7EB] dark:border-[#2b2f36] bg-white/90 dark:bg-[#0f1115]">
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "flex-col space-y-2" : ""
            )}
          >
            {/* ✅ Theme Toggle */}
            <ModeToggle />

            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "hidden lg:flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] dark:text-[#9ca3af] dark:hover:bg-[#1f2937] dark:hover:text-white",
                isCollapsed ? "w-full" : ""
              )}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg transition-all duration-200 bg-white dark:bg-[#0f1115] text-[#111827] dark:text-white border border-[#E5E7EB] dark:border-[#2b2f36]"
        aria-label="Toggle menu"
      >
        <div className="relative w-5 h-5">
          <span
            className={cn(
              "absolute top-0 left-0 w-full h-0.5 rounded-full transition-all duration-200 bg-[#111827] dark:bg-white",
              isMobileOpen ? "rotate-45 top-2" : ""
            )}
          />
          <span
            className={cn(
              "absolute top-2 left-0 w-full h-0.5 rounded-full transition-all duration-200 bg-[#111827] dark:bg-white",
              isMobileOpen ? "opacity-0" : ""
            )}
          />
          <span
            className={cn(
              "absolute top-4 left-0 w-full h-0.5 rounded-full transition-all duration-200 bg-[#111827] dark:bg-white",
              isMobileOpen ? "-rotate-45 top-2" : ""
            )}
          />
        </div>
      </button>
    </>
  );
}
