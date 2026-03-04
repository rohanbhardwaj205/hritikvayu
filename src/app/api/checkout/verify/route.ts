import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getCart, clearCart } from "@/services/cart";
import { createOrder } from "@/services/orders";
import { validateCoupon, incrementCouponUsage } from "@/services/coupons";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      couponCode,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification details are required" },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItems = await getCart(user.id);

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate coupon if provided
    let coupon = null;
    if (couponCode) {
      const subtotal = cartItems.reduce((sum, item) => {
        const price =
          item.variant?.price_override ?? item.product?.base_price ?? 0;
        return sum + price * item.quantity;
      }, 0);

      const couponResult = await validateCoupon(couponCode, subtotal);
      if (couponResult.valid) {
        coupon = couponResult.coupon;
      }
    }

    // Create the order
    const order = await createOrder(
      user.id,
      address,
      cartItems,
      coupon,
      razorpay_order_id
    );

    // Update order with payment info
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Increment coupon usage
    if (coupon) {
      await incrementCouponUsage(coupon.id);
    }

    // Clear cart
    await clearCart(user.id);

    // Return updated order
    const { data: updatedOrder } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", order.id)
      .single();

    return NextResponse.json({ data: updatedOrder ?? order }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to verify payment";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
