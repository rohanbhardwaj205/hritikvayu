import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/services/wishlist";

export async function GET() {
  try {
    const user = await requireAuth();
    const wishlist = await getWishlist(user.id);
    return NextResponse.json({ data: wishlist });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch wishlist";
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

    const item = await addToWishlist(user.id, body.productId);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add to wishlist";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await removeFromWishlist(user.id, productId);
    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove from wishlist";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
