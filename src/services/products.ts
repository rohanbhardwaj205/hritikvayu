import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ITEMS_PER_PAGE } from "@/constants/config";
import type { Product, ProductFilters, PaginatedResponse } from "@/types";

const PRODUCT_SELECT = `
  *,
  category:categories(*),
  images:product_images(*),
  variants:product_variants(*)
`;

export async function getProducts(
  filters: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient();

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? ITEMS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  // Category filter (by slug)
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();

    if (cat) {
      query = query.eq("category_id", cat.id);
    } else {
      // No category found — return empty
      return { data: [], pagination: { page, pageSize, total: 0, totalPages: 0 } };
    }
  }

  // Price range
  if (filters.minPrice !== undefined) {
    query = query.gte("base_price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("base_price", filters.maxPrice);
  }

  // Featured filter
  if (filters.featured !== undefined) {
    query = query.eq("is_featured", filters.featured);
  }

  // Search
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Sorting
  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "popular":
      query = query.order("review_count", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  let products = (data ?? []) as Product[];

  // Post-filter by size/color if variants filter is active
  if (filters.sizes && filters.sizes.length > 0) {
    products = products.filter((p) =>
      p.variants?.some((v) => v.size && filters.sizes!.includes(v.size))
    );
  }

  if (filters.colors && filters.colors.length > 0) {
    products = products.filter((p) =>
      p.variants?.some((v) => v.color && filters.colors!.includes(v.color))
    );
  }

  const total = count ?? 0;

  return {
    data: products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

export async function getProductById(
  id: string
): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

export async function getFeaturedProducts(
  limit = 8
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch featured products: ${error.message}`);
  }

  return (data ?? []) as Product[];
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("avg_rating", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch related products: ${error.message}`);
  }

  return (data ?? []) as Product[];
}

export async function createProduct(data: {
  product: Record<string, unknown>;
  images?: Array<{ url: string; alt_text?: string; sort_order?: number; is_primary?: boolean }>;
  variants?: Array<Record<string, unknown>>;
}): Promise<Product> {
  const supabaseAdmin = createAdminClient();

  // Insert product
  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .insert(data.product)
    .select()
    .single();

  if (productError || !product) {
    throw new Error(`Failed to create product: ${productError?.message}`);
  }

  // Insert images
  if (data.images && data.images.length > 0) {
    const imagesToInsert = data.images.map((img, idx) => ({
      product_id: product.id,
      url: img.url,
      alt_text: img.alt_text ?? null,
      sort_order: img.sort_order ?? idx,
      is_primary: img.is_primary ?? idx === 0,
    }));

    const { error: imgError } = await supabaseAdmin
      .from("product_images")
      .insert(imagesToInsert);

    if (imgError) {
      throw new Error(`Failed to create product images: ${imgError.message}`);
    }
  }

  // Insert variants
  if (data.variants && data.variants.length > 0) {
    const variantsToInsert = data.variants.map((v) => ({
      ...v,
      product_id: product.id,
    }));

    const { error: varError } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsToInsert);

    if (varError) {
      throw new Error(`Failed to create product variants: ${varError.message}`);
    }
  }

  // Return with all relations
  const { data: fullProduct, error: fetchError } = await supabaseAdmin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", product.id)
    .single();

  if (fetchError || !fullProduct) {
    throw new Error(`Failed to fetch created product: ${fetchError?.message}`);
  }

  return fullProduct as Product;
}

export async function updateProduct(
  id: string,
  data: {
    product?: Record<string, unknown>;
    images?: Array<{ id?: string; url: string; alt_text?: string; sort_order?: number; is_primary?: boolean }>;
    variants?: Array<Record<string, unknown>>;
  }
): Promise<Product> {
  const supabaseAdmin = createAdminClient();

  // Update product fields
  if (data.product && Object.keys(data.product).length > 0) {
    const { error } = await supabaseAdmin
      .from("products")
      .update({ ...data.product, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Replace images if provided
  if (data.images) {
    // Delete existing images
    await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", id);

    if (data.images.length > 0) {
      const imagesToInsert = data.images.map((img, idx) => ({
        product_id: id,
        url: img.url,
        alt_text: img.alt_text ?? null,
        sort_order: img.sort_order ?? idx,
        is_primary: img.is_primary ?? idx === 0,
      }));

      const { error: imgError } = await supabaseAdmin
        .from("product_images")
        .insert(imagesToInsert);

      if (imgError) {
        throw new Error(`Failed to update product images: ${imgError.message}`);
      }
    }
  }

  // Replace variants if provided
  if (data.variants) {
    await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("product_id", id);

    if (data.variants.length > 0) {
      const variantsToInsert = data.variants.map((v) => ({
        ...v,
        product_id: id,
      }));

      const { error: varError } = await supabaseAdmin
        .from("product_variants")
        .insert(variantsToInsert);

      if (varError) {
        throw new Error(`Failed to update product variants: ${varError.message}`);
      }
    }
  }

  // Return updated product
  const { data: product, error: fetchError } = await supabaseAdmin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    throw new Error(`Failed to fetch updated product: ${fetchError?.message}`);
  }

  return product as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}
