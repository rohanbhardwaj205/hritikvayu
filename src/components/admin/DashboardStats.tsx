"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number;
  previousValue: number;
  format: "currency" | "number" | "decimal";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

interface DashboardStatsProps {
  totalRevenue: number;
  previousRevenue: number;
  totalOrders: number;
  previousOrders: number;
  totalCustomers: number;
  previousCustomers: number;
  avgOrderValue: number;
  previousAvgOrderValue: number;
}

function AnimatedNumber({
  value,
  format,
}: {
  value: number;
  format: "currency" | "number" | "decimal";
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value == null || isNaN(value)) return;
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  if (format === "currency") {
    return <span>{formatPrice(displayed ?? 0)}</span>;
  }
  if (format === "decimal") {
    return <span>{formatPrice(displayed ?? 0)}</span>;
  }
  return <span>{(displayed ?? 0).toLocaleString("en-IN")}</span>;
}

function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function DashboardStats({
  totalRevenue,
  previousRevenue,
  totalOrders,
  previousOrders,
  totalCustomers,
  previousCustomers,
  avgOrderValue,
  previousAvgOrderValue,
}: DashboardStatsProps) {
  const stats: StatCard[] = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      previousValue: previousRevenue,
      format: "currency",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      previousValue: previousOrders,
      format: "number",
      icon: ShoppingCart,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      previousValue: previousCustomers,
      format: "number",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Avg Order Value",
      value: avgOrderValue,
      previousValue: previousAvgOrderValue,
      format: "decimal",
      icon: TrendingUp,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const change = getPercentageChange(stat.value, stat.previousValue);
        const isPositive = change >= 0;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="rounded-xl border border-admin-border bg-admin-surface p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-admin-muted">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-admin-text">
                  <AnimatedNumber value={stat.value} format={stat.format} />
                </p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  stat.bgColor
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-admin-muted">vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
