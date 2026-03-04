import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ITEMS_PER_PAGE } from "@/constants/config";
import type { Coupon, PaginatedResponse } from "@/types";

export async function getCoupons(
  page = 1
): Promise<PaginatedResponse<Coupon>> {
  const supabaseAdmin = createAdminClient();

  const pageSize = ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabaseAdmin
    .from("coupons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch coupons: ${error.message}`);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as Coupon[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<{
  valid: boolean;
  discount: number;
  coupon: Coupon | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return { valid: false, discount: 0, coupon: null, error: "Invalid coupon code" };
  }

  const now = new Date();

  // Check valid_from
  if (new Date(coupon.valid_from) > now) {
    return { valid: false, discount: 0, coupon: null, error: "Coupon is not yet active" };
  }

  // Check valid_until
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, discount: 0, coupon: null, error: "Coupon has expired" };
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, discount: 0, coupon: null, error: "Coupon usage limit reached" };
  }

  // Check min order value
  if (coupon.min_order_value && orderTotal < coupon.min_order_value) {
    return {
      valid: false,
      discount: 0,
      coupon: null,
      error: `Minimum order value of ${coupon.min_order_value} required`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = Math.round(orderTotal * (coupon.discount_value / 100));
    if (coupon.max_discount) {
      discount = Math.min(discount, coupon.max_discount);
    }
  } else {
    discount = coupon.discount_value;
  }

  // Discount cannot exceed order total
  discount = Math.min(discount, orderTotal);

  return {
    valid: true,
    discount,
    coupon: coupon as Coupon,
  };
}

export async function createCoupon(
  data: Partial<Coupon>
): Promise<Coupon> {
  const supabaseAdmin = createAdminClient();

  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .insert(data)
    .select()
    .single();

  if (error || !coupon) {
    throw new Error(`Failed to create coupon: ${error?.message}`);
  }

  return coupon as Coupon;
}

export async function updateCoupon(
  id: string,
  data: Partial<Coupon>
): Promise<Coupon> {
  const supabaseAdmin = createAdminClient();

  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !coupon) {
    throw new Error(`Failed to update coupon: ${error?.message}`);
  }

  return coupon as Coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete coupon: ${error.message}`);
  }
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("used_count")
    .eq("id", couponId)
    .single();

  if (!coupon) return;

  await supabaseAdmin
    .from("coupons")
    .update({ used_count: coupon.used_count + 1 })
    .eq("id", couponId);
}
