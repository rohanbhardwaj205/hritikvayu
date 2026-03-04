"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersChart } from "@/components/admin/OrdersChart";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Order } from "@/types";

interface DashboardData {
  totalRevenue: number;
  previousRevenue: number;
  totalOrders: number;
  previousOrders: number;
  totalCustomers: number;
  previousCustomers: number;
  avgOrderValue: number;
  previousAvgOrderValue: number;
  revenueChart: Array<{ date: string; revenue: number }>;
  ordersChart: Array<{ date: string; orders: number }>;
  recentOrders: Order[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-admin-border bg-admin-surface p-5"
          >
            <Skeleton variant="text" width="60%" className="!bg-admin-border" />
            <Skeleton
              variant="text"
              width="40%"
              height={28}
              className="mt-2 !bg-admin-border"
            />
            <Skeleton variant="text" width="50%" className="mt-3 !bg-admin-border" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
          <Skeleton variant="text" width="40%" className="!bg-admin-border" />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={288}
            className="mt-4 !bg-admin-border"
          />
        </div>
        <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
          <Skeleton variant="text" width="40%" className="!bg-admin-border" />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={288}
            className="mt-4 !bg-admin-border"
          />
        </div>
      </div>

      {/* Recent orders skeleton */}
      <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
        <Skeleton variant="text" width="30%" className="!bg-admin-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width="100%"
            className="mt-3 !bg-admin-border"
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-muted">
          Welcome to your store admin panel.
        </p>
      </div>

      {loading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardStats
            totalRevenue={data.totalRevenue}
            previousRevenue={data.previousRevenue}
            totalOrders={data.totalOrders}
            previousOrders={data.previousOrders}
            totalCustomers={data.totalCustomers}
            previousCustomers={data.previousCustomers}
            avgOrderValue={data.avgOrderValue}
            previousAvgOrderValue={data.previousAvgOrderValue}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart data={data.revenueChart} />
            <OrdersChart data={data.ordersChart} />
          </div>

          <RecentOrders orders={data.recentOrders} />
        </>
      )}
    </div>
  );
}
