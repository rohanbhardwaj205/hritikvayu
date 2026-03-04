import { createClient } from "@/lib/supabase/server";
import type { WishlistItem } from "@/types";

const WISHLIST_SELECT = `
  *,
  product:products(*, images:product_images(*), variants:product_variants(*))
`;

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(WISHLIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch wishlist: ${error.message}`);
  }

  return (data ?? []) as WishlistItem[];
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<WishlistItem> {
  const supabase = await createClient();

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    // Already exists, return it with product details
    const { data } = await supabase
      .from("wishlist_items")
      .select(WISHLIST_SELECT)
      .eq("id", existing.id)
      .single();

    return data as WishlistItem;
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: userId, product_id: productId })
    .select(WISHLIST_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to add to wishlist: ${error?.message}`);
  }

  return data as WishlistItem;
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    throw new Error(`Failed to remove from wishlist: ${error.message}`);
  }
}
