import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ITEMS_PER_PAGE } from "@/constants/config";
import type { Review, PaginatedResponse } from "@/types";

const REVIEW_SELECT = `
  *,
  profile:profiles(full_name, avatar_url)
`;

export async function getProductReviews(
  productId: string,
  page = 1
): Promise<PaginatedResponse<Review>> {
  const supabase = await createClient();

  const pageSize = ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" })
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as Review[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function createReview(
  userId: string,
  data: {
    product_id: string;
    rating: number;
    title?: string;
    body?: string;
    order_id?: string;
  }
): Promise<Review> {
  const supabase = await createClient();

  // Check for existing review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", data.product_id)
    .maybeSingle();

  if (existing) {
    throw new Error("You have already reviewed this product");
  }

  // Determine if verified purchase
  let isVerified = false;
  if (data.order_id) {
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id, order:orders!inner(user_id, status)")
      .eq("order.user_id", userId)
      .eq("product_id", data.product_id)
      .eq("order.status", "delivered")
      .limit(1)
      .maybeSingle();

    isVerified = !!orderItem;
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      product_id: data.product_id,
      user_id: userId,
      order_id: data.order_id ?? null,
      rating: data.rating,
      title: data.title ?? null,
      body: data.body ?? null,
      is_verified: isVerified,
      is_approved: true, // Auto-approve; admin can moderate later
    })
    .select(REVIEW_SELECT)
    .single();

  if (error || !review) {
    throw new Error(`Failed to create review: ${error?.message}`);
  }

  // Update product avg_rating and review_count
  await updateProductRatingStats(data.product_id);

  return review as Review;
}

export async function updateReview(
  reviewId: string,
  userId: string,
  data: { rating?: number; title?: string; body?: string }
): Promise<Review> {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select(REVIEW_SELECT)
    .single();

  if (error || !review) {
    throw new Error(`Failed to update review: ${error?.message}`);
  }

  // Update product stats
  await updateProductRatingStats(review.product_id);

  return review as Review;
}

export async function deleteReview(
  reviewId: string,
  userId?: string
): Promise<void> {
  const supabase = await createClient();

  // Get review to find product_id
  const { data: review } = await supabase
    .from("reviews")
    .select("product_id, user_id")
    .eq("id", reviewId)
    .single();

  if (!review) {
    throw new Error("Review not found");
  }

  // Verify ownership if userId provided
  if (userId && review.user_id !== userId) {
    throw new Error("Not authorized to delete this review");
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }

  // Update product stats
  await updateProductRatingStats(review.product_id);
}

export async function moderateReview(
  reviewId: string,
  isApproved: boolean
): Promise<Review> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({
      is_approved: isApproved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select(REVIEW_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to moderate review: ${error?.message}`);
  }

  // Update product stats
  await updateProductRatingStats(data.product_id);

  return data as Review;
}

async function updateProductRatingStats(productId: string): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { data: stats } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (!stats || stats.length === 0) {
    await supabaseAdmin
      .from("products")
      .update({ avg_rating: 0, review_count: 0 })
      .eq("id", productId);
    return;
  }

  const sum = stats.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = Math.round((sum / stats.length) * 10) / 10;

  await supabaseAdmin
    .from("products")
    .update({
      avg_rating: avgRating,
      review_count: stats.length,
    })
    .eq("id", productId);
}
