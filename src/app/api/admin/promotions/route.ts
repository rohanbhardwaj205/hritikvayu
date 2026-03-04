import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/services/promotions";

export async function GET() {
  try {
    await requireAdmin();

    const promotions = await getAllPromotions();
    return NextResponse.json({ data: promotions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch promotions";
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

    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: "Title and image URL are required" },
        { status: 400 }
      );
    }

    const promotion = await createPromotion(body);
    return NextResponse.json({ data: promotion }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create promotion";
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
        { error: "Promotion ID is required" },
        { status: 400 }
      );
    }

    const { id, ...data } = body;
    const promotion = await updatePromotion(id, data);

    return NextResponse.json({ data: promotion });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update promotion";
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
        { error: "Promotion ID is required" },
        { status: 400 }
      );
    }

    await deletePromotion(id);
    return NextResponse.json({ message: "Promotion deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete promotion";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
