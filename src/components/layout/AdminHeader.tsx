"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Store,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

/** Map pathname segments to human-readable breadcrumbs. */
function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let accumulated = "";
  for (const segment of segments) {
    accumulated += `/${segment}`;
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: accumulated });
  }
  return crumbs;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = getBreadcrumbs(pathname);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-admin-border bg-admin-bg px-4 sm:px-6">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-admin-muted transition-colors hover:bg-admin-surface hover:text-admin-text lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Breadcrumbs */}
        <nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-admin-muted/50" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-admin-text">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-admin-muted transition-colors hover:text-admin-text"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Mobile: page title only */}
        <h1 className="text-sm font-medium text-admin-text sm:hidden">
          {breadcrumbs[breadcrumbs.length - 1]?.label || "Admin"}
        </h1>
      </div>

      {/* Right: search, notifications, user dropdown */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden items-center md:flex">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-admin-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 w-52 rounded-lg border border-admin-border bg-admin-surface py-1.5 pl-9 pr-3 text-sm text-admin-text placeholder:text-admin-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 lg:w-64"
            />
          </div>
        </div>

        {/* Notification Bell */}
        <button
          className="relative rounded-lg p-2 text-admin-muted transition-colors hover:bg-admin-surface hover:text-admin-text"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-admin-bg" />
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-admin-surface"
            aria-label="User menu"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-admin-border"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light ring-2 ring-admin-border">
                {user ? getInitials(user.full_name) : "A"}
              </div>
            )}
            <div className="hidden text-left lg:block">
              <p className="text-xs font-medium text-admin-text">
                {user?.full_name || "Admin"}
              </p>
              <p className="text-[10px] capitalize text-admin-muted">
                {user?.role?.replace("_", " ") || "Admin"}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border border-admin-border bg-admin-surface shadow-xl"
              >
                {user && (
                  <div className="border-b border-admin-border px-4 py-3">
                    <p className="text-sm font-semibold text-admin-text">
                      {user.full_name}
                    </p>
                    <p className="truncate text-xs text-admin-muted">
                      {user.email}
                    </p>
                  </div>
                )}

                <div className="py-1">
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
                  >
                    <UserCircle className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-admin-muted transition-colors hover:bg-admin-bg hover:text-admin-text"
                  >
                    <Store className="h-4 w-4" />
                    Back to Store
                  </Link>
                </div>

                <div className="border-t border-admin-border py-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
