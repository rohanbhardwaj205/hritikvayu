import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getDashboardStats,
  getRevenueChart,
  getTopProducts,
  getRecentOrders,
} from "@/services/analytics";

export async function GET() {
  try {
    await requireAdmin();

    const [stats, revenueChart, topProducts, recentOrders] = await Promise.all([
      getDashboardStats(),
      getRevenueChart(30),
      getTopProducts(5),
      getRecentOrders(10),
    ]);

    return NextResponse.json({
      data: {
        stats,
        revenueChart,
        topProducts,
        recentOrders,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch dashboard data";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
