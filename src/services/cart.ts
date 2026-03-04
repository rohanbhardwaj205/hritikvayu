import { createClient } from "@/lib/supabase/server";
import { MAX_CART_QUANTITY } from "@/constants/config";
import type { CartItem } from "@/types";

const CART_SELECT = `
  *,
  product:products(*, images:product_images(*)),
  variant:product_variants(*)
`;

export async function getCart(userId: string): Promise<CartItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cart: ${error.message}`);
  }

  return (data ?? []) as CartItem[];
}

export async function addToCart(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<CartItem> {
  const supabase = await createClient();

  // Check if item already exists in cart
  let existingQuery = supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (variantId) {
    existingQuery = existingQuery.eq("variant_id", variantId);
  } else {
    existingQuery = existingQuery.is("variant_id", null);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    // Update quantity
    const newQuantity = Math.min(existing.quantity + quantity, MAX_CART_QUANTITY);

    const { data: updated, error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select(CART_SELECT)
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update cart item: ${error?.message}`);
    }

    return updated as CartItem;
  }

  // Insert new item
  const { data: item, error } = await supabase
    .from("cart_items")
    .insert({
      user_id: userId,
      product_id: productId,
      variant_id: variantId,
      quantity: Math.min(quantity, MAX_CART_QUANTITY),
    })
    .select(CART_SELECT)
    .single();

  if (error || !item) {
    throw new Error(`Failed to add to cart: ${error?.message}`);
  }

  return item as CartItem;
}

export async function updateCartQuantity(
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartItem> {
  const supabase = await createClient();

  if (quantity <= 0) {
    await removeFromCart(userId, itemId);
    return {} as CartItem;
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity: Math.min(quantity, MAX_CART_QUANTITY),
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("user_id", userId)
    .select(CART_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to update cart quantity: ${error?.message}`);
  }

  return data as CartItem;
}

export async function removeFromCart(
  userId: string,
  itemId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to remove from cart: ${error.message}`);
  }
}

export async function clearCart(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to clear cart: ${error.message}`);
  }
}

export async function syncCart(
  userId: string,
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>
): Promise<CartItem[]> {
  const supabase = await createClient();

  // Clear existing cart
  await supabase.from("cart_items").delete().eq("user_id", userId);

  if (items.length === 0) {
    return [];
  }

  // Insert all items
  const rows = items.map((item) => ({
    user_id: userId,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    quantity: Math.min(item.quantity, MAX_CART_QUANTITY),
  }));

  const { data, error } = await supabase
    .from("cart_items")
    .insert(rows)
    .select(CART_SELECT);

  if (error) {
    throw new Error(`Failed to sync cart: ${error.message}`);
  }

  return (data ?? []) as CartItem[];
}
