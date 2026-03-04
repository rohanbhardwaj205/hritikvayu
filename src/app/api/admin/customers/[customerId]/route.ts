import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCustomerById } from "@/services/customers";

type RouteContext = { params: Promise<{ customerId: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAdmin();

    const { customerId } = await context.params;
    const customer = await getCustomerById(customerId);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: customer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch customer";
    const status = message.includes("required") || message.includes("access")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
