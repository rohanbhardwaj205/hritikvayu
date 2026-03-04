"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  LogOut,
  UserCircle,
  Package,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalItems = useCartStore((s) => s.totalItems());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const openSearch = useUIStore((s) => s.openSearch);
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const isActive = (href: string) => {
    if (href.includes("?")) {
      return pathname === href.split("?")[0];
    }
    return pathname === href;
  };

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-white/95 shadow-md backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link
          href="/"
          className={cn(
            "flex-shrink-0 font-display text-2xl font-bold tracking-tight",
            isTransparent ? "text-white" : "text-primary"
          )}
        >
          Vastrayug
        </Link>

        {/* Center: Navigation links (desktop) */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? isTransparent ? "text-white" : "text-primary"
                  : isTransparent ? "text-white/70 hover:text-white" : "text-foreground/70 hover:text-foreground"
              )}
            >
              {link.label}
              {/* Animated underline */}
              {isActive(link.href) ? (
                <motion.span
                  layoutId="navbar-underline"
                  className={cn(
                    "absolute bottom-0 left-3 right-3 h-0.5 rounded-full",
                    isTransparent ? "bg-white" : "bg-primary"
                  )}
                />
              ) : (
                <span className={cn(
                  "absolute bottom-0 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100",
                  isTransparent ? "bg-white/40" : "bg-primary/40"
                )} />
              )}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={openSearch}
            className={cn(
              "rounded-full p-2 transition-colors",
              isTransparent
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
            )}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className={cn(
              "hidden rounded-full p-2 transition-colors sm:inline-flex",
              isTransparent
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
            )}
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <button
            onClick={openDrawer}
            className={cn(
              "relative rounded-full p-2 transition-colors",
              isTransparent
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
            )}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </motion.span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "flex items-center rounded-full p-2 transition-colors",
                isTransparent
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
              )}
              aria-label="User menu"
            >
              {mounted && isAuthenticated && user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                >
                  {mounted && isAuthenticated && user ? (
                    <>
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">
                          {user.full_name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
                        >
                          <UserCircle className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
                        >
                          <Package className="h-4 w-4" />
                          Orders
                        </Link>
                        {(user.role === "admin" ||
                          user.role === "super_admin") && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-1">
                      <Link
                        href="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className={cn(
              "rounded-full p-2 transition-colors lg:hidden",
              isTransparent
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-foreground/70 hover:bg-surface-2 hover:text-foreground"
            )}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
