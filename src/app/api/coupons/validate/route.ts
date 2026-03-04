import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { validateCoupon } from "@/services/coupons";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    if (!body.code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!body.orderTotal && body.orderTotal !== 0) {
      return NextResponse.json(
        { error: "Order total is required" },
        { status: 400 }
      );
    }

    const result = await validateCoupon(body.code, body.orderTotal);

    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to validate coupon";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
