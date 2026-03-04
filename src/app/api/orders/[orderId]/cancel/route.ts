import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { cancelOrder } from "@/services/orders";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await requireAuth();
    const { orderId } = await context.params;
    const body = await request.json().catch(() => ({}));

    // Admin can cancel any order; customers can only cancel their own
    const userId = isAdmin(user.role) ? undefined : user.id;

    const order = await cancelOrder(orderId, userId, body.reason);

    return NextResponse.json({ data: order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel order";

    let status = 500;
    if (message.includes("Authentication")) status = 401;
    else if (message.includes("Not authorized")) status = 403;
    else if (message.includes("not found")) status = 404;
    else if (message.includes("cannot be cancelled")) status = 400;

    return NextResponse.json({ error: message }, { status });
  }
}
