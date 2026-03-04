import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { getOrders, createOrder } from "@/services/orders";
import { getCart, clearCart } from "@/services/cart";
import { validateCoupon, incrementCouponUsage } from "@/services/coupons";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;

    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;
    const status = searchParams.get("status") ?? undefined;

    // Admin can view all orders, customers only see their own
    const userId = isAdmin(user.role) ? undefined : user.id;

    const result = await getOrders(userId, page, status);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.address) {
      return NextResponse.json(
        { error: "Shipping address is required" },
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
    if (body.couponCode) {
      // Calculate subtotal for validation
      const subtotal = cartItems.reduce((sum, item) => {
        const price =
          item.variant?.price_override ?? item.product?.base_price ?? 0;
        return sum + price * item.quantity;
      }, 0);

      const couponResult = await validateCoupon(body.couponCode, subtotal);

      if (!couponResult.valid) {
        return NextResponse.json(
          { error: couponResult.error ?? "Invalid coupon" },
          { status: 400 }
        );
      }

      coupon = couponResult.coupon;
    }

    const order = await createOrder(
      user.id,
      body.address,
      cartItems,
      coupon,
      body.razorpayOrderId
    );

    // Increment coupon usage
    if (coupon) {
      await incrementCouponUsage(coupon.id);
    }

    // Clear cart after successful order
    await clearCart(user.id);

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
