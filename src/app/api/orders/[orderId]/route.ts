import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { getOrderById, updateOrderStatus } from "@/services/orders";
import type { OrderStatus } from "@/types";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await requireAuth();
    const { orderId } = await context.params;

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Customers can only view their own orders
    if (!isAdmin(user.role) && order.user_id !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch order";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const { orderId } = await context.params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(
      orderId,
      body.status as OrderStatus,
      {
        tracking_number: body.tracking_number,
        tracking_url: body.tracking_url,
      }
    );

    return NextResponse.json({ data: order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
