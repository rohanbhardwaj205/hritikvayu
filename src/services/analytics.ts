import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  customerCount: number;
  averageOrderValue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabaseAdmin = createAdminClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Revenue and order count for current month
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("total")
    .gte("created_at", startOfMonth)
    .in("payment_status", ["paid"]);

  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);
  const orderCount = orders?.length ?? 0;
  const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  // Customer count for current month
  const { count: customerCount } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")
    .gte("created_at", startOfMonth);

  return {
    totalRevenue,
    orderCount,
    customerCount: customerCount ?? 0,
    averageOrderValue,
  };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getRevenueChart(
  days = 30
): Promise<RevenueDataPoint[]> {
  const supabaseAdmin = createAdminClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("total, created_at")
    .gte("created_at", startDate.toISOString())
    .in("payment_status", ["paid"])
    .order("created_at", { ascending: true });

  // Group by date
  const dailyMap = new Map<string, { revenue: number; orders: number }>();

  // Initialize all days
  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const dateStr = date.toISOString().split("T")[0];
    dailyMap.set(dateStr, { revenue: 0, orders: 0 });
  }

  // Fill in order data
  for (const order of orders ?? []) {
    const dateStr = new Date(order.created_at).toISOString().split("T")[0];
    const existing = dailyMap.get(dateStr) ?? { revenue: 0, orders: 0 };
    existing.revenue += order.total;
    existing.orders += 1;
    dailyMap.set(dateStr, existing);
  }

  return Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    revenue: stats.revenue,
    orders: stats.orders,
  }));
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export async function getTopProducts(
  limit = 5
): Promise<TopProduct[]> {
  const supabaseAdmin = createAdminClient();

  const { data: orderItems } = await supabaseAdmin
    .from("order_items")
    .select("product_id, product_name, quantity, total_price, order:orders!inner(payment_status)")
    .eq("order.payment_status", "paid");

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Aggregate by product
  const productMap = new Map<
    string,
    { product_name: string; total_sold: number; total_revenue: number }
  >();

  for (const item of orderItems) {
    const existing = productMap.get(item.product_id) ?? {
      product_name: item.product_name,
      total_sold: 0,
      total_revenue: 0,
    };
    existing.total_sold += item.quantity;
    existing.total_revenue += item.total_price;
    productMap.set(item.product_id, existing);
  }

  return Array.from(productMap.entries())
    .map(([product_id, stats]) => ({
      product_id,
      ...stats,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, limit);
}

export async function getRecentOrders(limit = 10) {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent orders: ${error.message}`);
  }

  return data ?? [];
}
