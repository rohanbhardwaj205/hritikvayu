"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Heart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  UserCircle,
  Package,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
  exit: {
    x: "-100%",
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
};

export function MobileNav() {
  const pathname = usePathname();
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return pathname === href.split("?")[0];
    }
    return pathname === href;
  };

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 bottom-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="font-display text-xl font-bold text-primary"
              >
                Vastrayug
              </Link>
              <button
                onClick={closeMobileMenu}
                className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-surface hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Utility Links */}
              <div className="mt-6 border-t border-border pt-4">
                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted">
                  Quick Access
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/account/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Cart
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Auth Section */}
            <div className="border-t border-border px-3 py-4">
              {isAuthenticated && user ? (
                <>
                  <div className="mb-3 flex items-center gap-3 px-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.full_name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/account"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account/orders"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </li>
                    {(user.role === "admin" ||
                      user.role === "super_admin") && (
                      <li>
                        <Link
                          href="/admin"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <div className="flex gap-3 px-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMobileMenu}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
