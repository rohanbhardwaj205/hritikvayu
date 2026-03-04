"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  Ticket,
  Megaphone,
  Warehouse,
  Star,
  Settings,
  ChevronDown,
  Plus,
  List,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    icon: ShoppingBag,
    children: [
      { href: "/admin/products", label: "All Products", icon: List },
      { href: "/admin/products/new", label: "Add New", icon: Plus },
    ],
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: Package,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Ticket,
  },
  {
    href: "/admin/promotions",
    label: "Promotions",
    icon: Megaphone,
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: Warehouse,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    adminOnly: true,
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Products"]);

  const isSuperAdmin = user?.role === "super_admin";

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const isChildActive = (item: NavItem) => {
    return item.children?.some((child) => isActive(child.href)) || false;
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isSuperAdmin) return false;
    return true;
  });

  const sidebarContent = (
    <div className="flex h-full flex-col bg-admin-bg">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
        <Link
          href="/admin"
          className="font-display text-xl font-bold text-white"
        >
          Vastrayug
          <span className="ml-1.5 text-xs font-normal text-admin-muted">
            Admin
          </span>
        </Link>
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-admin-muted transition-colors hover:bg-admin-surface hover:text-admin-text lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            if (item.children) {
              const expanded = expandedSections.includes(item.label);
              const childActive = isChildActive(item);

              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleSection(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      childActive
                        ? "bg-admin-surface text-white"
                        : "text-admin-muted hover:bg-admin-surface hover:text-admin-text"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-1 space-y-1 border-l border-admin-border pl-3">
                          {item.children.map((child) => {
                            const active = isActive(child.href);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                                    active
                                      ? "bg-primary/20 font-medium text-primary-light"
                                      : "text-admin-muted hover:bg-admin-surface hover:text-admin-text"
                                  )}
                                >
                                  <child.icon className="h-3.5 w-3.5 flex-shrink-0" />
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </div>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            const active = isActive(item.href!);

            return (
              <li key={item.label}>
                <Link
                  href={item.href!}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/20 text-primary-light"
                      : "text-admin-muted hover:bg-admin-surface hover:text-admin-text"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  {item.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-light" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: Back to Store */}
      <div className="border-t border-admin-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-admin-muted transition-colors hover:bg-admin-surface hover:text-admin-text"
        >
          <ShoppingBag className="h-4 w-4" />
          Back to Store
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-admin-border lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && onClose && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 z-40 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
