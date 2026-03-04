import { createAdminClient } from "@/lib/supabase/admin";
import { ITEMS_PER_PAGE } from "@/constants/config";
import type { Profile, PaginatedResponse } from "@/types";

export type CustomerWithOrderCount = Profile & {
  order_count: number;
  total_spent: number;
};

export async function getCustomers(
  page = 1,
  search?: string
): Promise<PaginatedResponse<CustomerWithOrderCount>> {
  const supabaseAdmin = createAdminClient();

  const pageSize = ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  query = query.range(from, to);

  const { data: profiles, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  // Fetch order counts for each customer
  const customers: CustomerWithOrderCount[] = [];

  for (const profile of profiles ?? []) {
    const { count: orderCount } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    const { data: totalData } = await supabaseAdmin
      .from("orders")
      .select("total")
      .eq("user_id", profile.id)
      .in("status", ["confirmed", "processing", "shipped", "delivered"]);

    const totalSpent = (totalData ?? []).reduce(
      (sum, o) => sum + (o.total ?? 0),
      0
    );

    customers.push({
      ...(profile as Profile),
      order_count: orderCount ?? 0,
      total_spent: totalSpent,
    });
  }

  const total = count ?? 0;

  return {
    data: customers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getCustomerById(
  id: string
): Promise<(CustomerWithOrderCount & { recent_orders: unknown[] }) | null> {
  const supabaseAdmin = createAdminClient();

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    return null;
  }

  // Order count
  const { count: orderCount } = await supabaseAdmin
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", id);

  // Total spent
  const { data: totalData } = await supabaseAdmin
    .from("orders")
    .select("total")
    .eq("user_id", id)
    .in("status", ["confirmed", "processing", "shipped", "delivered"]);

  const totalSpent = (totalData ?? []).reduce(
    (sum, o) => sum + (o.total ?? 0),
    0
  );

  // Recent orders
  const { data: recentOrders } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    ...(profile as Profile),
    order_count: orderCount ?? 0,
    total_spent: totalSpent,
    recent_orders: recentOrders ?? [],
  };
}

export async function toggleBanCustomer(
  id: string,
  isBanned: boolean
): Promise<Profile> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_banned: isBanned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update customer ban status: ${error?.message}`);
  }

  return data as Profile;
}
