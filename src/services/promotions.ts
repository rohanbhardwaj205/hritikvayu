import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Promotion } from "@/types";

export async function getActivePromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch active promotions: ${error.message}`);
  }

  return (data ?? []) as Promotion[];
}

export async function getAllPromotions(): Promise<Promotion[]> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch promotions: ${error.message}`);
  }

  return (data ?? []) as Promotion[];
}

export async function createPromotion(
  data: Partial<Promotion>
): Promise<Promotion> {
  const supabaseAdmin = createAdminClient();

  const { data: promotion, error } = await supabaseAdmin
    .from("promotions")
    .insert(data)
    .select()
    .single();

  if (error || !promotion) {
    throw new Error(`Failed to create promotion: ${error?.message}`);
  }

  return promotion as Promotion;
}

export async function updatePromotion(
  id: string,
  data: Partial<Promotion>
): Promise<Promotion> {
  const supabaseAdmin = createAdminClient();

  const { data: promotion, error } = await supabaseAdmin
    .from("promotions")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !promotion) {
    throw new Error(`Failed to update promotion: ${error?.message}`);
  }

  return promotion as Promotion;
}

export async function deletePromotion(id: string): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("promotions")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete promotion: ${error.message}`);
  }
}
