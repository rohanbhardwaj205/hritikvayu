import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlatformSettings } from "@/types";

export async function GET() {
  try {
    await requireAdmin();

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("platform_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return NextResponse.json({ data: data as PlatformSettings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch settings";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    // Get existing settings to find the ID
    const { data: existing } = await supabaseAdmin
      .from("platform_settings")
      .select("id")
      .limit(1)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Platform settings not found" },
        { status: 404 }
      );
    }

    // Remove fields that should not be updated directly
    const { id: _id, created_at: _created, ...updateData } = body;

    const { data, error } = await supabaseAdmin
      .from("platform_settings")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return NextResponse.json({ data: data as PlatformSettings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update settings";

    let status = 500;
    if (message.includes("Super admin")) status = 403;
    else if (message.includes("required") || message.includes("access"))
      status = 403;

    return NextResponse.json({ error: message }, { status });
  }
}
