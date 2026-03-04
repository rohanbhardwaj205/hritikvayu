import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  syncCart,
} from "@/services/cart";

export async function GET() {
  try {
    const user = await requireAuth();
    const cart = await getCart(user.id);
    return NextResponse.json({ data: cart });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch cart";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const item = await addToCart(
      user.id,
      body.productId,
      body.variantId ?? null,
      body.quantity ?? 1
    );

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add to cart";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Bulk sync
    if (body.items && Array.isArray(body.items)) {
      const cart = await syncCart(user.id, body.items);
      return NextResponse.json({ data: cart });
    }

    // Single item update
    if (!body.itemId || body.quantity === undefined) {
      return NextResponse.json(
        { error: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    const item = await updateCartQuantity(user.id, body.itemId, body.quantity);
    return NextResponse.json({ data: item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = request.nextUrl;
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await removeFromCart(user.id, itemId);
    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove from cart";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
