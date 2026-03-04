import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, getServerUser } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { reviewSchema } from "@/lib/validations";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  moderateReview,
} from "@/services/reviews";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;

    const result = await getProductReviews(productId, page);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const review = await createReview(user.id, {
      product_id: parsed.data.product_id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      order_id: body.order_id,
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create review";

    let status = 500;
    if (message.includes("Authentication")) status = 401;
    else if (message.includes("already reviewed")) status = 409;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (!body.reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Admin moderation
    if (isAdmin(user.role) && body.is_approved !== undefined) {
      const review = await moderateReview(body.reviewId, body.is_approved);
      return NextResponse.json({ data: review });
    }

    // User updating own review
    const review = await updateReview(body.reviewId, user.id, {
      rating: body.rating,
      title: body.title,
      body: body.body,
    });

    return NextResponse.json({ data: review });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update review";
    const status = message.includes("Authentication") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Admin can delete any review; users can delete their own
    const userId = isAdmin(user.role) ? undefined : user.id;
    await deleteReview(reviewId, userId);

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete review";

    let status = 500;
    if (message.includes("Authentication")) status = 401;
    else if (message.includes("Not authorized")) status = 403;
    else if (message.includes("not found")) status = 404;

    return NextResponse.json({ error: message }, { status });
  }
}
