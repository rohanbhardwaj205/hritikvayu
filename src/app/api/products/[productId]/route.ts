import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/products";

type RouteContext = { params: Promise<{ productId: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { productId } = await context.params;
    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const { productId } = await context.params;
    const body = await request.json();

    // Partial validation for updates
    if (body.product) {
      const parsed = productSchema.partial().safeParse(body.product);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Validation failed" },
          { status: 400 }
        );
      }
      body.product = parsed.data;
    }

    const product = await updateProduct(productId, {
      product: body.product,
      images: body.images,
      variants: body.variants,
    });

    return NextResponse.json({ data: product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const { productId } = await context.params;
    await deleteProduct(productId);

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
