import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabaseAdmin = createAdminClient();

    // Get variants where stock is below low_stock_threshold
    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select(`
        *,
        product:products(id, name, slug)
      `)
      .eq("is_active", true)
      .filter("stock", "lt", "low_stock_threshold")
      .order("stock", { ascending: true });

    if (error) {
      // Fallback: if the filter doesn't work with column reference, use a raw approach
      const { data: allVariants, error: fetchError } = await supabaseAdmin
        .from("product_variants")
        .select(`
          *,
          product:products(id, name, slug)
        `)
        .eq("is_active", true)
        .order("stock", { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch inventory: ${fetchError.message}`);
      }

      const lowStock = (allVariants ?? []).filter(
        (v) => v.stock < v.low_stock_threshold
      );

      return NextResponse.json({ data: lowStock });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch inventory";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (!body.variants || !Array.isArray(body.variants)) {
      return NextResponse.json(
        { error: "variants array is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const results = [];
    const errors = [];

    for (const item of body.variants) {
      if (!item.id || item.stock === undefined) {
        errors.push({ id: item.id, error: "id and stock are required" });
        continue;
      }

      const { data, error } = await supabaseAdmin
        .from("product_variants")
        .update({
          stock: item.stock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)
        .select()
        .single();

      if (error) {
        errors.push({ id: item.id, error: error.message });
      } else {
        results.push(data);
      }
    }

    return NextResponse.json({
      data: {
        updated: results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update inventory";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
