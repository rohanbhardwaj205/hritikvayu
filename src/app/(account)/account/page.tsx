"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, MapPin, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ProfileForm } from "@/components/account/ProfileForm";
import { OrderCard } from "@/components/account/OrderCard";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { Order } from "@/types";

const quickLinks = [
  {
    href: "/account/orders",
    label: "My Orders",
    description: "Track and manage your orders",
    icon: Package,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    description: "Manage your delivery addresses",
    icon: MapPin,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    description: "Items you saved for later",
    icon: Heart,
    color: "text-error",
    bg: "bg-error/10",
  },
];

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?page=1&pageSize=3");
      if (res.ok) {
        const data = await res.json();
        setRecentOrders(data.data ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">
          My Account
        </h1>
        <p className="text-sm text-muted mt-1">
          Welcome back, {user?.full_name || "there"}! Manage your profile and
          preferences.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-border-hover"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  link.bg
                )}
              >
                <link.icon className={cn("h-5 w-5", link.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {link.label}
                </p>
                <p className="text-xs text-muted">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Profile Form */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground font-display mb-5">
          Profile Information
        </h2>
        <ProfileForm />
      </Card>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground font-display">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-primary" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <Package className="h-8 w-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No orders yet</p>
            <Link
              href="/products"
              className="text-sm font-medium text-primary hover:underline mt-1 inline-block"
            >
              Start Shopping
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
