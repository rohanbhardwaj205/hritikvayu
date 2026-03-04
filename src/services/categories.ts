import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categories = (data ?? []) as Category[];

  // Build tree: nest children under parents
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Category;
}

export async function createCategory(
  data: Partial<Category>
): Promise<Category> {
  const supabaseAdmin = createAdminClient();

  const { data: category, error } = await supabaseAdmin
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error || !category) {
    throw new Error(`Failed to create category: ${error?.message}`);
  }

  return category as Category;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  const supabaseAdmin = createAdminClient();

  const { data: category, error } = await supabaseAdmin
    .from("categories")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !category) {
    throw new Error(`Failed to update category: ${error?.message}`);
  }

  return category as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}
