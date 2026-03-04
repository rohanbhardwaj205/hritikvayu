import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { getProducts, createProduct } from "@/services/products";
import type { ProductFilters } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: ProductFilters = {
      category: searchParams.get("category") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      sizes: searchParams.get("sizes")
        ? searchParams.get("sizes")!.split(",")
        : undefined,
      colors: searchParams.get("colors")
        ? searchParams.get("colors")!.split(",")
        : undefined,
      sort: (searchParams.get("sort") as ProductFilters["sort"]) ?? undefined,
      search: searchParams.get("search") ?? undefined,
      featured: searchParams.has("featured")
        ? searchParams.get("featured") === "true"
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : undefined,
    };

    const result = await getProducts(filters);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const parsed = productSchema.safeParse(body.product ?? body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      product: parsed.data,
      images: body.images,
      variants: body.variants,
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
