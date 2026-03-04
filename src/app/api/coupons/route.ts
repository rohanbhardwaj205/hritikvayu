import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { couponSchema } from "@/lib/validations";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/services/coupons";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;

    const result = await getCoupons(page);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch coupons";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const coupon = await createCoupon(parsed.data);
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create coupon";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const { id, ...data } = body;
    const coupon = await updateCoupon(id, data);

    return NextResponse.json({ data: coupon });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update coupon";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    await deleteCoupon(id);
    return NextResponse.json({ message: "Coupon deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete coupon";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
