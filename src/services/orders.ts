import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ITEMS_PER_PAGE,
  DEFAULT_SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  GST_PERCENTAGE,
} from "@/constants/config";
import type { Order, CartItem, Coupon, PaginatedResponse, OrderStatus } from "@/types";

const ORDER_SELECT = `
  *,
  items:order_items(*)
`;

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VY-${timestamp}-${random}`;
}

export async function getOrders(
  userId?: string,
  page = 1,
  status?: string
): Promise<PaginatedResponse<Order>> {
  const supabase = await createClient();

  const pageSize = ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as Order[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Order;
}

export async function createOrder(
  userId: string,
  addressData: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  },
  cartItems: CartItem[],
  coupon?: Coupon | null,
  razorpayOrderId?: string
): Promise<Order> {
  const supabaseAdmin = createAdminClient();

  // Calculate totals
  let subtotal = 0;
  const orderItems = cartItems.map((item) => {
    const unitPrice =
      item.variant?.price_override ?? item.product?.base_price ?? 0;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product?.name ?? "Unknown Product",
      variant_label:
        item.variant
          ? [item.variant.size, item.variant.color].filter(Boolean).join(" / ")
          : null,
      sku: item.variant?.sku ?? null,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    };
  });

  // Calculate discount
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === "percentage") {
      discountAmount = Math.round(subtotal * (coupon.discount_value / 100));
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount);
      }
    } else {
      discountAmount = coupon.discount_value;
    }
  }

  // Shipping
  const afterDiscount = subtotal - discountAmount;
  const shippingCost =
    afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;

  // Tax
  const taxAmount = Math.round(afterDiscount * (GST_PERCENTAGE / 100));

  // Total
  const total = afterDiscount + shippingCost + taxAmount;

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      user_id: userId,
      status: "pending",
      subtotal,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      total,
      coupon_id: coupon?.id ?? null,
      coupon_code: coupon?.code ?? null,
      shipping_name: addressData.full_name,
      shipping_phone: addressData.phone,
      shipping_line1: addressData.address_line1,
      shipping_line2: addressData.address_line2 ?? null,
      shipping_city: addressData.city,
      shipping_state: addressData.state,
      shipping_pincode: addressData.pincode,
      shipping_country: addressData.country,
      payment_method: "razorpay",
      payment_status: "pending",
      razorpay_order_id: razorpayOrderId ?? null,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  // Insert order items
  const itemsToInsert = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // Decrement stock for each variant
  for (const item of cartItems) {
    if (item.variant_id) {
      const { error: stockError } = await supabaseAdmin.rpc(
        "decrement_stock",
        {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        }
      );

      // If RPC doesn't exist, fall back to manual update
      if (stockError) {
        const { data: variant } = await supabaseAdmin
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          await supabaseAdmin
            .from("product_variants")
            .update({ stock: Math.max(0, variant.stock - item.quantity) })
            .eq("id", item.variant_id);
        }
      }
    }
  }

  // Return order with items
  const { data: fullOrder } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", order.id)
    .single();

  return (fullOrder ?? order) as Order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  tracking?: { tracking_number?: string; tracking_url?: string }
): Promise<Order> {
  const supabaseAdmin = createAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "shipped") {
    updateData.shipped_at = new Date().toISOString();
  }
  if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString();
  }

  if (tracking?.tracking_number) {
    updateData.tracking_number = tracking.tracking_number;
  }
  if (tracking?.tracking_url) {
    updateData.tracking_url = tracking.tracking_url;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select(ORDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to update order status: ${error?.message}`);
  }

  return data as Order;
}

export async function cancelOrder(
  orderId: string,
  userId?: string,
  reason?: string
): Promise<Order> {
  const supabaseAdmin = createAdminClient();

  // Verify ownership if userId provided
  if (userId) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("user_id, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.user_id !== userId) {
      throw new Error("Not authorized to cancel this order");
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      throw new Error("Order cannot be cancelled at this stage");
    }
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select(ORDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to cancel order: ${error?.message}`);
  }

  return data as Order;
}
