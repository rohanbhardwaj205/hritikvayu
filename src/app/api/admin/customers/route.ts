import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCustomers, toggleBanCustomer } from "@/services/customers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;
    const search = searchParams.get("search") ?? undefined;

    const result = await getCustomers(page, search);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch customers";
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

    if (!body.id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    if (body.is_banned === undefined) {
      return NextResponse.json(
        { error: "is_banned field is required" },
        { status: 400 }
      );
    }

    const customer = await toggleBanCustomer(body.id, body.is_banned);
    return NextResponse.json({ data: customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update customer";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
