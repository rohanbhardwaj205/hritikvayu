import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { getCart } from "@/services/cart";
import { validateCoupon } from "@/services/coupons";
import {
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_COST,
  GST_PERCENTAGE,
  CURRENCY,
} from "@/constants/config";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Get cart items
    const cartItems = await getCart(user.id);

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      const price =
        item.variant?.price_override ?? item.product?.base_price ?? 0;
      subtotal += price * item.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (body.couponCode) {
      const couponResult = await validateCoupon(body.couponCode, subtotal);
      if (couponResult.valid) {
        discountAmount = couponResult.discount;
      }
    }

    const afterDiscount = subtotal - discountAmount;

    // Shipping
    const shippingCost =
      afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;

    // Tax
    const taxAmount = Math.round(afterDiscount * (GST_PERCENTAGE / 100));

    // Total (in paise)
    const total = afterDiscount + shippingCost + taxAmount;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total,
      currency: CURRENCY,
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email,
      },
    });

    return NextResponse.json({
      data: {
        orderId: razorpayOrder.id,
        amount: total,
        currency: CURRENCY,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        breakdown: {
          subtotal,
          discount: discountAmount,
          shipping: shippingCost,
          tax: taxAmount,
          total,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
